import { NextResponse } from 'next/server'
import connectDB, { describeDbError } from '@/lib/mongodb'
import Order from '@/models/Order'
import Appointment from '@/models/Appointment'
import { requireUser } from '@/lib/auth'
import { isValidId, readJson, str } from '@/lib/validate'
import { verifyPaymentSignature } from '@/lib/razorpay'
import { markOrderPaid, markAppointmentPaid } from '@/lib/payments'

export const dynamic = 'force-dynamic'

// Called by the browser right after Razorpay Checkout succeeds. The signature proves Razorpay (not the browser) says it is paid.
export async function POST(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    const b = await readJson(request)
    const kind = b.kind === 'appointment' ? 'appointment' : 'order'
    const rzOrder = str(b.razorpay_order_id, 60), rzPay = str(b.razorpay_payment_id, 60), sig = str(b.razorpay_signature, 128)
    if (!isValidId(String(b.id || '')) || !rzOrder || !rzPay || !sig) return NextResponse.json({ error: 'Invalid payment details' }, { status: 400 })
    if (!verifyPaymentSignature(rzOrder, rzPay, sig)) return NextResponse.json({ error: 'Payment could not be verified. If money was deducted, please contact us with your order number.' }, { status: 400 })

    await connectDB()
    if (kind === 'order') {
      const o = await Order.findOne({ _id: b.id, user: user.id, razorpayOrderId: rzOrder })
      if (!o) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      const r = await markOrderPaid(o._id, rzPay)
      return NextResponse.json({ success: true, order: r.order })
    }
    const a = await Appointment.findOne({ _id: b.id, user: user.id, razorpayOrderId: rzOrder })
    if (!a) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    const r = await markAppointmentPaid(a._id, { razorpayOrderId: rzOrder, razorpayPaymentId: rzPay, razorpaySignature: sig })
    return NextResponse.json({ success: true, appointment: r.appointment, txnId: rzPay })
  } catch (e) {
    console.error('razorpay/verify:', e?.message, e)
    const known = describeDbError(e)
    return NextResponse.json({ error: known?.error || 'Server error while confirming payment. If money was deducted, please contact us.' }, { status: known?.status || 500 })
  }
}
