// Server-side catalogue: MongoDB products (managed in Admin → Products), with the starter list in
// src/lib/products.js as a fallback until you import it / add your own products.
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { PRODUCTS } from '@/lib/products'

const plain = (d) => ({
  slug: d.slug, name: d.name, brand: d.brand, category: d.category, type: d.type, tagline: d.tagline || '',
  description: d.description || '', highlights: d.highlights || [], suitableFor: d.suitableFor || '', feeding: d.feeding || '',
  image: d.image || '', active: d.active !== false,
  variants: (d.variants || []).map((v) => ({ size: v.size, price: v.price, mrp: v.mrp, stock: v.stock })),
})

/** Active products for the storefront. Never throws: falls back to the starter list if the database is unreachable or empty. */
export async function getCatalogue() {
  try {
    await connectDB()
    const docs = await Product.find({ active: true }).sort({ brand: 1, name: 1 }).lean()
    if (docs.length > 0) return docs.map(plain)
    if ((await Product.estimatedDocumentCount()) > 0) return [] // you hid everything on purpose
  } catch (e) {
    console.error('getCatalogue fallback:', e?.message)
  }
  return PRODUCTS
}

export async function getProductBySlug(slug) {
  try {
    await connectDB()
    const d = await Product.findOne({ slug, active: true }).lean()
    if (d) return plain(d)
    if ((await Product.estimatedDocumentCount()) > 0) return null
  } catch (e) {
    console.error('getProductBySlug fallback:', e?.message)
  }
  return PRODUCTS.find((p) => p.slug === slug) || null
}

/** Is stock being tracked in the database for this product? (false while the starter list is the fallback) */
export async function usingDatabaseCatalogue() {
  await connectDB()
  return (await Product.estimatedDocumentCount()) > 0
}

/** Atomically takes stock. Returns true if every line was reserved; otherwise puts back what it took and returns false. */
export async function reserveStock(lines) {
  const taken = []
  for (const l of lines) {
    const r = await Product.updateOne(
      { slug: l.slug, variants: { $elemMatch: { size: l.size, stock: { $gte: l.qty } } } },
      { $inc: { 'variants.$.stock': -l.qty } },
    )
    if (r.modifiedCount !== 1) { await releaseStock(taken); return false }
    taken.push(l)
  }
  return true
}

export async function releaseStock(lines) {
  for (const l of lines) {
    await Product.updateOne({ slug: l.slug }, { $inc: { 'variants.$[v].stock': l.qty } }, { arrayFilters: [{ 'v.size': l.size }] })
  }
}

export const inStock = (v) => v.stock === undefined || v.stock === null || v.stock > 0
export const LOW_STOCK = 5
