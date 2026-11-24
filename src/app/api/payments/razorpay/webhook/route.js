import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Appointment from '@/models/Appointment'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { markOrderPaid, markAppointmentPaid } from '@/lib/payments'

export const dynamic = 'force-dynamic'

// Razorpay → us. Confirms payments even if the customer closed the tab after paying.
// Dashboard → Webhooks → URL: https://YOUR-SITE/api/payments/razorpay/webhook, events: payment.captured, order.paid, secret = RAZORPAY_WEBHOOK_SECRET
export async function POST(request) {
  const raw = await request.text() // must be the exact raw body for the signature check
  if (!verifyWebhookSignature(raw, request.headers.get('x-razorpay-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  try {
    const evt = JSON.parse(raw)
    if (!['payment.captured', 'order.paid'].includes(evt.event)) return NextResponse.json({ ok: true, ignored: true })
    const pay = evt.payload?.payment?.entity
    const rzOrderId = pay?.order_id || evt.payload?.order?.entity?.id
    const rzPayId = pay?.id
    if (!rzOrderId || !rzPayId) return NextResponse.json({ ok: true, ignored: true })

    await connectDB()
    const order = await Order.findOne({ razorpayOrderId: rzOrderId })
    if (order) { await markOrderPaid(order._id, rzPayId); return NextResponse.json({ ok: true }) }
    const appt = await Appointment.findOne({ razorpayOrderId: rzOrderId })
    if (appt) { await markAppointmentPaid(appt._id, { razorpayOrderId: rzOrderId, razorpayPaymentId: rzPayId, method: pay?.method || 'razorpay' }); return NextResponse.json({ ok: true }) }
    return NextResponse.json({ ok: true, unmatched: true })
  } catch (e) {
    console.error('razorpay/webhook:', e?.message, e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) // Razorpay retries on non-2xx
  }
}
