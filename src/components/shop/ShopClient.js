'use client'
import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import { SHOP_CATEGORIES, PRODUCT_TYPES, startingPrice, FREE_DELIVERY_ABOVE } from '@/lib/products'

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'low', label: 'Price: Low to High' },
  { id: 'high', label: 'Price: High to Low' },
  { id: 'az', label: 'Name: A–Z' },
]
const PRICE_BANDS = [
  { id: 'any', label: 'Any price', test: () => true },
  { id: 'u500', label: 'Under ₹500', test: (p) => startingPrice(p) < 500 },
  { id: '500-1500', label: '₹500 – ₹1,500', test: (p) => startingPrice(p) >= 500 && startingPrice(p) <= 1500 },
  { id: 'o1500', label: 'Over ₹1,500', test: (p) => startingPrice(p) > 1500 },
]

export default function ShopClient({ products: PRODUCTS = [] }) {
  const [category, setCategory] = useState('all')
  const [type, setType] = useState('all')
  const [brand, setBrand] = useState('all')
  const [price, setPrice] = useState('any')
  const [sort, setSort] = useState('featured')
  const [q, setQ] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const inCategory = useMemo(() => PRODUCTS.filter((p) => category === 'all' || p.category === category), [category])
  const brands = useMemo(() => [...new Set(inCategory.map((p) => p.brand))].sort(), [inCategory])
  const types = useMemo(() => PRODUCT_TYPES.filter((t) => inCategory.some((p) => p.type === t)), [inCategory])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    const band = PRICE_BANDS.find((b) => b.id === price) || PRICE_BANDS[0]
    let list = inCategory.filter((p) =>
      (type === 'all' || p.type === type) &&
      (brand === 'all' || p.brand === brand) &&
      band.test(p) &&
      (!term || `${p.brand} ${p.name} ${p.type} ${p.tagline}`.toLowerCase().includes(term))
    )
    if (sort === 'low') list = [...list].sort((a, b) => startingPrice(a) - startingPrice(b))
    if (sort === 'high') list = [...list].sort((a, b) => startingPrice(b) - startingPrice(a))
    if (sort === 'az') list = [...list].sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`))
    return list
  }, [inCategory, type, brand, price, sort, q])

  const pickCategory = (id) => { setCategory(id); setType('all'); setBrand('all') }
  const reset = () => { setCategory('all'); setType('all'); setBrand('all'); setPrice('any'); setQ(''); setSort('featured') }
  const activeFilters = (type !== 'all') + (brand !== 'all') + (price !== 'any')

  const Chip = ({ active, onClick, children }) => (
    <button onClick={onClick} aria-pressed={active}
      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${active ? 'bg-brand-primary text-white border-brand-primary shadow-brand' : 'bg-white text-brand-dark border-orange-200 hover:border-brand-primary hover:text-brand-primary'}`}>
      {children}
    </button>
  )

  const FilterPanel = (
    <div className="space-y-5">
      <div>
        <label htmlFor="f-type" className="text-sm font-bold text-brand-dark block mb-2">Food type</label>
        <select id="f-type" value={type} onChange={(e) => setType(e.target.value)} className="input-field">
          <option value="all">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-brand" className="text-sm font-bold text-brand-dark block mb-2">Brand</label>
        <select id="f-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="input-field">
          <option value="all">All brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-price" className="text-sm font-bold text-brand-dark block mb-2">Price</label>
        <select id="f-price" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field">
          {PRICE_BANDS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </div>
      {(activeFilters > 0 || q) && <button onClick={reset} className="text-sm font-bold text-brand-primary hover:underline">Clear all filters</button>}
    </div>
  )

  return (
    <>
      <section className="pt-28 pb-10 relative overflow-hidden dots-bg">
        <div className="page-container text-center relative z-10">
          <span className="badge bg-orange-100 text-brand-primary mb-4">🛍️ Pet Shop</span>
          <h1 className="section-title mb-3">Food &amp; Treats for Dogs and Cats</h1>
          <p className="section-subtitle mx-auto">Trusted brands, clear pack sizes and honest prices. Free delivery above ₹{FREE_DELIVERY_ABOVE.toLocaleString('en-IN')} · Cash on delivery.</p>
          <div className="max-w-xl mx-auto mt-8 relative">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brand, food or treat…" aria-label="Search products"
              className="input-field pl-12 pr-10 rounded-full shadow-warm" />
            {q && <button onClick={() => setQ('')} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark"><X size={18} /></button>}
          </div>
        </div>
      </section>

      <section className="page-container pb-20">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {SHOP_CATEGORIES.map((c) => (
            <Chip key={c.id} active={category === c.id} onClick={() => pickCategory(c.id)}>{c.icon} {c.label}</Chip>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => setShowFilters(true)} className="lg:hidden btn-secondary btn-sm gap-2">
              <SlidersHorizontal size={16} /> Filters{activeFilters ? ` (${activeFilters})` : ''}
            </button>
            <label className="sr-only" htmlFor="sort">Sort</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="input-field !py-2.5 !w-auto text-sm font-semibold">
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          <aside className="hidden lg:block w-60 flex-shrink-0 card p-5 sticky top-28">
            <h2 className="font-display font-bold text-brand-dark text-lg mb-4">Filters</h2>
            {FilterPanel}
          </aside>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-4" aria-live="polite">{results.length} product{results.length === 1 ? '' : 's'}</p>
            {results.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-bold text-brand-dark mb-1">No products match your search</p>
                <p className="text-gray-500 text-sm mb-5">Try a different brand, type or price range.</p>
                <button onClick={reset} className="btn-primary px-6 py-2.5">Show all products</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                {results.map((p) => <ProductCard key={p.slug} product={p} />)}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-10 text-center">Brand names and logos belong to their respective owners. Product details are a guide — please check the pack for the exact ingredients and feeding chart.</p>
          </div>
        </div>
      </section>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-6 max-h-[85svh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-brand-dark">Filters</h2>
              <button onClick={() => setShowFilters(false)} aria-label="Close filters" className="w-10 h-10 rounded-full hover:bg-brand-light flex items-center justify-center"><X size={20} /></button>
            </div>
            {FilterPanel}
            <button onClick={() => setShowFilters(false)} className="btn-primary w-full justify-center py-3 mt-6">Show {results.length} products</button>
          </div>
        </div>
      )}
    </>
  )
}
