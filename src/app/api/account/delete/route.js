import { NextResponse } from 'next/server'
import connectDB, { describeDbError } from '@/lib/mongodb'
import User from '@/models/User'
import Dog from '@/models/Dog'
import Appointment from '@/models/Appointment'
import ContactMessage from '@/models/ContactMessage'
import Order from '@/models/Order'
import { requireUser, clearAuthCookie } from '@/lib/auth'
import { readJson, rateLimit, clientIp } from '@/lib/validate'

export const dynamic = 'force-dynamic'

// POST /api/account/delete { password } — permanently deletes the account and the personal data we do not
// need to keep by law. Order and payment records are kept for tax/accounting (as stated in the Privacy Policy);
// the delivery details on old orders are blanked out so they no longer identify the person.
export async function POST(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error

    const rl = rateLimit(`delete:${user.id}:${clientIp(request)}`, { limit: 5, windowMs: 60 * 60 * 1000 })
    if (!rl.ok) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })

    const body = await readJson(request)
    const password = typeof body.password === 'string' ? body.password : ''
    if (!password) return NextResponse.json({ error: 'Please enter your password to confirm' }, { status: 400 })

    await connectDB()
    const account = await User.findById(user.id)
    if (!account) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!(await account.comparePassword(password))) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 403 })
    }

    const hasOpenOrder = await Order.exists({ user: user.id, status: { $in: ['placed', 'confirmed', 'shipped'] } })
    if (hasOpenOrder) {
      return NextResponse.json({ error: 'You have an order that is still being processed. Please wait until it is delivered or cancelled, then delete your account.' }, { status: 409 })
    }

    await Promise.all([
      Dog.deleteMany({ owner: user.id }),
      Appointment.deleteMany({ user: user.id }),
      ContactMessage.deleteMany({ email: account.email }),
      Order.updateMany({ user: user.id }, { $set: { 'shipping.name': 'Deleted customer', 'shipping.phone': '0000000000', 'shipping.address': 'Removed at customer request', notes: '' } }),
    ])
    await User.deleteOne({ _id: user.id })
    return clearAuthCookie(NextResponse.json({ success: true }))
  } catch (err) {
    console.error('Delete account error:', err)
    const known = describeDbError(err)
    return NextResponse.json({ error: known?.error || 'Server error' }, { status: known?.status || 500 })
  }
}
