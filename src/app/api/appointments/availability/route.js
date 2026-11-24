import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import { TIME_SLOTS, ACTIVE_STATUSES, slotCapacity, hoursUntil, MIN_LEAD_HOURS } from '@/lib/slots'

export const dynamic = 'force-dynamic'

// GET /api/appointments/availability?date=YYYY-MM-DD → which time slots are full or already too soon. No personal data.
export async function GET(request) {
  try {
    const date = new URL(request.url).searchParams.get('date') || ''
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: 'date required' }, { status: 400 })
    await connectDB()
    const rows = await Appointment.aggregate([
      { $match: { date, status: { $in: ACTIVE_STATUSES } } },
      { $group: { _id: '$time', n: { $sum: 1 } } },
    ])
    const counts = Object.fromEntries(rows.map((r) => [r._id, r.n]))
    const cap = slotCapacity()
    const unavailable = TIME_SLOTS.filter((t) => (counts[t] || 0) >= cap || hoursUntil(date, t) < MIN_LEAD_HOURS)
    return NextResponse.json({ unavailable }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    console.error('availability:', e?.message)
    return NextResponse.json({ unavailable: [] }) // fail open; the booking API still enforces the limit
  }
}
