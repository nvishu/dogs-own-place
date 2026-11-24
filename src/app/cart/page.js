'use client'
import Link from 'next/link'
import { Minus, Plus, Trash2, Truck } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductImage from '@/components/shop/ProductImage'
import { inr } from '@/components/shop/ProductCard'
import { useCart } from '@/context/CartContext'
import { FREE_DELIVERY_ABOVE } from '@/lib/products'

export default function CartPage() {
  const { ready, lines, count, hasOutOfStock, subtotal, savings, deliveryFee, total, amountToFreeDelivery, setQty, remove, clear, MAX_QTY } = useCart()
  const progress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_ABOVE) * 100))

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-dark mb-6">🛒 Your Cart {count > 0 && <span className="text-lg text-gray-400 font-semibold">({count} item{count > 1 ? 's' : ''})</span>}</h1>

        {!ready ? (
          <div className="card h-40 animate-pulse" />
        ) : lines.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <p className="font-bold text-brand-dark text-lg mb-1">Your cart is empty</p>
            <p className="text-gray-500 mb-6">Add some tasty food for your furry friend.</p>
            <Link href="/shop" className="btn-primary px-8 py-3">Browse the shop</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-dark mb-2">
                  <Truck size={18} className="text-brand-primary" />
                  {amountToFreeDelivery > 0 ? <>Add <b className="text-brand-primary">{inr(amountToFreeDelivery)}</b> more for FREE delivery</> : <span className="text-green-700">🎉 You&apos;ve unlocked FREE delivery!</span>}
                </div>
                <div className="h-2 bg-orange-100 rounded-full overflow-hidden"><div className="h-full bg-brand-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div>
              </div>

              {lines.map((l) => (
                <div key={`${l.slug}|${l.size}`} className="card p-4 flex gap-4">
                  <Link href={`/shop/${l.slug}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-brand-light overflow-hidden flex-shrink-0">
                    <ProductImage src={l.product.image} alt={l.product.name} className="w-full h-full object-contain" />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">{l.product.brand}</div>
                    <Link href={`/shop/${l.slug}`} className="font-bold text-brand-dark leading-snug line-clamp-2 hover:text-brand-primary">{l.product.name}</Link>
                    <div className="text-sm text-gray-500">Pack: {l.size}</div>
                    {l.outOfStock && <div role="alert" className="text-sm font-bold text-red-600">Sold out — please remove this item</div>}
                    {!l.outOfStock && typeof l.variant.stock === 'number' && l.qty >= l.variant.stock && <div className="text-xs font-semibold text-amber-700">Maximum available: {l.variant.stock}</div>}
                    <div className="mt-auto pt-3 flex items-center justify-between gap-3 flex-wrap">
                      <div className="inline-flex items-center border-2 border-orange-200 rounded-full bg-white">
                        <button onClick={() => setQty(l.slug, l.size, l.qty - 1)} disabled={l.qty <= 1} aria-label="Decrease quantity" className="w-10 h-10 flex items-center justify-center disabled:opacity-40 hover:text-brand-primary"><Minus size={15} /></button>
                        <span className="w-7 text-center font-bold">{l.qty}</span>
                        <button onClick={() => setQty(l.slug, l.size, l.qty + 1)} disabled={l.outOfStock || l.qty >= MAX_QTY || (typeof l.variant.stock === 'number' && l.qty >= l.variant.stock)} aria-label="Increase quantity" className="w-10 h-10 flex items-center justify-center disabled:opacity-40 hover:text-brand-primary"><Plus size={15} /></button>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-brand-dark">{inr(l.lineTotal)}</div>
                        {l.variant.mrp > l.variant.price && <div className="text-xs text-gray-400 line-through">{inr(l.variant.mrp * l.qty)}</div>}
                      </div>
                      <button onClick={() => remove(l.slug, l.size)} aria-label={`Remove ${l.product.name}`} className="w-10 h-10 rounded-full text-red-500 hover:bg-red-50 flex items-center justify-center"><Trash2 size={17} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={clear} className="text-sm text-gray-500 hover:text-red-600 font-semibold">Clear cart</button>
            </div>

            <aside className="card p-6 lg:sticky lg:top-28">
              <h2 className="font-display font-bold text-xl text-brand-dark mb-4">Order summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Subtotal</dt><dd className="font-semibold">{inr(subtotal)}</dd></div>
                {savings > 0 && <div className="flex justify-between text-green-700"><dt>You save</dt><dd className="font-semibold">− {inr(savings)}</dd></div>}
                <div className="flex justify-between"><dt className="text-gray-500">Delivery</dt><dd className="font-semibold">{deliveryFee === 0 ? <span className="text-green-700">FREE</span> : inr(deliveryFee)}</dd></div>
                <div className="flex justify-between border-t border-orange-100 pt-3 text-base"><dt className="font-bold text-brand-dark">Total</dt><dd className="font-display font-bold text-2xl text-brand-primary">{inr(total)}</dd></div>
              </dl>
              {hasOutOfStock
                ? <button disabled className="btn-primary w-full justify-center py-3.5 mt-6 opacity-50">Remove sold-out items to continue</button>
                : <Link href="/checkout" className="btn-primary w-full justify-center py-3.5 mt-6">Proceed to Checkout</Link>}
              <p className="text-xs text-gray-500 text-center mt-3">💵 Pay cash on delivery</p>
              <Link href="/shop" className="block text-center text-sm text-brand-primary font-semibold mt-4 hover:underline">← Continue shopping</Link>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
