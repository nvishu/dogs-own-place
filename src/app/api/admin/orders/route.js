import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/auth'
import { readJson, isValidId, str } from '@/lib/validate'
import { releaseStock } from '@/lib/catalogue'
import { notifyOrderStatus } from '@/lib/notify'
import { expirePendingOrders } from '@/lib/payments'

export const dynamic = 'force-dynamic'
const STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']

export async function GET(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    await expirePendingOrders().catch(() => {})
    // Unpaid online orders (status "pending_payment") are not real orders yet, so they are not listed here.
    const orders = await Order.find({ status: { $ne: 'pending_payment' } }).sort({ createdAt: -1 }).limit(300).populate('user', 'name email phone')
    const unseen = orders.filter((o) => !o.seenByAdmin).map((o) => o._id)
    if (new URL(request.url).searchParams.get('markSeen') === '1' && unseen.length) {
      await Order.updateMany({ _id: { $in: unseen } }, { $set: { seenByAdmin: true } })
    }
    return NextResponse.json({ orders, newOrders: unseen.length })
  } catch (err) {
    console.error('GET /api/admin/orders:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    const body = await readJson(request)
    if (!isValidId(String(body.orderId || ''))) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    if (body.status !== undefined && !STATUSES.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    await connectDB()

    const order = await Order.findById(body.orderId).populate('user', 'name email')
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (order.status === 'cancelled' && body.status && body.status !== 'cancelled') {
      return NextResponse.json({ error: 'A cancelled order cannot be reopened. Ask the customer to place a new order.' }, { status: 409 })
    }

    const set = { seenByAdmin: true }
    if (body.courier !== undefined) set.courier = str(body.courier, 80)
    if (body.trackingNo !== undefined) set.trackingNo = str(body.trackingNo, 80)
    let restock = false
    if (body.status) {
      set.status = body.status
      if (body.status === 'delivered' && order.paymentMethod === 'cod') set.paymentStatus = 'paid' // cash collected
      if (body.status === 'cancelled' && order.status !== 'cancelled') {
        set.cancelledBy = 'admin'; set.cancelledAt = new Date()
        if (order.paymentMethod === 'online' && order.paymentStatus === 'paid') set.paymentStatus = 'refund_pending'
        restock = order.stockReserved
        if (restock) set.stockReserved = false
      }
    }
    const updated = await Order.findByIdAndUpdate(order._id, { $set: set }, { new: true })
    if (restock) await releaseStock(order.items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty }))).catch((e) => console.error('restock failed', e?.message))
    if (body.status && body.status !== order.status) await notifyOrderStatus(updated, order.user?.email)
    return NextResponse.json({ success: true, order: updated })
  } catch (err) {
    console.error('PATCH /api/admin/orders:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
