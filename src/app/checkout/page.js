'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductImage from '@/components/shop/ProductImage'
import { inr } from '@/components/shop/ProductCard'
import { useCart } from '@/context/CartContext'
import { apiGetMe, apiCreateOrder, apiPaymentConfig } from '@/lib/apiClient'
import { payOnline } from '@/lib/payFlow'
import { COD_MAX, pincodeServiceable } from '@/lib/business'

export default function CheckoutPage() {
  const router = useRouter()
  const { ready, lines, subtotal, deliveryFee, total, clear } = useCart()
  const [authState, setAuthState] = useState('checking') // checking | guest | user
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', pincode: '', notes: '' })
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)
  const [method, setMethod] = useState('cod')
  const [cfg, setCfg] = useState({ razorpay: false })

  useEffect(() => {
    apiGetMe()
      .then(({ user }) => {
        if (user.role === 'admin') { router.replace('/admin'); return }
        setForm((f) => ({ ...f, name: user.name || '', phone: user.phone || '', address: user.address || '', city: user.city || '' }))
        setAuthState('user')
      })
      .catch(() => setAuthState('guest'))
  }, [router])

  useEffect(() => { apiPaymentConfig().then((c) => { setCfg(c); if (c.razorpay) setMethod('online') }).catch(() => {}) }, [])
  const codOk = total <= COD_MAX
  useEffect(() => { if (!codOk && method === 'cod') setMethod(cfg.razorpay ? 'online' : 'cod') }, [codOk, method, cfg.razorpay])
  const pinBad = /^\d{6}$/.test(form.pincode) && !pincodeServiceable(form.pincode)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (lines.length === 0) return setError('Your cart is empty')
    if (pinBad) return setError(`Sorry, we do not deliver to pincode ${form.pincode} yet.`)
    if (method === 'cod' && !codOk) return setError(`Cash on Delivery is available up to ₹${COD_MAX.toLocaleString('en-IN')}. Please pay online.`)
    setPlacing(true)
    try {
      const { order, paymentRequired } = await apiCreateOrder({
        paymentMethod: method,
        items: lines.map((l) => ({ slug: l.slug, size: l.size, qty: l.qty })),
        shipping: { name: form.name, phone: form.phone, address: form.address, city: form.city, pincode: form.pincode },
        notes: form.notes,
      })
      clear() // the order now exists (and its stock is held), so the cart is done
      if (paymentRequired) {
        try {
          await payOnline('order', order._id)
          router.push(`/dashboard/orders?placed=${encodeURIComponent(order.orderNo)}`)
        } catch (payErr) {
          // Not paid yet: the order is kept for 30 minutes and can be paid from My Orders.
          router.push(`/dashboard/orders?unpaid=${encodeURIComponent(order.orderNo)}${payErr.dismissed ? '' : '&payfail=1'}`)
        }
        return
      }
      router.push(`/dashboard/orders?placed=${encodeURIComponent(order.orderNo)}`)
    } catch (err) {
      setError(err.message || 'Could not place your order. Please try again.')
      setPlacing(false)
    }
  }

  const field = (id, label, props = {}) => (
    <div className={props.wrap || ''}>
      <label htmlFor={id} className="text-sm font-semibold text-brand-dark mb-1.5 block">{label}</label>
      {props.textarea
        ? <textarea id={id} value={form[id]} onChange={(e) => set(id, e.target.value)} className="input-field resize-none h-24" required={props.required} placeholder={props.placeholder} />
        : <input id={id} value={form[id]} onChange={(e) => set(id, e.target.value)} className="input-field" required={props.required} placeholder={props.placeholder} inputMode={props.inputMode} autoComplete={props.autoComplete} maxLength={props.maxLength} />}
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16 max-w-5xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-dark mb-6">Checkout</h1>

        {!ready || authState === 'checking' ? (
          <div className="card h-48 animate-pulse" />
        ) : lines.length === 0 ? (
          <div className="card text-center py-14">
            <div className="text-5xl mb-3">🛒</div>
            <p className="font-bold text-brand-dark mb-4">Your cart is empty</p>
            <Link href="/shop" className="btn-primary px-8 py-3">Go to shop</Link>
          </div>
        ) : authState === 'guest' ? (
          <div className="card text-center py-14 max-w-xl mx-auto">
            <div className="text-5xl mb-3">🔐</div>
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-2">Please log in to place your order</h2>
            <p className="text-gray-500 mb-6">Your cart is saved. Log in or create a free account and you&apos;ll come straight back here.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/auth/login?next=/checkout" className="btn-primary px-8 py-3">Log in</Link>
              <Link href="/auth/register?next=/checkout" className="btn-secondary px-8 py-3">Create account</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 space-y-6">
              <div className="card p-6">
                <h2 className="font-bold text-brand-dark text-lg mb-4">📍 Delivery address</h2>
                {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm font-medium">⚠️ {error}</div>}
                <div className="grid sm:grid-cols-2 gap-4">
                  {field('name', 'Full name', { required: true, autoComplete: 'name' })}
                  {field('phone', 'Mobile number', { required: true, inputMode: 'numeric', autoComplete: 'tel', placeholder: '10-digit number', maxLength: 14 })}
                  {field('address', 'Full address (house no, street, area, landmark)', { required: true, textarea: true, wrap: 'sm:col-span-2' })}
                  {field('city', 'City', { required: true, autoComplete: 'address-level2' })}
                  {field('pincode', 'Pincode', { required: true, inputMode: 'numeric', autoComplete: 'postal-code', placeholder: '6 digits', maxLength: 6 })}
                  {pinBad && <p role="alert" className="sm:col-span-2 -mt-2 text-sm font-semibold text-red-600">Sorry, we do not deliver to this pincode yet.</p>}
                  {field('notes', 'Delivery note (optional)', { wrap: 'sm:col-span-2', placeholder: 'e.g. Call before delivery' })}
                </div>
              </div>
              <div className="card p-6">
                <h2 className="font-bold text-brand-dark text-lg mb-3">💳 Payment</h2>
                <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                  {cfg.razorpay && (
                    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer ${method === 'online' ? 'border-brand-primary bg-brand-light' : 'border-orange-100'}`}>
                      <input type="radio" name="pm" checked={method === 'online'} onChange={() => setMethod('online')} className="mt-1 accent-[#E8622A]" />
                      <span><b className="text-brand-dark">Pay online</b> <span className="text-xs text-green-700 font-bold">UPI · Cards · Netbanking</span><br /><span className="text-sm text-gray-600">Secure payment through Razorpay. Your order is confirmed as soon as the payment succeeds.</span></span>
                    </label>
                  )}
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 ${codOk ? 'cursor-pointer' : 'opacity-50'} ${method === 'cod' ? 'border-brand-primary bg-brand-light' : 'border-orange-100'}`}>
                    <input type="radio" name="pm" checked={method === 'cod'} disabled={!codOk} onChange={() => setMethod('cod')} className="mt-1 accent-[#E8622A]" />
                    <span><b className="text-brand-dark">Cash on Delivery</b><br /><span className="text-sm text-gray-600">{codOk ? 'Pay in cash when your order arrives. Keep the exact amount handy.' : `Available for orders up to ₹${COD_MAX.toLocaleString('en-IN')}.`}</span></span>
                  </label>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-2 card p-6 lg:sticky lg:top-28">
              <h2 className="font-display font-bold text-xl text-brand-dark mb-4">Your order</h2>
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
                {lines.map((l) => (
                  <li key={`${l.slug}|${l.size}`} className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-lg bg-brand-light overflow-hidden flex-shrink-0"><ProductImage src={l.product.image} alt="" className="w-full h-full object-contain" /></div>
                    <div className="flex-1 min-w-0 text-sm"><div className="font-semibold text-brand-dark line-clamp-1">{l.product.brand} {l.product.name}</div><div className="text-gray-500">{l.size} × {l.qty}</div></div>
                    <div className="font-semibold text-sm">{inr(l.lineTotal)}</div>
                  </li>
                ))}
              </ul>
              <dl className="space-y-2 text-sm border-t border-orange-100 pt-4">
                <div className="flex justify-between"><dt className="text-gray-500">Subtotal</dt><dd>{inr(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Delivery</dt><dd>{deliveryFee === 0 ? <span className="text-green-700 font-semibold">FREE</span> : inr(deliveryFee)}</dd></div>
                <div className="flex justify-between pt-2 border-t border-orange-100"><dt className="font-bold text-brand-dark">Total to pay</dt><dd className="font-display font-bold text-2xl text-brand-primary">{inr(total)}</dd></div>
              </dl>
              <button type="submit" disabled={placing} aria-busy={placing} className="btn-primary w-full justify-center py-3.5 mt-6 disabled:opacity-60">{placing ? (method === 'online' ? 'Opening payment…' : 'Placing order…') : method === 'online' ? `Pay ${inr(total)}` : `Place Order · ${inr(total)}`}</button>
              <p className="text-xs text-gray-500 text-center mt-3">By placing your order you agree to our delivery &amp; return terms.</p>
            </aside>
          </form>
        )}
      </div>
      <Footer />
    </div>
  )
}
