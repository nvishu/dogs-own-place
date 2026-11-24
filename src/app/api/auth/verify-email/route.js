import { NextResponse } from 'next/server'
import connectDB, { describeDbError } from '@/lib/mongodb'
import User from '@/models/User'
import { readJson, rateLimit, clientIp } from '@/lib/validate'
import { consumeToken } from '@/lib/tokens'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    if (!rateLimit(`verify:${clientIp(request)}`, { limit: 20, windowMs: 60 * 60 * 1000 }).ok) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }
    const body = await readJson(request)
    await connectDB()
    const token = await consumeToken(body.token, 'verify')
    if (!token) return NextResponse.json({ error: 'This verification link is invalid or has expired.' }, { status: 400 })
    await User.updateOne({ _id: token.user }, { $set: { emailVerified: true, emailVerifiedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Verify email error:', err?.message, err)
    const known = describeDbError(err)
    return NextResponse.json({ error: known?.error || 'Server error. Please try again.' }, { status: known?.status || 500 })
  }
}
