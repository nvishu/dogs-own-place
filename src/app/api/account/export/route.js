import { NextResponse } from 'next/server'
import connectDB, { describeDbError } from '@/lib/mongodb'
import User from '@/models/User'
import Dog from '@/models/Dog'
import Appointment from '@/models/Appointment'
import Payment from '@/models/Payment'
import Order from '@/models/Order'
import ContactMessage from '@/models/ContactMessage'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/account/export — everything we hold about the logged-in customer, as a JSON download.
export async function GET(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    await connectDB()
    const account = await User.findById(user.id).select('-password')
    if (!account) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const [dogs, appointments, payments, orders, messages] = await Promise.all([
      Dog.find({ owner: user.id }),
      Appointment.find({ user: user.id }),
      Payment.find({ user: user.id }),
      Order.find({ user: user.id }),
      ContactMessage.find({ email: account.email }),
    ])
    const body = JSON.stringify({ exportedAt: new Date().toISOString(), account, dogs, appointments, orders, payments, contactMessages: messages }, null, 2)
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="my-dogs-own-place-data.json"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('Export error:', err)
    const known = describeDbError(err)
    return NextResponse.json({ error: known?.error || 'Server error' }, { status: known?.status || 500 })
  }
}
