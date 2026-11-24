import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { PRODUCTS } from '@/lib/products'

export const dynamic = 'force-dynamic'

// One-click: copies the 33 starter products (src/lib/products.js) into the database so you can edit them in the admin panel.
// Only runs while the products collection is empty. Starter stock is 20 per pack size — adjust it afterwards.
export async function POST(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    if ((await Product.estimatedDocumentCount()) > 0) {
      return NextResponse.json({ error: 'Your catalogue already has products. Import is only for an empty catalogue.' }, { status: 409 })
    }
    const docs = PRODUCTS.map((p) => ({ ...p, active: true, variants: p.variants.map((v) => ({ ...v, stock: 20 })) }))
    await Product.insertMany(docs)
    revalidatePath('/shop')
    return NextResponse.json({ success: true, imported: docs.length })
  } catch (e) {
    console.error('POST /api/admin/products/import:', e)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
