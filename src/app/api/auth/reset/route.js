import { NextResponse } from 'next/server'
import connectDB, { describeDbError } from '@/lib/mongodb'
import User from '@/models/User'
import { readJson, rateLimit, clientIp } from '@/lib/validate'
import { consumeToken } from '@/lib/tokens'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    if (!rateLimit(`reset:${clientIp(request)}`, { limit: 10, windowMs: 60 * 60 * 1000 }).ok) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }
    const body = await readJson(request)
    const password = typeof body.password === 'string' ? body.password : ''
    if (password.length < 8 || password.length > 72) {
      return NextResponse.json({ error: 'Password must be between 8 and 72 characters' }, { status: 400 })
    }
    await connectDB()
    const token = await consumeToken(body.token, 'reset')
    if (!token) return NextResponse.json({ error: 'This reset link is invalid or has expired. Please request a new one.' }, { status: 400 })

    const user = await User.findById(token.user)
    if (!user || !user.isActive) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    user.password = password // hashed by the model's pre-save hook
    user.passwordChangedAt = new Date() // signs out every older session
    user.emailVerified = true // they proved they own the mailbox
    user.emailVerifiedAt = user.emailVerifiedAt || new Date()
    await user.save()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset error:', err?.message, err)
    const known = describeDbError(err)
    return NextResponse.json({ error: known?.error || 'Server error. Please try again.' }, { status: known?.status || 500 })
  }
}
