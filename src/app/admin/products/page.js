'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { apiGetMe } from '@/lib/apiClient'
import { inr } from '@/components/shop/ProductCard'

async function call(url, opts = {}) {
  const res = await fetch(url, { credentials: 'same-origin', ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

const EMPTY = { name: '', brand: '', category: 'dog', type: 'Dry Food', tagline: '', description: '', highlights: '', suitableFor: '', feeding: '', image: '', active: true, variants: [{ size: '', price: '', mrp: '', stock: 0 }] }
const TYPES = ['Dry Food', 'Wet Food', 'Puppy Food', 'Kitten Food', 'Senior', 'Treats']

// Shrinks a photo in the browser (max 800px, JPEG) so uploads stay small and fast.
function resizeImage(file, max = 800) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height)
      ctx.drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => reject(new Error('Could not read that image'))
    img.src = URL.createObjectURL(file)
  })
}

export default function AdminProducts() {
  const router = useRouter()
  const [products, setProducts] = useState(null)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null) // null | { slug?, form }
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    try { setProducts((await call('/api/admin/products')).products) } catch (e) { toast.error(e.message); setProducts([]) }
  }, [])

  useEffect(() => {
    apiGetMe().then(({ user }) => { if (user.role !== 'admin') router.replace('/dashboard'); else load() })
      .catch(() => router.replace('/auth/login?next=/admin/products'))
  }, [router, load])

  const shown = useMemo(() => (products || []).filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(q.toLowerCase())), [products, q])

  const openNew = () => setEditing({ form: structuredClone(EMPTY) })
  const openEdit = (p) => setEditing({ slug: p.slug, form: { ...p, highlights: (p.highlights || []).join('\n'), variants: p.variants.map((v) => ({ ...v })) } })
  const setF = (k, v) => setEditing((e) => ({ ...e, form: { ...e.form, [k]: v } }))
  const setV = (i, k, v) => setEditing((e) => ({ ...e, form: { ...e.form, variants: e.form.variants.map((x, n) => (n === i ? { ...x, [k]: v } : x)) } }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const f = editing.form
      const body = { ...f, highlights: f.highlights, variants: f.variants.map((v) => ({ size: v.size, price: Number(v.price), mrp: Number(v.mrp || v.price), stock: Number(v.stock) })) }
      if (editing.slug) await call(`/api/admin/products/${editing.slug}`, { method: 'PATCH', body: JSON.stringify(body) })
      else await call('/api/admin/products', { method: 'POST', body: JSON.stringify(body) })
      toast.success('Product saved')
      setEditing(null); load()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  const toggle = async (p) => {
    try { await call(`/api/admin/products/${p.slug}`, { method: 'PATCH', body: JSON.stringify({ active: !p.active }) }); load() } catch (e) { toast.error(e.message) }
  }
  const remove = async (p) => {
    if (!confirm(`Delete "${p.brand} ${p.name}" permanently? (Hide it instead if you may sell it again.)`)) return
    try { await call(`/api/admin/products/${p.slug}`, { method: 'DELETE' }); toast.success('Deleted'); load() } catch (e) { toast.error(e.message) }
  }
  const importStarter = async () => {
    try { const d = await call('/api/admin/products/import', { method: 'POST' }); toast.success(`Imported ${d.imported} products`); load() } catch (e) { toast.error(e.message) }
  }
  const upload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await resizeImage(file)
      const d = await call('/api/admin/products/image', { method: 'POST', body: JSON.stringify({ dataUrl }) })
      setF('image', d.url); toast.success('Photo uploaded')
    } catch (e) { toast.error(e.message) } finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const stockOf = (p) => p.variants.reduce((s, v) => s + (v.stock || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-dark text-white px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="font-display font-bold text-lg">📦 Products &amp; Stock</div>
        <Link href="/admin" className="text-sm font-semibold text-amber-300 hover:underline">← Admin panel</Link>
      </header>
      <main className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="flex flex-wrap gap-3 items-center mb-5">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" aria-label="Search products" className="input-field !w-64" />
          <button onClick={openNew} className="btn-primary px-5 py-2.5 text-sm">+ Add product</button>
          {products?.length === 0 && <button onClick={importStarter} className="btn-secondary px-5 py-2.5 text-sm">Import the 33 starter products</button>}
          <span className="text-sm text-gray-500 ml-auto">{products?.length ?? '…'} products</span>
        </div>

        {products === null ? <div className="bg-white rounded-2xl h-40 animate-pulse" /> : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-600">
            <p className="font-bold text-brand-dark mb-2">Your catalogue is empty</p>
            <p className="text-sm">The shop currently shows the built-in starter list. Import it here to edit prices, stock and photos, or add your own products.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-orange-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-light text-left text-gray-600"><tr><th className="p-3">Product</th><th className="p-3">Packs &amp; prices</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.slug} className="border-t border-orange-50 align-top">
                    <td className="p-3"><div className="flex gap-3 items-center"><div className="w-12 h-12 rounded-lg bg-brand-light overflow-hidden flex-shrink-0">{/* eslint-disable-next-line @next/next/no-img-element */}{p.image && <img src={p.image} alt="" className="w-full h-full object-contain" />}</div><div><div className="font-bold text-brand-dark">{p.brand}</div><div className="text-gray-600">{p.name}</div></div></div></td>
                    <td className="p-3 text-gray-700">{p.variants.map((v) => <div key={v.size}>{v.size}: <b>{inr(v.price)}</b> <span className="text-gray-400">(stock {v.stock})</span></div>)}</td>
                    <td className="p-3"><span className={`font-bold ${stockOf(p) === 0 ? 'text-red-600' : stockOf(p) <= 10 ? 'text-amber-600' : 'text-green-700'}`}>{stockOf(p)}</span></td>
                    <td className="p-3"><button onClick={() => toggle(p)} className={`text-xs font-bold px-3 py-1 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{p.active ? 'Visible' : 'Hidden'}</button></td>
                    <td className="p-3 text-right whitespace-nowrap"><button onClick={() => openEdit(p)} className="text-brand-primary font-bold mr-4">Edit</button><button onClick={() => remove(p)} className="text-red-500 font-semibold">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Edit product">
          <form onSubmit={save} className="bg-white rounded-2xl w-full max-w-2xl my-6 p-6 space-y-4">
            <div className="flex justify-between items-center"><h2 className="font-display text-xl font-bold text-brand-dark">{editing.slug ? 'Edit product' : 'Add product'}</h2><button type="button" onClick={() => setEditing(null)} className="text-2xl text-gray-400 hover:text-gray-700" aria-label="Close">×</button></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm font-semibold">Brand<input required value={editing.form.brand} onChange={(e) => setF('brand', e.target.value)} className="input-field mt-1" /></label>
              <label className="text-sm font-semibold">Product name<input required value={editing.form.name} onChange={(e) => setF('name', e.target.value)} className="input-field mt-1" /></label>
              <label className="text-sm font-semibold">For<select value={editing.form.category} onChange={(e) => setF('category', e.target.value)} className="input-field mt-1"><option value="dog">Dog</option><option value="cat">Cat</option></select></label>
              <label className="text-sm font-semibold">Type<select value={editing.form.type} onChange={(e) => setF('type', e.target.value)} className="input-field mt-1">{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
            </div>
            <label className="text-sm font-semibold block">Short tagline<input value={editing.form.tagline} onChange={(e) => setF('tagline', e.target.value)} className="input-field mt-1" /></label>
            <label className="text-sm font-semibold block">Description<textarea value={editing.form.description} onChange={(e) => setF('description', e.target.value)} className="input-field mt-1 h-24 resize-none" /></label>
            <label className="text-sm font-semibold block">Key points (one per line)<textarea value={editing.form.highlights} onChange={(e) => setF('highlights', e.target.value)} className="input-field mt-1 h-24 resize-none" /></label>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm font-semibold">Suitable for<input value={editing.form.suitableFor} onChange={(e) => setF('suitableFor', e.target.value)} className="input-field mt-1" /></label>
              <label className="text-sm font-semibold">Feeding guide<input value={editing.form.feeding} onChange={(e) => setF('feeding', e.target.value)} className="input-field mt-1" /></label>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Photo</div>
              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 rounded-xl bg-brand-light overflow-hidden flex items-center justify-center">{/* eslint-disable-next-line @next/next/no-img-element */}{editing.form.image ? <img src={editing.form.image} alt="Product" className="w-full h-full object-contain" /> : <span className="text-3xl">🐾</span>}</div>
                <div className="space-y-2">
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => upload(e.target.files?.[0])} className="text-sm" aria-label="Upload photo" />
                  <p className="text-xs text-gray-500">{uploading ? 'Uploading…' : 'Square photo on a plain background works best. It is resized automatically.'}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Pack sizes, prices &amp; stock</div>
              <div className="space-y-2">
                {editing.form.variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input aria-label="Pack size" placeholder="e.g. 3 kg" value={v.size} onChange={(e) => setV(i, 'size', e.target.value)} className="input-field col-span-4 !py-2" required />
                    <input aria-label="Selling price" type="number" min="1" placeholder="Price ₹" value={v.price} onChange={(e) => setV(i, 'price', e.target.value)} className="input-field col-span-3 !py-2" required />
                    <input aria-label="MRP" type="number" min="1" placeholder="MRP ₹" value={v.mrp} onChange={(e) => setV(i, 'mrp', e.target.value)} className="input-field col-span-3 !py-2" />
                    <input aria-label="Stock" type="number" min="0" step="1" placeholder="Stock" value={v.stock} onChange={(e) => setV(i, 'stock', e.target.value)} className="input-field col-span-2 !py-2" required />
                    {editing.form.variants.length > 1 && <button type="button" onClick={() => setEditing((e) => ({ ...e, form: { ...e.form, variants: e.form.variants.filter((_, n) => n !== i) } }))} className="col-span-12 text-xs text-red-500 text-left -mt-1">Remove this size</button>}
                  </div>
                ))}
              </div>
              {editing.form.variants.length < 8 && <button type="button" onClick={() => setEditing((e) => ({ ...e, form: { ...e.form, variants: [...e.form.variants, { size: '', price: '', mrp: '', stock: 0 }] } }))} className="text-sm font-bold text-brand-primary mt-2">+ Add another size</button>}
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={editing.form.active} onChange={(e) => setF('active', e.target.checked)} className="accent-[#E8622A]" /> Visible in the shop</label>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving || uploading} className="btn-primary px-8 py-3 disabled:opacity-60">{saving ? 'Saving…' : 'Save product'}</button>
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-3 font-semibold text-gray-500">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
