import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import { requireAdmin } from '@/lib/auth'
import { istDate, TIME_SLOTS } from '@/lib/slots'

export const dynamic = 'force-dynamic'

// Upcoming bookings (today → +N days), grouped by day and sorted by time slot.
export async function GET(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    const days = Math.min(30, Math.max(1, Number(new URL(request.url).searchParams.get('days')) || 14))
    await connectDB()
    const from = istDate(0), to = istDate(days)
    const rows = await Appointment.find({ date: { $gte: from, $lte: to }, status: { $ne: 'cancelled' } }).populate('user', 'name phone email').lean()
    const order = (t) => TIME_SLOTS.indexOf(t)
    rows.sort((a, b) => a.date.localeCompare(b.date) || order(a.time) - order(b.time))
    return NextResponse.json({ from, to, appointments: rows })
  } catch (e) {
    console.error('agenda:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
