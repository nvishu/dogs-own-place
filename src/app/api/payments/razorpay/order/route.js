import { NextResponse } from 'next/server'
import connectDB, { describeDbError } from '@/lib/mongodb'
import Order from '@/models/Order'
import Appointment from '@/models/Appointment'
import User from '@/models/User'
import { requireUser } from '@/lib/auth'
import { isValidId, readJson, rateLimit } from '@/lib/validate'
import { razorpayEnabled, razorpayKeyId, createRazorpayOrder } from '@/lib/razorpay'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

// POST { kind: "order" | "appointment", id } → creates (or reuses) a Razorpay order for what is owed.
// The amount is read from OUR database, never from the browser.
export async function POST(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    if (!razorpayEnabled()) return NextResponse.json({ error: 'Online payment is not available right now' }, { status: 503 })
    if (!rateLimit(`rzp-order:${user.id}`, { limit: 20, windowMs: 10 * 60 * 1000 }).ok) {
      return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 })
    }
    const body = await readJson(request)
    const kind = body.kind === 'appointment' ? 'appointment' : 'order'
    if (!isValidId(String(body.id || ''))) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    await connectDB()

    let doc, amount, receipt, description
    if (kind === 'order') {
      doc = await Order.findOne({ _id: body.id, user: user.id })
      if (!doc) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      if (doc.paymentMethod !== 'online' || doc.status !== 'pending_payment' || doc.paymentStatus !== 'unpaid') {
        return NextResponse.json({ error: 'This order is not waiting for payment' }, { status: 409 })
      }
      if (doc.expiresAt && doc.expiresAt < new Date()) return NextResponse.json({ error: 'This order expired. Please place it again.' }, { status: 410 })
      amount = doc.total; receipt = doc.orderNo; description = `Order ${doc.orderNo}`
    } else {
      doc = await Appointment.findOne({ _id: body.id, user: user.id })
      if (!doc) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      if (doc.status === 'cancelled') return NextResponse.json({ error: 'Cancelled bookings cannot be paid' }, { status: 400 })
      if (doc.paymentStatus === 'paid') return NextResponse.json({ error: 'This booking is already paid' }, { status: 409 })
      amount = doc.price; receipt = `appt_${String(doc._id).slice(-12)}`; description = `${doc.serviceName} · ${doc.date}`
    }

    let rzOrderId = doc.razorpayOrderId
    if (!rzOrderId) {
      const created = await createRazorpayOrder({ amountRupees: amount, receipt, notes: { kind, id: String(doc._id) } })
      rzOrderId = created.id
      await (kind === 'order' ? Order : Appointment).updateOne({ _id: doc._id }, { $set: { razorpayOrderId: rzOrderId } })
    }
    const u = await User.findById(user.id).select('name email phone')
    return NextResponse.json({
      keyId: razorpayKeyId(), razorpayOrderId: rzOrderId, amount: Math.round(amount * 100), currency: 'INR',
      name: SITE.name, description, prefill: { name: u?.name || '', email: u?.email || '', contact: u?.phone || '' },
    })
  } catch (e) {
    console.error('razorpay/order:', e?.message, e)
    const known = describeDbError(e)
    return NextResponse.json({ error: known?.error || 'Could not start the payment. Please try again.' }, { status: known?.status || 502 })
  }
}
