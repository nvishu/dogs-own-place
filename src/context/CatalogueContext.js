'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PRODUCTS } from '@/lib/products'

// Live catalogue for client components (cart, checkout). Starts from the starter list so pages render
// instantly, then swaps in the real products/prices/stock from /api/products.
const CatalogueContext = createContext({ products: PRODUCTS, loaded: false })

export function CatalogueProvider({ children }) {
  const [products, setProducts] = useState(PRODUCTS)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let alive = true
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (alive && Array.isArray(d.products)) setProducts(d.products) })
      .catch(() => {})
      .finally(() => alive && setLoaded(true))
    return () => { alive = false }
  }, [])
  const value = useMemo(() => ({ products, loaded, get: (slug) => products.find((p) => p.slug === slug) }), [products, loaded])
  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>
}

export const useCatalogue = () => useContext(CatalogueContext)
