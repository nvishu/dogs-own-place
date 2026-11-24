import { NextResponse } from 'next/server'
import { razorpayEnabled } from '@/lib/razorpay'

export const dynamic = 'force-dynamic'

// What payment options are live. Never exposes any key.
export async function GET() {
  return NextResponse.json({ razorpay: razorpayEnabled(), mock: process.env.ALLOW_MOCK_PAYMENTS !== 'false' })
}
