import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import { istDate } from '@/lib/slots'
import { sendReminder, notifyAgenda } from '@/lib/notify'

export const dynamic = 'force-dynamic'

// Runs once a day (vercel.json → 08:00 IST). Vercel sends "Authorization: Bearer <CRON_SECRET>" automatically
// when the CRON_SECRET environment variable is set. Without the secret this endpoint refuses to run.
export async function GET(request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await connectDB()
    const tomorrow = istDate(1)
    const appts = await Appointment.find({ date: tomorrow, status: { $in: ['pending', 'confirmed'] } }).populate('user', 'name email phone').sort({ time: 1 })
    let sent = 0
    for (const a of appts) {
      if (a.reminderSent || !a.user?.email) continue
      if (await sendReminder(a, a.user)) {
        await Appointment.updateOne({ _id: a._id }, { $set: { reminderSent: true } })
        sent++
      }
    }
    await notifyAgenda(tomorrow, appts)
    return NextResponse.json({ ok: true, date: tomorrow, bookings: appts.length, remindersSent: sent })
  } catch (e) {
    console.error('cron reminders:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
