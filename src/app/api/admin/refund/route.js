import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/auth'
import { isValidId, readJson } from '@/lib/validate'
import { razorpayEnabled, refundRazorpayPayment } from '@/lib/razorpay'

export const dynamic = 'force-dynamic'

// POST { orderId } — refunds a PAID online order in full through Razorpay and marks it refunded.
export async function POST(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    if (!razorpayEnabled()) return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 503 })
    const body = await readJson(request)
    if (!isValidId(String(body.orderId || ''))) return NextResponse.json({ error: 'Invalid order' }, { status: 400 })
    await connectDB()
    const order = await Order.findById(body.orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.paymentMethod !== 'online' || !order.razorpayPaymentId || !['paid', 'refund_pending'].includes(order.paymentStatus)) {
      return NextResponse.json({ error: 'This order has no online payment to refund' }, { status: 400 })
    }
    // claim first so a double click cannot refund twice
    const claimed = await Order.findOneAndUpdate({ _id: order._id, paymentStatus: { $in: ['paid', 'refund_pending'] } }, { $set: { paymentStatus: 'refunded', refundedAt: new Date() } }, { new: true })
    if (!claimed) return NextResponse.json({ error: 'Already refunded' }, { status: 409 })
    try {
      const refund = await refundRazorpayPayment(order.razorpayPaymentId, order.total, { orderNo: order.orderNo })
      await Order.updateOne({ _id: order._id }, { $set: { refundId: refund.id || '' } })
      return NextResponse.json({ success: true, refundId: refund.id })
    } catch (e) {
      await Order.updateOne({ _id: order._id }, { $set: { paymentStatus: order.paymentStatus, refundedAt: null } }) // undo the claim
      console.error('refund failed:', e?.message)
      return NextResponse.json({ error: `Razorpay refused the refund: ${e.message}` }, { status: 502 })
    }
  } catch (e) {
    console.error('POST /api/admin/refund:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
