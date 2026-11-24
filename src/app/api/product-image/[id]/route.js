import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ProductImage from '@/models/ProductImage'
import { isValidId } from '@/lib/validate'

export const dynamic = 'force-dynamic'

export async function GET(_request, { params }) {
  try {
    if (!isValidId(params.id)) return new NextResponse('Not found', { status: 404 })
    await connectDB()
    const img = await ProductImage.findById(params.id).lean()
    if (!img) return new NextResponse('Not found', { status: 404 })
    return new NextResponse(img.data.buffer ? Buffer.from(img.data.buffer) : Buffer.from(img.data), {
      headers: { 'Content-Type': img.contentType, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
    })
  } catch (e) {
    console.error('product-image:', e?.message)
    return new NextResponse('Server error', { status: 500 })
  }
}
