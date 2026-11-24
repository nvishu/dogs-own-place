'use client'
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { findVariant, FREE_DELIVERY_ABOVE, DELIVERY_FEE } from '@/lib/products'
import { useCatalogue } from '@/context/CatalogueContext'

const CartContext = createContext(null)
const KEY = 'dop_cart_v1'
const MAX_QTY = 10

export function CartProvider({ children }) {
  const { products, loaded: catalogueLoaded } = useCatalogue()
  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products])
  const [items, setItems] = useState([]) // [{ slug, size, qty }]
  const [ready, setReady] = useState(false)

  // load once
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      if (Array.isArray(saved)) setItems(saved.filter((i) => i && typeof i.slug === 'string' && typeof i.size === 'string' && i.qty >= 1))
    } catch {}
    setReady(true)
  }, [])

  // persist + sync between tabs
  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {}
  }, [items, ready])
  useEffect(() => {
    const onStorage = (e) => { if (e.key === KEY) try { setItems(JSON.parse(e.newValue || '[]')) } catch {} }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback((slug, size, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.slug === slug && x.size === size)
      if (i >= 0) return prev.map((x, n) => (n === i ? { ...x, qty: Math.min(MAX_QTY, x.qty + qty) } : x))
      return [...prev, { slug, size, qty: Math.min(MAX_QTY, qty) }]
    })
  }, [])
  const setQty = useCallback((slug, size, qty) => {
    setItems((prev) => prev.map((x) => (x.slug === slug && x.size === size ? { ...x, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : x)))
  }, [])
  const remove = useCallback((slug, size) => setItems((prev) => prev.filter((x) => !(x.slug === slug && x.size === size))), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(() => {
    const lines = items
      .map((it) => {
        const product = bySlug.get(it.slug)
        const variant = product && findVariant(product, it.size)
        if (!product || !variant) return null
        const cap = typeof variant.stock === 'number' ? Math.max(0, variant.stock) : MAX_QTY
        const qty = Math.min(it.qty, Math.min(MAX_QTY, cap)) || 0
        return qty > 0 ? { ...it, qty, product, variant, outOfStock: false, lineTotal: variant.price * qty }
                       : { ...it, qty: 0, product, variant, outOfStock: true, lineTotal: 0 }
      })
      .filter(Boolean)
    const count = lines.reduce((s, l) => s + l.qty, 0)
    const hasOutOfStock = lines.some((l) => l.outOfStock)
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
    const savings = lines.reduce((s, l) => s + Math.max(0, l.variant.mrp - l.variant.price) * l.qty, 0)
    const deliveryFee = lines.length === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
    return {
      ready: ready && catalogueLoaded, lines, count, hasOutOfStock, subtotal, savings, deliveryFee, total: subtotal + deliveryFee,
      amountToFreeDelivery: Math.max(0, FREE_DELIVERY_ABOVE - subtotal),
      add, setQty, remove, clear, MAX_QTY,
    }
  }, [items, ready, catalogueLoaded, bySlug, add, setQty, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
