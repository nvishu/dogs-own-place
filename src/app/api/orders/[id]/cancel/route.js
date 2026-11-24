import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'
import { requireUser } from '@/lib/auth'
import { isValidId, readJson, str } from '@/lib/validate'
import { releaseStock } from '@/lib/catalogue'
import { notifyOrderCancelled } from '@/lib/notify'

export const dynamic = 'force-dynamic'

// POST /api/orders/[id]/cancel — customers can cancel until the order is shipped.
export async function POST(request, { params }) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    if (!isValidId(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await readJson(request)
    await connectDB()

    const existing = await Order.findOne({ _id: params.id, user: user.id })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const paidOnline = existing.paymentMethod === 'online' && existing.paymentStatus === 'paid'

    // Atomic: only one request can win, and only while the order has not shipped
    const order = await Order.findOneAndUpdate(
      { _id: existing._id, status: { $in: ['pending_payment', 'placed', 'confirmed'] } },
      { $set: { status: 'cancelled', cancelledBy: 'customer', cancelReason: str(body.reason, 300), cancelledAt: new Date(), seenByAdmin: false, ...(paidOnline ? { paymentStatus: 'refund_pending' } : {}) } },
      { new: true },
    )
    if (!order) return NextResponse.json({ error: 'This order can no longer be cancelled because it is already on its way or finished. Please contact us.' }, { status: 409 })

    if (order.stockReserved) {
      await releaseStock(order.items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty }))).catch((e) => console.error('restock failed', e?.message))
      await Order.updateOne({ _id: order._id }, { $set: { stockReserved: false } })
    }
    if (order.status === 'cancelled' && order.paymentMethod === 'online' && order.paymentStatus === 'unpaid') { /* nothing was paid */ }
    const customer = await User.findById(user.id).select('name email phone')
    if (existing.status !== 'pending_payment') await notifyOrderCancelled(order, customer, paidOnline)
    return NextResponse.json({ success: true, order })
  } catch (e) {
    console.error('POST /api/orders/[id]/cancel:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
