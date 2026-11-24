import { NextResponse } from 'next/server'
import Appointment from '@/models/Appointment'
import Dog from '@/models/Dog'
import User from '@/models/User'
import { notifyBooking } from '@/lib/notify'
import { validSlot, hoursUntil, MIN_LEAD_HOURS, ACTIVE_STATUSES, slotCapacity } from '@/lib/slots'
import { requireUser } from '@/lib/auth'
import { SERVICES } from '@/lib/constants'
import { str, isValidId, readJson } from '@/lib/validate'

export const dynamic = 'force-dynamic'

const PLANS = ['basic', 'standard', 'premium']
const HOME_VISIT_FEE = 200

export async function GET(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    const appointments = await Appointment.find({ user: user.id })
      .populate('dog', 'name breed image')
      .sort({ createdAt: -1 })
      .limit(200)
    return NextResponse.json({ appointments })
  } catch (err) {
    console.error('GET /api/appointments:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error

    const body = await readJson(request)
    const serviceId = str(body.serviceId, 40)
    const plan = PLANS.includes(body.plan) ? body.plan : 'standard'
    const date = str(body.date, 10)
    const time = str(body.time, 20)
    const homeVisit = body.homeVisit === true

    // The price is ALWAYS computed on the server — never trusted from the client.
    const service = SERVICES.find((s) => s.id === serviceId)
    if (!service) return NextResponse.json({ error: 'Unknown service' }, { status: 400 })
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      return NextResponse.json({ error: 'Please choose a valid date' }, { status: 400 })
    }
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (new Date(date + 'T00:00:00') < new Date(today.getTime() - 24 * 3600 * 1000)) {
      return NextResponse.json({ error: 'Date cannot be in the past' }, { status: 400 })
    }
    if (!time) return NextResponse.json({ error: 'Please choose a time slot' }, { status: 400 })
    if (!validSlot(time)) return NextResponse.json({ error: 'Please choose one of the available time slots' }, { status: 400 })
    if (hoursUntil(date, time) < MIN_LEAD_HOURS) {
      return NextResponse.json({ error: `Please book at least ${MIN_LEAD_HOURS} hours ahead. Pick a later time or another day.` }, { status: 400 })
    }

    let dogId
    let dogName = ''
    let dogDoc = null
    if (body.dogId) {
      if (!isValidId(String(body.dogId))) return NextResponse.json({ error: 'Invalid dog' }, { status: 400 })
      const dog = await Dog.findOne({ _id: body.dogId, owner: user.id })
      if (!dog) return NextResponse.json({ error: 'Dog not found' }, { status: 404 })
      dogId = dog._id
      dogName = dog.name
      dogDoc = dog
    }

    // Same customer + same service + same slot already booked? Stop accidental double bookings.
    const duplicate = await Appointment.findOne({
      user: user.id, serviceId: service.id, date, time, status: { $in: ['pending', 'confirmed', 'in_progress'] },
    }).select('_id')
    if (duplicate) {
      return NextResponse.json({ error: 'You already have this service booked for that date and time' }, { status: 409 })
    }

    // Slot capacity: only so many bookings per time slot, so we are never overbooked.
    if ((await Appointment.countDocuments({ date, time, status: { $in: ACTIVE_STATUSES } })) >= slotCapacity()) {
      return NextResponse.json({ error: 'Sorry, that time slot has just been filled. Please choose another time.' }, { status: 409 })
    }

    const price = service.price[plan] + (homeVisit ? HOME_VISIT_FEE : 0)

    const appointment = await Appointment.create({
      user: user.id,
      dog: dogId,
      dogName,
      serviceId: service.id,
      serviceName: service.title,
      plan,
      date,
      time,
      notes: str(body.notes, 500),
      address: str(body.address, 300),
      homeVisit,
      price,
      status: 'confirmed',
      paymentStatus: 'unpaid',
    })

    // Alert the owner (email / Telegram) and send the customer a confirmation.
    // Awaited (with a short timeout inside) because serverless functions can freeze right after responding.
    const customer = await User.findById(user.id).select('name email phone city address')
    const sent = await notifyBooking(appointment, customer, dogDoc)
    appointment.ownerNotified = !!(sent.ownerMail || sent.telegram)
    await appointment.save().catch(() => {})

    return NextResponse.json({ success: true, appointment, notified: sent }, { status: 201 })
  } catch (err) {
    console.error('POST /api/appointments:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
