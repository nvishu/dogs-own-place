import { NextResponse } from 'next/server'
import connectDB, { describeDbError } from '@/lib/mongodb'
import User from '@/models/User'
import { requireUser } from '@/lib/auth'
import { rateLimit } from '@/lib/validate'
import { issueVerification } from '@/lib/accountMail'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    if (!rateLimit(`resend:${user.id}`, { limit: 3, windowMs: 60 * 60 * 1000 }).ok) {
      return NextResponse.json({ error: 'Please wait a little before asking for another email.' }, { status: 429 })
    }
    await connectDB()
    const account = await User.findById(user.id)
    if (!account) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (account.emailVerified) return NextResponse.json({ success: true, alreadyVerified: true })
    const sent = await issueVerification(account)
    if (!sent) return NextResponse.json({ error: 'We could not send the email right now. Please try again later.' }, { status: 503 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Resend verification error:', err?.message, err)
    const known = describeDbError(err)
    return NextResponse.json({ error: known?.error || 'Server error' }, { status: known?.status || 500 })
  }
}
