'use client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ShoppingCart } from 'lucide-react'
import ProductImage from '@/components/shop/ProductImage'
import { useCart } from '@/context/CartContext'
import { discountPct } from '@/lib/products'

export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function ProductCard({ product }) {
  const { add } = useCart()
  const tracked = (v) => typeof v.stock === 'number'
  const available = product.variants.filter((v) => !tracked(v) || v.stock > 0)
  const soldOut = available.length === 0
  const first = available[0] || product.variants[0]
  const best = Math.max(...product.variants.map(discountPct))
  const multi = product.variants.length > 1

  const quickAdd = (e) => {
    e.preventDefault()
    if (soldOut) return
    add(product.slug, first.size, 1)
    toast.success(`Added to cart · ${first.size}`)
  }

  return (
    <div className="card p-0 overflow-hidden flex flex-col group">
      <Link href={`/shop/${product.slug}`} className="relative block bg-brand-light aspect-square overflow-hidden" aria-label={`${product.brand} ${product.name}`}>
        <ProductImage src={product.image} alt={`${product.brand} ${product.name}`} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
        {soldOut && <span className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="bg-brand-dark text-white text-sm font-bold px-4 py-1.5 rounded-full">Sold out</span></span>}
        {best > 0 && !soldOut && <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">{best}% OFF</span>}
        <span className="absolute top-3 right-3 bg-white/90 text-brand-dark text-xs font-bold px-2.5 py-1 rounded-full">{product.category === 'dog' ? '🐶 Dog' : '🐱 Cat'}</span>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">{product.brand}</div>
        <Link href={`/shop/${product.slug}`} className="font-bold text-brand-dark leading-snug mt-1 line-clamp-2 hover:text-brand-primary">{product.name}</Link>
        <div className="text-xs text-gray-500 mt-1">{product.type} · {multi ? `${product.variants.length} sizes` : first.size}</div>
        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div>
            {multi && <div className="text-[11px] text-gray-500 leading-none mb-0.5">From</div>}
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-xl text-brand-dark">{inr(first.price)}</span>
              {first.mrp > first.price && <span className="text-xs text-gray-400 line-through">{inr(first.mrp)}</span>}
            </div>
          </div>
          <button onClick={quickAdd} disabled={soldOut} aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
            className="disabled:opacity-40 disabled:pointer-events-none w-11 h-11 rounded-full bg-brand-primary text-white flex items-center justify-center hover:bg-brand-secondary active:scale-90 transition shadow-brand flex-shrink-0">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
