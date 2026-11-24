'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Minus, Plus, Truck, ShieldCheck, Wallet } from 'lucide-react'
import ProductImage from '@/components/shop/ProductImage'
import { useCart } from '@/context/CartContext'
import { discountPct, FREE_DELIVERY_ABOVE } from '@/lib/products'
import { POLICY } from '@/lib/business'
import { inr } from '@/components/shop/ProductCard'

export default function ProductDetail({ product }) {
  const router = useRouter()
  const { add, MAX_QTY } = useCart()
  const isTracked = (x) => typeof x.stock === 'number'
  const firstAvail = product.variants.find((x) => !isTracked(x) || x.stock > 0) || product.variants[0]
  const [size, setSize] = useState(firstAvail.size)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('about')
  const v = product.variants.find((x) => x.size === size) || product.variants[0]
  const off = discountPct(v)
  const soldOut = isTracked(v) && v.stock <= 0
  const maxQty = isTracked(v) ? Math.max(1, Math.min(MAX_QTY, v.stock)) : MAX_QTY
  const lowStock = isTracked(v) && v.stock > 0 && v.stock <= 5

  const addToCart = () => { if (soldOut) return; add(product.slug, v.size, Math.min(qty, maxQty)); toast.success(`${qty} × ${product.brand} (${v.size}) added to cart`) }
  const buyNow = () => { if (soldOut) return; add(product.slug, v.size, Math.min(qty, maxQty)); router.push('/cart') }

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'feeding', label: 'Feeding guide' },
    { id: 'delivery', label: 'Delivery & returns' },
  ]

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
      <div className="card p-4 md:p-8 bg-white lg:sticky lg:top-28">
        <div className="aspect-square rounded-2xl bg-brand-light overflow-hidden relative">
          <ProductImage src={product.image} alt={`${product.brand} ${product.name}`} priority className="w-full h-full object-contain" />
          {off > 0 && <span className="absolute top-4 left-4 bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow">{off}% OFF</span>}
        </div>
      </div>

      <div>
        <div className="text-sm font-bold uppercase tracking-wider text-brand-primary">{product.brand}</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-dark leading-tight mt-1">{product.name}</h1>
        <p className="text-brand-brown/70 mt-2">{product.tagline}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="badge bg-orange-100 text-brand-primary">{product.category === 'dog' ? '🐶 Dog' : '🐱 Cat'}</span>
          <span className="badge bg-white border border-orange-200 text-brand-dark">{product.type}</span>
        </div>

        <div className="mt-6 flex items-baseline gap-3 flex-wrap">
          <span className="font-display text-4xl font-bold text-brand-dark">{inr(v.price)}</span>
          {v.mrp > v.price && <>
            <span className="text-lg text-gray-400 line-through">{inr(v.mrp)}</span>
            <span className="text-sm font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">You save {inr(v.mrp - v.price)}</span>
          </>}
        </div>
        <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
        {soldOut && <p role="status" className="mt-3 inline-block bg-red-50 text-red-700 text-sm font-bold px-3 py-1.5 rounded-full">Sold out — choose another pack size or check back soon</p>}
        {lowStock && <p role="status" className="mt-3 inline-block bg-amber-50 text-amber-700 text-sm font-bold px-3 py-1.5 rounded-full">Only {v.stock} left</p>}

        <div className="mt-6">
          <div className="text-sm font-bold text-brand-dark mb-2">Pack size: <span className="text-brand-primary">{v.size}</span></div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Pack size">
            {product.variants.map((x) => (
              <button key={x.size} role="radio" aria-checked={size === x.size} onClick={() => { setSize(x.size); setQty(1) }}
                className={`${isTracked(x) && x.stock <= 0 ? 'opacity-50' : ''} px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-all ${size === x.size ? 'border-brand-primary bg-brand-light text-brand-primary' : 'border-orange-100 bg-white text-brand-dark hover:border-orange-300'}`}>
                <div>{x.size}</div>
                <div className="text-xs font-medium opacity-80">{isTracked(x) && x.stock <= 0 ? 'Sold out' : inr(x.price)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center border-2 border-orange-200 rounded-full bg-white" role="group" aria-label="Quantity">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="w-11 h-11 flex items-center justify-center text-brand-dark hover:text-brand-primary disabled:opacity-40" disabled={qty <= 1}><Minus size={16} /></button>
            <span className="w-8 text-center font-bold text-brand-dark" aria-live="polite">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="Increase quantity" className="w-11 h-11 flex items-center justify-center text-brand-dark hover:text-brand-primary disabled:opacity-40" disabled={qty >= maxQty}><Plus size={16} /></button>
          </div>
          <button onClick={addToCart} disabled={soldOut} className="btn-primary flex-1 min-w-[160px] justify-center py-3.5 disabled:opacity-40 disabled:pointer-events-none">{soldOut ? 'Sold out' : 'Add to Cart'}</button>
          <button onClick={buyNow} disabled={soldOut} className="btn-secondary flex-1 min-w-[140px] justify-center py-3.5 disabled:opacity-40 disabled:pointer-events-none">Buy Now</button>
        </div>

        <ul className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
          <li className="flex items-center gap-2 bg-white rounded-xl p-3 border border-orange-100"><Truck size={18} className="text-brand-primary flex-shrink-0" /> Free delivery above {inr(FREE_DELIVERY_ABOVE)}</li>
          <li className="flex items-center gap-2 bg-white rounded-xl p-3 border border-orange-100"><Wallet size={18} className="text-brand-primary flex-shrink-0" /> Cash on delivery</li>
          <li className="flex items-center gap-2 bg-white rounded-xl p-3 border border-orange-100"><ShieldCheck size={18} className="text-brand-primary flex-shrink-0" /> Sealed, genuine packs</li>
        </ul>

        <div className="mt-10">
          <div className="flex gap-2 border-b border-orange-100 overflow-x-auto" role="tablist">
            {tabs.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-dark'}`}>{t.label}</button>
            ))}
          </div>
          <div className="pt-5 text-brand-brown/80 leading-relaxed" role="tabpanel">
            {tab === 'about' && (
              <div className="space-y-4">
                <p>{product.description}</p>
                <ul className="space-y-2">
                  {product.highlights.map((h) => <li key={h} className="flex gap-2"><span className="text-green-600 font-bold">✓</span><span>{h}</span></li>)}
                </ul>
                <dl className="grid grid-cols-2 gap-3 text-sm pt-2">
                  <div className="bg-white rounded-xl p-3 border border-orange-100"><dt className="text-gray-500">Brand</dt><dd className="font-bold text-brand-dark">{product.brand}</dd></div>
                  <div className="bg-white rounded-xl p-3 border border-orange-100"><dt className="text-gray-500">Suitable for</dt><dd className="font-bold text-brand-dark">{product.suitableFor}</dd></div>
                  <div className="bg-white rounded-xl p-3 border border-orange-100"><dt className="text-gray-500">Food type</dt><dd className="font-bold text-brand-dark">{product.type}</dd></div>
                  <div className="bg-white rounded-xl p-3 border border-orange-100"><dt className="text-gray-500">Pack sizes</dt><dd className="font-bold text-brand-dark">{product.variants.map((x) => x.size).join(', ')}</dd></div>
                </dl>
                <p className="text-xs text-gray-500">Please check the pack for the full ingredient list, guaranteed analysis and feeding chart.</p>
              </div>
            )}
            {tab === 'feeding' && <p>{product.feeding}</p>}
            {tab === 'delivery' && (
              <ul className="space-y-2 list-disc pl-5">
                <li>Free delivery on orders above {inr(FREE_DELIVERY_ABOVE)}; a small delivery fee applies below that.</li>
                <li>Pay in cash when your order arrives.</li>
                <li>Received a damaged, wrong or expired item? Contact us within {POLICY.returnWindowHours} hours of delivery and we&apos;ll make it right.</li>
                <li>Opened packs can&apos;t be returned for taste or preference. <Link href="/refund-policy" className="text-brand-primary font-semibold">Full policy</Link></li>
              </ul>
            )}
          </div>
        </div>
        <Link href="/shop" className="inline-block mt-8 text-brand-primary font-semibold hover:underline">← Continue shopping</Link>
      </div>
    </div>
  )
}
