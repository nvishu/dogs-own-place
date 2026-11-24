import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { readJson } from '@/lib/validate'
import { cleanProductInput, slugify } from '@/lib/productInput'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    const products = await Product.find().sort({ brand: 1, name: 1 }).lean()
    return NextResponse.json({ products })
  } catch (e) {
    console.error('GET /api/admin/products:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    const body = await readJson(request)
    const { value, error: bad } = cleanProductInput(body)
    if (bad) return NextResponse.json({ error: bad }, { status: 400 })
    await connectDB()
    let slug = slugify(`${value.brand} ${value.name}`) || 'product'
    for (let i = 2; await Product.exists({ slug }); i++) slug = `${slugify(`${value.brand} ${value.name}`).slice(0, 74)}-${i}`
    const product = await Product.create({ ...value, slug, active: value.active ?? true })
    revalidatePath('/shop'); revalidatePath('/shop/[slug]', 'page')
    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (e) {
    console.error('POST /api/admin/products:', e)
    return NextResponse.json({ error: 'Could not save the product' }, { status: 500 })
  }
}
