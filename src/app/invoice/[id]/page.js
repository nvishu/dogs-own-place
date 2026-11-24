'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BUSINESS } from '@/lib/business'
import { SITE } from '@/lib/site'
import { inr } from '@/components/shop/ProductCard'

export default function InvoicePage({ params }) {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/orders/${params.id}`, { credentials: 'same-origin' })
      .then(async (r) => {
        if (r.status === 401) { router.replace(`/auth/login?next=/invoice/${params.id}`); return }
        const d = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(d.error || 'Could not load the invoice')
        setData(d)
      })
      .catch((e) => setError(e.message))
  }, [params.id, router])

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>
  if (!data) return <div className="p-10 text-center text-4xl animate-bounce">🐾</div>
  const { order: o, customer } = data
  const date = new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const title = BUSINESS.gstin ? 'Tax Invoice' : 'Invoice'

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <style>{`@media print { .no-print { display: none !important } body { background: #fff } }`}</style>
      <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-8 print:shadow-none print:rounded-none" id="invoice">
        <div className="flex justify-between items-start gap-6 border-b pb-5">
          <div>
            <div className="font-display text-2xl font-bold text-brand-dark">{BUSINESS.legalName}</div>
            {BUSINESS.address && <div className="text-sm text-gray-600 max-w-xs">{BUSINESS.address}</div>}
            {SITE.phone && <div className="text-sm text-gray-600">📞 {SITE.phone}</div>}
            {SITE.email && <div className="text-sm text-gray-600">✉️ {SITE.email}</div>}
            {BUSINESS.gstin && <div className="text-sm text-gray-600">GSTIN: {BUSINESS.gstin}</div>}
            {BUSINESS.fssai && <div className="text-sm text-gray-600">FSSAI: {BUSINESS.fssai}</div>}
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-brand-primary uppercase">{title}</div>
            <div className="text-sm text-gray-600">No: <b>{o.orderNo}</b></div>
            <div className="text-sm text-gray-600">Date: {date}</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 py-5 text-sm">
          <div><div className="text-gray-500 font-semibold mb-1">Billed / delivered to</div><b>{o.shipping?.name}</b><br />{o.shipping?.address}<br />{o.shipping?.city} – {o.shipping?.pincode}<br />📞 {o.shipping?.phone}{customer?.email && <><br />✉️ {customer.email}</>}</div>
          <div className="sm:text-right"><div className="text-gray-500 font-semibold mb-1">Payment</div>{o.paymentMethod === 'online' ? 'Paid online (Razorpay)' : 'Cash on delivery'}<br />Status: <b>{o.paymentStatus === 'paid' ? 'Paid' : o.paymentStatus === 'refunded' ? 'Refunded' : 'Due on delivery'}</b></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left"><th className="p-2">Item</th><th className="p-2">Pack</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Rate</th><th className="p-2 text-right">Amount</th></tr></thead>
          <tbody>
            {o.items.map((i) => (
              <tr key={`${i.slug}|${i.size}`} className="border-t"><td className="p-2">{i.brand} {i.name}</td><td className="p-2">{i.size}</td><td className="p-2 text-right">{i.qty}</td><td className="p-2 text-right">{inr(i.price)}</td><td className="p-2 text-right">{inr(i.price * i.qty)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 ml-auto max-w-xs text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>{inr(o.subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{o.deliveryFee ? inr(o.deliveryFee) : 'FREE'}</span></div>
          <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>{inr(o.total)}</span></div>
          <div className="text-xs text-gray-500">All prices are inclusive of applicable taxes.</div>
        </div>
        <p className="text-xs text-gray-500 mt-8">This is a computer-generated invoice and does not need a signature. Questions? Contact us using the details above.</p>
      </div>
      <div className="no-print text-center mt-6"><button onClick={() => window.print()} className="btn-primary px-8 py-3">🖨️ Print / Save as PDF</button></div>
    </div>
  )
}
