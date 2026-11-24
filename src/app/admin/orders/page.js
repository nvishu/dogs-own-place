'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { apiGetMe, apiAdminOrders, apiAdminUpdateOrder, apiAdminRefundOrder } from '@/lib/apiClient'
import { inr } from '@/components/shop/ProductCard'

const STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']
const COLORS = { placed: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600' }
const PAY = { paid: ['Paid', 'bg-green-100 text-green-700'], unpaid: ['Unpaid', 'bg-gray-100 text-gray-600'], refund_pending: ['Refund needed', 'bg-red-100 text-red-700'], refunded: ['Refunded', 'bg-blue-100 text-blue-700'] }

export default function AdminOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState(null)
  const [filter, setFilter] = useState('all')
  const [track, setTrack] = useState({}) // { [orderId]: { courier, trackingNo } }

  const load = useCallback(async (markSeen = false) => {
    try { const d = await apiAdminOrders(markSeen); setOrders(d.orders || []); return d } catch (e) { toast.error(e.message || 'Could not load orders') }
  }, [])

  useEffect(() => {
    apiGetMe().then(({ user }) => { if (user.role !== 'admin') return router.replace('/dashboard'); load(true) })
      .catch(() => router.replace('/auth/login?next=/admin/orders'))
  }, [router, load])

  useEffect(() => {
    const t = setInterval(async () => {
      const d = await load(false)
      if (d?.newOrders > 0) { toast.success(`🛒 ${d.newOrders} new order${d.newOrders > 1 ? 's' : ''}!`, { duration: 8000 }); load(true) }
    }, 30000)
    return () => clearInterval(t)
  }, [load])

  const update = async (id, fields, okMsg) => {
    try { await apiAdminUpdateOrder(id, fields); toast.success(okMsg || 'Updated'); await load() } catch (e) { toast.error(e.message) }
  }
  const setStatus = (o, status) => {
    if (status === 'cancelled' && !confirm(`Cancel order ${o.orderNo}? Stock will be put back.${o.paymentMethod === 'online' && o.paymentStatus === 'paid' ? ' It was paid online, so you will need to refund it.' : ''}`)) return
    update(o._id, { status, ...(status === 'shipped' ? track[o._id] || {} : {}) }, `Order marked ${status}`)
  }
  const refund = async (o) => {
    if (!confirm(`Refund ${inr(o.total)} to the customer through Razorpay?`)) return
    try { await apiAdminRefundOrder(o._id); toast.success('Refund started'); await load() } catch (e) { toast.error(e.message) }
  }

  const shown = (orders || []).filter((o) => filter === 'all' || o.status === filter)
  const revenue = (orders || []).filter((o) => o.paymentStatus === 'paid' && o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const refundsNeeded = (orders || []).filter((o) => o.paymentStatus === 'refund_pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-dark text-white px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="font-display font-bold text-lg">🛒 Shop Orders</div>
        <Link href="/admin" className="text-sm font-semibold text-amber-300 hover:underline">← Admin panel</Link>
      </header>
      <main className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[['Total orders', orders?.length ?? '…'], ['New / placed', (orders || []).filter((o) => o.status === 'placed').length], ['Refunds needed', refundsNeeded], ['Paid revenue', inr(revenue)]].map(([k, v]) => (
            <div key={k} className={`rounded-2xl p-4 border ${k === 'Refunds needed' && refundsNeeded > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-orange-100'}`}><div className="text-xs text-gray-500 font-semibold">{k}</div><div className="font-display font-bold text-2xl text-brand-dark">{v}</div></div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap mb-5">
          {['all', ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border ${filter === s ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white border-orange-200 text-brand-dark'}`}>{s}</button>
          ))}
        </div>

        {orders === null ? <div className="bg-white rounded-2xl h-40 animate-pulse" /> : shown.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500">No orders here yet.</div>
        ) : (
          <div className="space-y-4">
            {shown.map((o) => {
              const t = track[o._id] || { courier: o.courier || '', trackingNo: o.trackingNo || '' }
              const pay = PAY[o.paymentStatus] || PAY.unpaid
              return (
                <div key={o._id} className="bg-white rounded-2xl p-5 border border-orange-100">
                  <div className="flex flex-wrap justify-between gap-3 mb-3">
                    <div>
                      <div className="font-bold text-brand-dark">{o.orderNo} <span className={`ml-2 text-xs px-2.5 py-1 rounded-full font-bold ${COLORS[o.status]}`}>{o.status}</span> <span className={`ml-1 text-xs px-2.5 py-1 rounded-full font-bold ${pay[1]}`}>{o.paymentMethod === 'online' ? 'Online' : 'COD'} · {pay[0]}</span></div>
                      <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                    </div>
                    <div className="text-right"><div className="font-display font-bold text-xl text-brand-primary">{inr(o.total)}</div><Link href={`/invoice/${o._id}`} target="_blank" className="text-xs text-brand-primary font-semibold hover:underline">🧾 Invoice</Link></div>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 mb-3">
                    {o.items.map((i) => <li key={`${i.slug}|${i.size}`}>{i.qty} × {i.brand} {i.name} <span className="text-gray-400">({i.size})</span> — {inr(i.price * i.qty)}</li>)}
                  </ul>
                  <div className="text-sm bg-brand-light rounded-xl p-3 mb-3">
                    <b>{o.shipping?.name}</b> · <a className="text-brand-primary font-semibold" href={`tel:${o.shipping?.phone}`}>📞 {o.shipping?.phone}</a><br />
                    {o.shipping?.address}, {o.shipping?.city} – {o.shipping?.pincode}
                    {o.notes && <div className="text-gray-600 mt-1">Note: {o.notes}</div>}
                    {o.cancelReason && o.status === 'cancelled' && <div className="text-red-600 mt-1">Cancelled ({o.cancelledBy}): {o.cancelReason}</div>}
                  </div>
                  {o.status !== 'cancelled' && o.status !== 'delivered' && (
                    <div className="grid sm:grid-cols-2 gap-2 mb-3">
                      <input aria-label="Courier" placeholder="Courier (e.g. Delhivery)" value={t.courier} onChange={(e) => setTrack((s) => ({ ...s, [o._id]: { ...t, courier: e.target.value } }))} className="input-field !py-2 text-sm" />
                      <input aria-label="Tracking number" placeholder="Tracking number" value={t.trackingNo} onChange={(e) => setTrack((s) => ({ ...s, [o._id]: { ...t, trackingNo: e.target.value } }))} className="input-field !py-2 text-sm" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-sm font-semibold text-brand-dark" htmlFor={`s-${o._id}`}>Status:</label>
                    <select id={`s-${o._id}`} value={o.status} onChange={(e) => setStatus(o, e.target.value)} className="input-field !py-2 !w-auto text-sm font-semibold capitalize">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {o.status !== 'cancelled' && o.status !== 'delivered' && <button onClick={() => update(o._id, { courier: t.courier, trackingNo: t.trackingNo }, 'Tracking saved')} className="text-sm font-bold text-brand-primary border-2 border-orange-200 rounded-full px-4 py-1.5">Save tracking</button>}
                    {o.paymentMethod === 'online' && ['paid', 'refund_pending'].includes(o.paymentStatus) && <button onClick={() => refund(o)} className="text-sm font-bold text-white bg-red-600 rounded-full px-4 py-1.5 hover:bg-red-700">Refund {inr(o.total)}</button>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
