import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'
import { isValidId } from '@/lib/validate'

export const dynamic = 'force-dynamic'

// GET /api/orders/[id] — one order. The owner (customer) or the admin may read it (used by the invoice page).
export async function GET(request, { params }) {
  try {
    const { user, error } = await requireAuth(request)
    if (error) return error
    if (!isValidId(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await connectDB()
    const filter = user.role === 'admin' ? { _id: params.id } : { _id: params.id, user: user.id }
    const order = await Order.findOne(filter)
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const customer = await User.findById(order.user).select('name email')
    return NextResponse.json({ order, customer })
  } catch (e) {
    console.error('GET /api/orders/[id]:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
