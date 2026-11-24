import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import User from '@/models/User'
import { requireUser } from '@/lib/auth'
import { isValidId, readJson, str } from '@/lib/validate'
import { validSlot, hoursUntil, MIN_LEAD_HOURS, ACTIVE_STATUSES, slotCapacity } from '@/lib/slots'
import { POLICY } from '@/lib/business'
import { notifyReschedule } from '@/lib/notify'

export const dynamic = 'force-dynamic'

// POST { date, time } — move a pending/confirmed booking to a new slot.
export async function POST(request, { params }) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    if (!isValidId(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await readJson(request)
    const date = str(body.date, 10), time = str(body.time, 20)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !validSlot(time)) return NextResponse.json({ error: 'Please choose a valid date and time' }, { status: 400 })
    if (hoursUntil(date, time) < MIN_LEAD_HOURS) return NextResponse.json({ error: `Please choose a time at least ${MIN_LEAD_HOURS} hours from now` }, { status: 400 })

    await connectDB()
    const appt = await Appointment.findOne({ _id: params.id, user: user.id })
    if (!appt) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (!['pending', 'confirmed'].includes(appt.status)) return NextResponse.json({ error: 'Only upcoming bookings can be rescheduled' }, { status: 409 })
    if (hoursUntil(appt.date, appt.time) < POLICY.serviceCancelHours) {
      return NextResponse.json({ error: `Bookings can be rescheduled up to ${POLICY.serviceCancelHours} hours before the appointment. Please contact us.` }, { status: 409 })
    }
    if (appt.date === date && appt.time === time) return NextResponse.json({ error: 'That is your current slot' }, { status: 400 })
    if ((await Appointment.countDocuments({ date, time, status: { $in: ACTIVE_STATUSES }, _id: { $ne: appt._id } })) >= slotCapacity()) {
      return NextResponse.json({ error: 'That time slot is full. Please choose another.' }, { status: 409 })
    }
    const before = { date: appt.date, time: appt.time }
    appt.date = date; appt.time = time
    appt.status = 'pending' // owner re-confirms the new time
    appt.reminderSent = false
    appt.rescheduleCount = (appt.rescheduleCount || 0) + 1
    appt.seenByAdmin = false
    await appt.save()
    const customer = await User.findById(user.id).select('name email phone')
    await notifyReschedule(appt, customer, before)
    return NextResponse.json({ success: true, appointment: appt })
  } catch (e) {
    console.error('reschedule:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
