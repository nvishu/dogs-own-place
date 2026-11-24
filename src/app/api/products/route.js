import { NextResponse } from 'next/server'
import { getCatalogue } from '@/lib/catalogue'

export const dynamic = 'force-dynamic'

// Public: the live catalogue (prices + stock). Short CDN cache keeps the database quiet.
export async function GET() {
  const products = await getCatalogue()
  return NextResponse.json({ products }, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } })
}
