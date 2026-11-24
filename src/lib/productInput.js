import { str } from '@/lib/validate'

export const slugify = (t) => t.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)

/** Validates admin input and returns { value } or { error }. */
export function cleanProductInput(body, { partial = false } = {}) {
  const out = {}
  const need = (k, v, msg) => { if (!partial && !v) throw new Error(msg || `${k} is required`) }
  try {
    for (const [k, max] of [['name', 160], ['brand', 80], ['type', 40], ['tagline', 200], ['suitableFor', 200]]) {
      if (body[k] !== undefined || !partial) { out[k] = str(body[k], max); if (['name', 'brand', 'type'].includes(k)) need(k, out[k], `${k[0].toUpperCase() + k.slice(1)} is required`) }
    }
    if (body.description !== undefined || !partial) out.description = str(body.description, 3000)
    if (body.feeding !== undefined || !partial) out.feeding = str(body.feeding, 1500)
    if (body.category !== undefined || !partial) {
      if (!['dog', 'cat'].includes(body.category)) throw new Error('Category must be dog or cat')
      out.category = body.category
    }
    if (body.highlights !== undefined || !partial) {
      const h = Array.isArray(body.highlights) ? body.highlights : String(body.highlights || '').split('\n')
      out.highlights = h.map((x) => str(x, 200)).filter(Boolean).slice(0, 8)
    }
    if (body.image !== undefined) {
      const img = str(body.image, 300)
      if (img && !/^(\/products\/[\w.\-]+|\/api\/product-image\/[a-f0-9]{24}|https:\/\/[^\s]+)$/i.test(img)) throw new Error('Image must be an uploaded photo, a /products/… file or an https:// link')
      out.image = img
    }
    if (body.active !== undefined) out.active = !!body.active
    if (body.variants !== undefined || !partial) {
      if (!Array.isArray(body.variants) || body.variants.length < 1 || body.variants.length > 8) throw new Error('Add between 1 and 8 pack sizes')
      const seen = new Set()
      out.variants = body.variants.map((v) => {
        const size = str(v?.size, 60), price = Number(v?.price), mrp = Number(v?.mrp), stock = Number(v?.stock)
        if (!size) throw new Error('Every pack size needs a name (e.g. 3 kg)')
        if (seen.has(size.toLowerCase())) throw new Error(`Pack size "${size}" is listed twice`)
        seen.add(size.toLowerCase())
        if (!(price >= 1 && price <= 1000000)) throw new Error(`Enter a valid selling price for ${size}`)
        if (!(mrp >= price)) throw new Error(`MRP for ${size} must be at least the selling price`)
        if (!Number.isInteger(stock) || stock < 0 || stock > 100000) throw new Error(`Stock for ${size} must be a whole number (0 or more)`)
        return { size, price: Math.round(price), mrp: Math.round(mrp), stock }
      })
    }
    return { value: out }
  } catch (e) {
    return { error: e.message }
  }
}
