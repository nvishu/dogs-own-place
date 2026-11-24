import { NextResponse } from 'next/server'
import connectDB, { describeDbError } from '@/lib/mongodb'
import User from '@/models/User'
import { readJson, str, rateLimit, clientIp, EMAIL_RE } from '@/lib/validate'
import { issueReset } from '@/lib/accountMail'

export const dynamic = 'force-dynamic'

// Always answers the same way, so nobody can use this form to discover which emails have accounts.
const OK = { success: true, message: 'If an account exists for that email, a reset link has been sent. It is valid for 1 hour.' }

export async function POST(request) {
  try {
    const ip = clientIp(request)
    if (!rateLimit(`forgot-ip:${ip}`, { limit: 8, windowMs: 60 * 60 * 1000 }).ok) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }
    const body = await readJson(request)
    const email = str(body.email, 254).toLowerCase()
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    if (!rateLimit(`forgot-email:${email}`, { limit: 3, windowMs: 60 * 60 * 1000 }).ok) return NextResponse.json(OK)

    await connectDB()
    const user = await User.findOne({ email, isActive: true, role: 'user' })
    if (user) {
      const sent = await issueReset(user)
      if (!sent) console.error('Password reset email could NOT be sent — is RESEND_API_KEY set and the sender domain verified?')
    }
    return NextResponse.json(OK)
  } catch (err) {
    console.error('Forgot error:', err?.message, err)
    const known = describeDbError(err)
    return NextResponse.json({ error: known?.error || 'Server error. Please try again.' }, { status: known?.status || 500 })
  }
}
