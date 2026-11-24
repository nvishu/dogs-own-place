import { NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB, { describeDbError } from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'
import { requireUser } from '@/lib/auth'
import { readJson, str, rateLimit, clientIp } from '@/lib/validate'
import { findVariant, FREE_DELIVERY_ABOVE, DELIVERY_FEE } from '@/lib/products'
import { getCatalogue, usingDatabaseCatalogue, reserveStock, releaseStock } from '@/lib/catalogue'
import { notifyOrder } from '@/lib/notify'
import { razorpayEnabled } from '@/lib/razorpay'
import { COD_MAX, pincodeServiceable } from '@/lib/business'
import { expirePendingOrders } from '@/lib/payments'

export const dynamic = 'force-dynamic'
const PAY_WINDOW_MS = 30 * 60 * 1000

// GET /api/orders — the logged-in customer's orders
export async function GET(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    await expirePendingOrders().catch(() => {})
    const orders = await Order.find({ user: user.id }).sort({ createdAt: -1 }).limit(100)
    return NextResponse.json({ orders })
  } catch (err) {
    console.error('GET /api/orders:', err)
    const known = describeDbError(err)
    return NextResponse.json({ error: known?.error || 'Server error' }, { status: known?.status || 500 })
  }
}

// POST /api/orders — place an order. paymentMethod: "cod" (default) or "online" (Razorpay).
// Prices and stock are ALWAYS taken from the server-side catalogue, never from the browser.
export async function POST(request) {
  let reserved = null
  try {
    const { user, error } = await requireUser(request)
    if (error) return error

    const rl = rateLimit(`order:${user.id}:${clientIp(request)}`, { limit: 10, windowMs: 10 * 60 * 1000 })
    if (!rl.ok) return NextResponse.json({ error: 'Too many orders. Please try again in a few minutes.' }, { status: 429 })

    const body = await readJson(request)
    const paymentMethod = body.paymentMethod === 'online' ? 'online' : 'cod'
    if (paymentMethod === 'online' && !razorpayEnabled()) {
      return NextResponse.json({ error: 'Online payment is not available right now. Please choose Cash on Delivery.' }, { status: 400 })
    }
    const rawItems = Array.isArray(body.items) ? body.items.slice(0, 30) : []
    if (rawItems.length === 0) return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })

    const catalogue = new Map((await getCatalogue()).map((p) => [p.slug, p]))
    const merged = new Map()
    for (const it of rawItems) {
      const product = catalogue.get(str(it?.slug, 100))
      const variant = product && findVariant(product, str(it?.size, 60))
      const qty = Math.floor(Number(it?.qty))
      if (!product || !variant || !(qty >= 1)) {
        return NextResponse.json({ error: 'One of the products in your cart is no longer available. Please refresh your cart.' }, { status: 400 })
      }
      const key = `${product.slug}|${variant.size}`
      const prev = merged.get(key)
      merged.set(key, { product, variant, qty: Math.min(10, (prev?.qty || 0) + qty) })
    }
    const lines = [...merged.values()]
    const items = lines.map(({ product, variant, qty }) => ({ slug: product.slug, name: product.name, brand: product.brand, size: variant.size, price: variant.price, qty, image: product.image }))
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
    const total = subtotal + deliveryFee

    const s = body.shipping || {}
    const shipping = { name: str(s.name, 80), phone: str(s.phone, 20).replace(/[\s-]/g, ''), address: str(s.address, 300), city: str(s.city, 60), pincode: str(s.pincode, 10) }
    if (shipping.name.length < 2) return NextResponse.json({ error: 'Please enter your name' }, { status: 400 })
    if (!/^\d{10}$/.test(shipping.phone)) return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 })
    if (shipping.address.length < 8) return NextResponse.json({ error: 'Please enter your full delivery address' }, { status: 400 })
    if (shipping.city.length < 2) return NextResponse.json({ error: 'Please enter your city' }, { status: 400 })
    if (!/^\d{6}$/.test(shipping.pincode)) return NextResponse.json({ error: 'Please enter a valid 6-digit pincode' }, { status: 400 })
    if (!pincodeServiceable(shipping.pincode)) return NextResponse.json({ error: `Sorry, we do not deliver to pincode ${shipping.pincode} yet.` }, { status: 400 })
    if (paymentMethod === 'cod' && total > COD_MAX) {
      return NextResponse.json({ error: `Cash on Delivery is available up to ₹${COD_MAX.toLocaleString('en-IN')}. Please pay online for this order.` }, { status: 400 })
    }

    await connectDB()
    // Take the stock first (atomic). If someone else just bought the last pack, we say so instead of overselling.
    const tracked = await usingDatabaseCatalogue()
    if (tracked) {
      const ok = await reserveStock(items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty })))
      if (!ok) return NextResponse.json({ error: 'Sorry — one of the items just went out of stock or there is not enough left. Please review your cart.' }, { status: 409 })
      reserved = items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty }))
    }

    const orderNo = 'DOP' + Date.now().toString(36).toUpperCase().slice(-5) + crypto.randomBytes(2).toString('hex').toUpperCase()
    const online = paymentMethod === 'online'
    const order = await Order.create({
      orderNo, user: user.id, items, subtotal, deliveryFee, total, shipping, notes: str(body.notes, 300),
      paymentMethod, stockReserved: !!reserved,
      status: online ? 'pending_payment' : 'placed',
      ...(online ? { expiresAt: new Date(Date.now() + PAY_WINDOW_MS) } : {}),
    })
    reserved = null // order now owns the reservation

    if (!online) {
      const customer = await User.findById(user.id).select('name email')
      await notifyOrder(order, customer)
    } else {
      expirePendingOrders().catch(() => {}) // housekeeping for other customers' abandoned payments
    }
    return NextResponse.json({ success: true, order, paymentRequired: online }, { status: 201 })
  } catch (err) {
    if (reserved) await releaseStock(reserved).catch(() => {})
    console.error('POST /api/orders:', err?.code || '', err?.message, err)
    const known = describeDbError(err)
    return NextResponse.json({ error: known?.error || 'Could not place your order. Please try again.' }, { status: known?.status || 500 })
  }
}
