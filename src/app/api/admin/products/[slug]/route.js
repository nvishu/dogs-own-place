import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { readJson } from '@/lib/validate'
import { cleanProductInput } from '@/lib/productInput'

export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    const body = await readJson(request)
    const { value, error: bad } = cleanProductInput(body, { partial: true })
    if (bad) return NextResponse.json({ error: bad }, { status: 400 })
    await connectDB()
    const product = await Product.findOneAndUpdate({ slug: params.slug }, { $set: value }, { new: true, runValidators: true })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    revalidatePath('/shop'); revalidatePath('/shop/[slug]', 'page')
    return NextResponse.json({ success: true, product })
  } catch (e) {
    console.error('PATCH /api/admin/products/[slug]:', e)
    return NextResponse.json({ error: 'Could not save the product' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    const r = await Product.deleteOne({ slug: params.slug })
    if (r.deletedCount !== 1) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    revalidatePath('/shop'); revalidatePath('/shop/[slug]', 'page')
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/products/[slug]:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
