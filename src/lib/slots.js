// Booking slot rules. All times are Indian Standard Time (IST), regardless of where the server runs.
import { TIME_SLOTS } from '@/lib/constants'

export { TIME_SLOTS }
export const ACTIVE_STATUSES = ['pending', 'confirmed', 'in_progress']
export const MIN_LEAD_HOURS = 2 // earliest you can book/reschedule to: 2 hours from now
export const slotCapacity = () => Math.max(1, Number(process.env.BOOKING_SLOT_CAPACITY) || 3) // bookings allowed per time slot (all services together)

/** "09:00 AM" + "2026-12-01" → Date (IST) */
export function slotStart(date, time) {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time || '')
  if (!m || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return null
  let h = Number(m[1]) % 12
  if (m[3] === 'PM') h += 12
  const d = new Date(`${date}T${String(h).padStart(2, '0')}:${m[2]}:00+05:30`)
  return Number.isNaN(d.getTime()) ? null : d
}

export const hoursUntil = (date, time, now = new Date()) => {
  const s = slotStart(date, time)
  return s ? (s.getTime() - now.getTime()) / 3600000 : null
}

/** YYYY-MM-DD in IST, `offsetDays` from today */
export function istDate(offsetDays = 0, now = new Date()) {
  const ist = new Date(now.getTime() + 5.5 * 3600000 + offsetDays * 86400000)
  return ist.toISOString().slice(0, 10)
}

export const validSlot = (time) => TIME_SLOTS.includes(time)
