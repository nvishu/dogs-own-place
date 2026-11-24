import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Appointment from '@/models/Appointment'
import Payment from '@/models/Payment'
import User from '@/models/User'
import { notifyOrder, notifyPaymentProblem } from '@/lib/notify'
import { reserveStock, releaseStock, usingDatabaseCatalogue } from '@/lib/catalogue'

const stockLines = (o) => o.items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty }))

/** Online orders that were never paid within 30 minutes are cancelled and their stock released. Safe to call often. */
export async function expirePendingOrders() {
  await connectDB()
  const stale = await Order.find({ status: 'pending_payment', paymentStatus: 'unpaid', expiresAt: { $lt: new Date() } }).limit(50)
  for (const o of stale) {
    const claimed = await Order.findOneAndUpdate(
      { _id: o._id, status: 'pending_payment' },
      { $set: { status: 'cancelled', cancelledBy: 'system', cancelReason: 'payment_timeout', cancelledAt: new Date() } },
      { new: true },
    )
    if (claimed?.stockReserved) { await releaseStock(stockLines(claimed)).catch(() => {}); await Order.updateOne({ _id: o._id }, { $set: { stockReserved: false } }) }
  }
  return stale.length
}

/** Idempotent: called from the browser callback AND the webhook; only the first call does the work. */
export async function markOrderPaid(orderId, razorpayPaymentId) {
  await connectDB()
  const paid = await Order.findOneAndUpdate(
    { _id: orderId, paymentStatus: 'unpaid', status: 'pending_payment' },
    { $set: { paymentStatus: 'paid', status: 'placed', paidAt: new Date(), razorpayPaymentId } },
    { new: true },
  )
  if (paid) {
    const customer = await User.findById(paid.user).select('name email')
    await notifyOrder(paid, customer)
    return { order: paid, first: true }
  }
  // Already handled — or the payment arrived AFTER we cancelled the order (customer paid late).
  const o = await Order.findById(orderId)
  if (o && o.status === 'cancelled' && o.paymentStatus === 'unpaid' && o.cancelReason === 'payment_timeout') {
    let revived = false
    try { revived = !(await usingDatabaseCatalogue()) || (await reserveStock(stockLines(o))) } catch {}
    if (revived) {
      const back = await Order.findOneAndUpdate({ _id: o._id, status: 'cancelled', paymentStatus: 'unpaid' }, { $set: { status: 'placed', paymentStatus: 'paid', paidAt: new Date(), razorpayPaymentId, stockReserved: true, cancelledBy: '', cancelReason: '' } }, { new: true })
      if (back) { await notifyOrder(back, await User.findById(back.user).select('name email')); return { order: back, first: true } }
    } else {
      await Order.updateOne({ _id: o._id }, { $set: { paymentStatus: 'refund_pending', razorpayPaymentId, paidAt: new Date() } })
      await notifyPaymentProblem(`Late payment for order ${o.orderNo} (₹${o.total}) but the items are no longer in stock. Please refund payment ${razorpayPaymentId} from Admin → Orders.`)
    }
  }
  return { order: o, first: false }
}

export async function markAppointmentPaid(appointmentId, { razorpayOrderId, razorpayPaymentId, razorpaySignature = '', method = 'razorpay' }) {
  await connectDB()
  const claimed = await Appointment.findOneAndUpdate(
    { _id: appointmentId, paymentStatus: 'unpaid' },
    { $set: { paymentStatus: 'paid' } },
    { new: true },
  )
  if (!claimed) return { appointment: await Appointment.findById(appointmentId), first: false }
  try {
    const payment = await Payment.create({
      user: claimed.user, appointment: claimed._id, amount: claimed.price, method: 'razorpay', status: 'success',
      razorpayOrderId, razorpayPaymentId, razorpaySignature, txnId: razorpayPaymentId, paidAt: new Date(), notes: method,
    })
    await Appointment.updateOne({ _id: claimed._id }, { $set: { paymentId: payment._id } })
  } catch (e) {
    console.error('markAppointmentPaid: payment record failed (booking is still marked paid):', e?.message)
  }
  return { appointment: claimed, first: true }
}
