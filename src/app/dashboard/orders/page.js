'use client'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductImage from '@/components/shop/ProductImage'
import { inr } from '@/components/shop/ProductCard'
import { apiGetMe, apiGetOrders, apiCancelOrder } from '@/lib/apiClient'
import { payOnline } from '@/lib/payFlow'

const STATUS = {
  pending_payment: { label: 'Awaiting payment', cls: 'bg-orange-100 text-orange-700' },
  placed:    { label: 'Order placed', cls: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed',    cls: 'bg-blue-100 text-blue-700' },
  shipped:   { label: 'Out for delivery', cls: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered',    cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled',    cls: 'bg-red-100 text-red-600' },
}
const STEPS = ['placed', 'confirmed', 'shipped', 'delivered']
const payLabel = (o) => {
  if (o.paymentStatus === 'refunded') return 'Refunded'
  if (o.paymentStatus === 'refund_pending') return 'Refund in progress'
  if (o.paymentMethod === 'online') return o.paymentStatus === 'paid' ? 'Paid online' : 'Payment pending'
  return o.paymentStatus === 'paid' ? 'Paid (cash)' : 'Cash on delivery'
}

function Orders() {
  const router = useRouter()
  const params = useSearchParams()
  const placed = params.get('placed')
  const unpaid = params.get('unpaid')
  const payfail = params.get('payfail')
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  const load = useCallback(() => apiGetOrders().then((d) => setOrders(d.orders || [])), [])

  useEffect(() => {
    apiGetMe().then(({ user }) => {
      if (user.role === 'admin') return router.replace('/admin/orders')
      return load()
    }).catch((e) => {
      if (/auth|login|unauthor|token/i.test(e.message || '') || e.message === 'Request failed') router.replace('/auth/login?next=/dashboard/orders')
      else setError(e.message)
    })
  }, [router, load])

  const payNow = async (o) => {
    setBusy(o._id)
    try { await payOnline('order', o._id); toast.success('Payment received — thank you!'); await load() }
    catch (e) { if (!e.dismissed) toast.error(e.message || 'Payment failed') }
    finally { setBusy('') }
  }
  const cancel = async (o) => {
    if (!confirm(`Cancel order ${o.orderNo}?${o.paymentStatus === 'paid' ? ' Your online payment will be refunded.' : ''}`)) return
    setBusy(o._id)
    try { await apiCancelOrder(o._id, 'Cancelled by customer'); toast.success('Order cancelled'); await load() }
    catch (e) { toast.error(e.message) } finally { setBusy('') }
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16 max-w-4xl">
        <Link href="/dashboard" className="text-brand-primary text-sm font-semibold hover:underline">← Dashboard</Link>
        <h1 className="font-display text-3xl font-bold text-brand-dark mt-2 mb-6">🛍️ My Orders</h1>

        {placed && (
          <div role="status" className="rounded-2xl p-6 mb-8 text-white" style={{ background: 'linear-gradient(135deg,#2F8F4E,#1f6b3a)' }}>
            <div className="text-3xl mb-1">🎉 Order placed!</div>
            <p className="text-white/90">Thank you! Your order <b>{placed}</b> has been received. We&apos;ll confirm it shortly.</p>
          </div>
        )}
        {unpaid && (
          <div role="alert" className="rounded-2xl p-5 mb-8 bg-orange-50 border border-orange-200 text-orange-800">
            <b>Payment not completed for order {unpaid}.</b> {payfail ? 'The payment did not go through. ' : ''}We&apos;re holding your items for 30 minutes — use <b>Pay now</b> below to finish, or cancel the order.
          </div>
        )}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">⚠️ {error}</div>}

        {orders === null && !error ? (
          <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="card h-40 animate-pulse" />)}</div>
        ) : orders?.length === 0 ? (
          <div className="card text-center py-14">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-bold text-brand-dark mb-4">No orders yet</p>
            <Link href="/shop" className="btn-primary px-8 py-3">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders?.map((o) => {
              const idx = STEPS.indexOf(o.status)
              const canCancel = ['pending_payment', 'placed', 'confirmed'].includes(o.status)
              return (
                <div key={o._id} className={`card p-5 ${o.orderNo === placed ? 'ring-2 ring-green-500' : ''}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                    <div>
                      <div className="font-bold text-brand-dark">Order {o.orderNo}</div>
                      <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS[o.status]?.cls}`}>{STATUS[o.status]?.label || o.status}</span>
                  </div>
                  {STEPS.includes(o.status) && (
                    <ol className="flex items-center gap-1 mb-5" aria-label="Order progress">
                      {STEPS.map((s, i) => (
                        <li key={s} className="flex-1 flex flex-col items-center text-center">
                          <div className={`w-full h-1.5 rounded-full ${i <= idx ? 'bg-brand-primary' : 'bg-orange-100'}`} />
                          <span className={`text-[11px] mt-1.5 font-semibold ${i <= idx ? 'text-brand-primary' : 'text-gray-400'}`}>{STATUS[s].label}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {(o.courier || o.trackingNo) && o.status !== 'cancelled' && (
                    <div className="bg-purple-50 text-purple-800 text-sm rounded-xl px-4 py-2.5 mb-4">🚚 <b>{o.courier || 'Courier'}</b>{o.trackingNo ? ` · Tracking no. ${o.trackingNo}` : ''}</div>
                  )}
                  <ul className="space-y-3">
                    {o.items.map((i) => (
                      <li key={`${i.slug}|${i.size}`} className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-lg bg-brand-light overflow-hidden flex-shrink-0"><ProductImage src={i.image} alt="" className="w-full h-full object-contain" /></div>
                        <div className="flex-1 min-w-0 text-sm"><Link href={`/shop/${i.slug}`} className="font-semibold text-brand-dark hover:text-brand-primary line-clamp-1">{i.brand} {i.name}</Link><div className="text-gray-500">{i.size} × {i.qty}</div></div>
                        <div className="text-sm font-semibold">{inr(i.price * i.qty)}</div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-orange-100 flex flex-wrap justify-between gap-3 text-sm">
                    <div className="text-gray-600 max-w-md"><b className="text-brand-dark">Deliver to:</b> {o.shipping?.name}, {o.shipping?.address}, {o.shipping?.city} – {o.shipping?.pincode}</div>
                    <div className="text-right"><div className="font-display font-bold text-xl text-brand-primary">{inr(o.total)}</div><div className="text-xs text-gray-500">{payLabel(o)}</div></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {o.status === 'pending_payment' && <button onClick={() => payNow(o)} disabled={busy === o._id} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">{busy === o._id ? 'Please wait…' : `💳 Pay now ${inr(o.total)}`}</button>}
                    {canCancel && <button onClick={() => cancel(o)} disabled={busy === o._id} className="text-sm font-bold text-red-600 border-2 border-red-200 rounded-full px-5 py-2 hover:bg-red-50 disabled:opacity-60">Cancel order</button>}
                    {!['pending_payment', 'cancelled'].includes(o.status) && <Link href={`/invoice/${o._id}`} target="_blank" className="text-sm font-bold text-brand-primary border-2 border-orange-200 rounded-full px-5 py-2 hover:bg-brand-light">🧾 Invoice</Link>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function OrdersPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-4xl animate-bounce">🐾</div>}><Orders /></Suspense>
}
