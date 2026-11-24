import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ProductImage from '@/models/ProductImage'
import { requireAdmin } from '@/lib/auth'
import { readJson } from '@/lib/validate'

export const dynamic = 'force-dynamic'
const MAX_BYTES = 400 * 1024

// Body: { dataUrl: "data:image/jpeg;base64,..." } — the admin page resizes photos in the browser first.
export async function POST(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    const body = await readJson(request)
    const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(body.dataUrl || ''))
    if (!m) return NextResponse.json({ error: 'Please choose a JPG, PNG or WebP image' }, { status: 400 })
    const data = Buffer.from(m[2], 'base64')
    if (data.length > MAX_BYTES) return NextResponse.json({ error: 'Image is too large after resizing (max 400 KB)' }, { status: 413 })
    await connectDB()
    const img = await ProductImage.create({ data, contentType: m[1] })
    return NextResponse.json({ success: true, url: `/api/product-image/${img._id}` }, { status: 201 })
  } catch (e) {
    console.error('POST /api/admin/products/image:', e)
    return NextResponse.json({ error: 'Could not upload the image' }, { status: 500 })
  }
}
