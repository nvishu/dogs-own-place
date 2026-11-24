// Owner + customer notifications. Everything here is best-effort: a failed alert
// NEVER blocks a booking or sign-up (the booking is already saved in MongoDB and
// shows up in Admin → Bookings either way).
//
// Channels (all optional, enable any you like via env vars):
//   • Email  – Resend (resend.com, free tier):  RESEND_API_KEY, OWNER_EMAIL (or CONTACT_TO_EMAIL), CONTACT_FROM_EMAIL
//   • Phone push – Telegram bot (free, instant):  TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

import { SITE } from '@/lib/site'

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

function withTimeout(promise, ms = 4000) {
  return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])
}

function ownerEmail() {
  return process.env.OWNER_EMAIL || process.env.CONTACT_TO_EMAIL || ''
}

export async function sendEmail({ to, subject, html, text, replyTo }) {
  const key = process.env.RESEND_API_KEY
  if (!key || !to) return false
  try {
    const res = await withTimeout(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || `${SITE.name} <onboarding@resend.dev>`,
        to: [to], subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    }))
    if (!res.ok) console.error('Resend error', res.status, await res.text().catch(() => ''))
    return res.ok
  } catch (e) {
    console.error('Email failed:', e?.message)
    return false
  }
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) return false
  try {
    const res = await withTimeout(fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    }))
    if (!res.ok) console.error('Telegram error', res.status)
    return res.ok
  } catch (e) {
    console.error('Telegram failed:', e?.message)
    return false
  }
}

function shell(title, body) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #f1d9c9;border-radius:16px;overflow:hidden">
  <div style="background:#E8622A;color:#fff;padding:18px 22px;font-size:18px;font-weight:700">🐾 ${esc(SITE.name)}</div>
  <div style="padding:22px;color:#3b2a1a"><h2 style="margin:0 0 12px">${esc(title)}</h2>${body}</div>
  <div style="background:#fff6ee;padding:12px 22px;font-size:12px;color:#8a6a50">${esc([SITE.phone, SITE.email].filter(Boolean).join(' · '))}</div></div>`
}

const row = (k, v) => `<tr><td style="padding:6px 12px 6px 0;color:#8a6a50">${esc(k)}</td><td style="padding:6px 0;font-weight:600">${esc(v) || '-'}</td></tr>`

/** New booking → owner (email + Telegram) and customer (email). Returns what was sent. */
export async function notifyBooking(appt, user, dog) {
  const when = `${appt.date} at ${appt.time}`
  const adminUrl = `${SITE.url}/admin`
  const lines = [
    ['Service', `${appt.serviceName} (${appt.plan})`],
    ['When', when],
    ['Price', inr(appt.price)],
    ['Customer', user?.name],
    ['Phone', user?.phone],
    ['Email', user?.email],
    ['City', user?.city],
    ['Dog', dog?.name || appt.dogName || 'Not specified'],
    ['Home visit', appt.homeVisit ? `Yes — ${appt.address || user?.address || 'address not given'}` : 'No (visit centre)'],
    ['Notes', appt.notes],
    ['Booking ID', String(appt._id)],
  ]
  const table = `<table style="border-collapse:collapse;font-size:14px">${lines.map(([k, v]) => row(k, v)).join('')}</table>`

  const tg = `🐾 <b>New booking!</b>\n<b>${esc(appt.serviceName)}</b> (${esc(appt.plan)}) — ${esc(inr(appt.price))}\n📅 ${esc(when)}\n👤 ${esc(user?.name)} · ${esc(user?.phone || '-')}\n🐕 ${esc(dog?.name || appt.dogName || '-')}\n${appt.homeVisit ? '🏠 Home visit\n' : ''}${adminUrl}`

  const [ownerMail, telegram, customerMail] = await Promise.all([
    sendEmail({
      to: ownerEmail(),
      subject: `New booking: ${appt.serviceName} — ${when}`,
      html: shell('New booking received', table + `<p><a href="${adminUrl}" style="background:#E8622A;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700">Open admin panel</a></p>`),
      text: lines.map(([k, v]) => `${k}: ${v || '-'}`).join('\n'),
      replyTo: user?.email,
    }),
    sendTelegram(tg),
    sendEmail({
      to: user?.email,
      subject: `Booking confirmed: ${appt.serviceName} on ${appt.date}`,
      html: shell('Your booking is confirmed 🎉', `<p>Hi ${esc(user?.name?.split(' ')[0] || 'there')}, thanks for booking with us. Here are your details:</p>${table}<p style="font-size:13px;color:#8a6a50">You can view or cancel this booking any time from your dashboard.</p><p><a href="${SITE.url}/dashboard/appointments" style="background:#E8622A;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700">View my bookings</a></p>`),
    }),
  ])
  return { ownerMail, telegram, customerMail }
}

/** New shop order → owner (email + Telegram) and customer (email). */
export async function notifyOrder(order, customer) {
  try {
    const ship = order.shipping || {}
    const itemsText = order.items.map((i) => `${i.qty} × ${i.brand} ${i.name} (${i.size}) — ${inr(i.price * i.qty)}`)
    const rows = order.items.map((i) => `<tr><td style="padding:6px 10px 6px 0">${esc(i.qty)} × ${esc(i.brand)} ${esc(i.name)} <span style="color:#8a6a50">(${esc(i.size)})</span></td><td style="padding:6px 0;text-align:right;font-weight:600">${esc(inr(i.price * i.qty))}</td></tr>`).join('')
    const totals = `<tr><td style="padding:6px 0;color:#8a6a50">Delivery</td><td style="text-align:right">${order.deliveryFee ? esc(inr(order.deliveryFee)) : 'FREE'}</td></tr><tr><td style="padding:8px 0;font-weight:700">${order.paymentMethod === 'online' ? 'Total (paid online)' : 'Total (Cash on Delivery)'}</td><td style="text-align:right;font-weight:700;color:#E8622A">${esc(inr(order.total))}</td></tr>`
    const address = `${esc(ship.name)}<br>${esc(ship.address)}<br>${esc(ship.city)} – ${esc(ship.pincode)}<br>📞 ${esc(ship.phone)}`
    const body = `<table style="border-collapse:collapse;font-size:14px;width:100%">${rows}${totals}</table><p style="font-size:14px"><b>Deliver to:</b><br>${address}</p>${order.notes ? `<p style="font-size:13px"><b>Note:</b> ${esc(order.notes)}</p>` : ''}`
    const tg = `🛒 <b>New shop order ${esc(order.orderNo)}</b>\n${itemsText.map(esc).join('\n')}\n💰 <b>${esc(inr(order.total))}</b> (${order.paymentMethod === 'online' ? 'PAID online' : 'COD'})\n👤 ${esc(ship.name)} · ${esc(ship.phone)}\n📍 ${esc(ship.city)} ${esc(ship.pincode)}\n${SITE.url}/admin/orders`
    await Promise.all([
      sendEmail({
        to: ownerEmail(),
        subject: `New order ${order.orderNo} — ${inr(order.total)}`,
        html: shell(`New order ${order.orderNo}`, body + `<p><a href="${SITE.url}/admin/orders" style="background:#E8622A;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700">Open orders</a></p>`),
        text: `Order ${order.orderNo}\n${itemsText.join('\n')}\nTotal ${inr(order.total)} (${order.paymentMethod === 'online' ? 'paid online' : 'COD'})\n${ship.name} ${ship.phone}\n${ship.address}, ${ship.city} ${ship.pincode}`,
        replyTo: customer?.email,
      }),
      sendTelegram(tg),
      sendEmail({
        to: customer?.email,
        subject: `Order received: ${order.orderNo}`,
        html: shell('Thanks for your order! 🐾', `<p>We\'ve received your order <b>${esc(order.orderNo)}</b> and will confirm it shortly. ${order.paymentMethod === 'online' ? 'Your payment has been received.' : 'You pay in cash when it arrives.'}</p>${body}<p><a href="${SITE.url}/dashboard/orders" style="background:#E8622A;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700">Track my order</a></p>`),
      }),
    ])
  } catch (e) {
    console.error('notifyOrder failed:', e?.message)
  }
}

/** New sign-up → owner alert + welcome email. */
export async function notifyNewUser(user) {
  try {
    await Promise.all([
      sendEmail({
        to: ownerEmail(),
        subject: `New customer signed up: ${user.name}`,
        html: shell('New sign-up', `<table style="border-collapse:collapse;font-size:14px">${row('Name', user.name)}${row('Email', user.email)}${row('Phone', user.phone)}${row('City', user.city)}</table>`),
        text: `New sign-up: ${user.name} <${user.email}> ${user.phone || ''} ${user.city || ''}`,
      }),
      sendTelegram(`👤 <b>New sign-up</b>\n${esc(user.name)} · ${esc(user.phone || '-')}\n${esc(user.city || '')}`),
      sendEmail({
        to: user.email,
        subject: `Welcome to ${SITE.name} 🐾`,
        html: shell(`Welcome, ${user.name.split(' ')[0]}!`, `<p>Your account is ready. Add your dog and book your first service from your dashboard.</p><p><a href="${SITE.url}/dashboard" style="background:#E8622A;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700">Go to dashboard</a></p>`),
      }),
    ])
  } catch (e) {
    console.error('notifyNewUser failed:', e?.message)
  }
}

/** Customer moved a booking → tell the owner. */
export async function notifyReschedule(appt, customer, before) {
  try {
    const t = `${appt.serviceName}: ${customer?.name || 'Customer'} moved their booking from ${before.date} ${before.time} to ${appt.date} ${appt.time}. Please re-confirm.`
    await Promise.all([
      sendEmail({ to: ownerEmail(), subject: `Booking rescheduled: ${appt.serviceName}`, html: shell('Booking rescheduled', `<p>${esc(t)}</p><p>📞 ${esc(customer?.phone || '')}</p><p><a href="${SITE.url}/admin">Open admin panel</a></p>`), text: t }),
      sendTelegram(`🔁 <b>Booking rescheduled</b>\n${esc(t)}\n📞 ${esc(customer?.phone || '-')}`),
    ])
  } catch (e) { console.error('notifyReschedule failed:', e?.message) }
}

/** Day-before reminder to the customer. */
export async function sendReminder(appt, customer) {
  return sendEmail({
    to: customer?.email,
    subject: `Reminder: ${appt.serviceName} tomorrow at ${appt.time}`,
    html: shell('See you tomorrow! 🐾', `<p>Hi ${esc(customer?.name?.split(' ')[0] || 'there')}, a quick reminder about your booking:</p><p><b>${esc(appt.serviceName)}</b><br>${esc(appt.date)} at ${esc(appt.time)}${appt.dogName ? `<br>For: ${esc(appt.dogName)}` : ''}${appt.homeVisit ? '<br>🏠 Home visit' : ''}</p><p>Need to change it? <a href="${SITE.url}/dashboard/appointments">Manage my bookings</a></p>`),
  })
}

/** Morning summary of tomorrow's bookings for the owner. */
export async function notifyAgenda(date, appts) {
  try {
    if (!appts.length) return
    const lines = appts.map((a) => `${a.time} — ${a.serviceName}${a.dogName ? ` (${a.dogName})` : ''} · ${a.user?.name || ''} ${a.user?.phone || ''}${a.homeVisit ? ' 🏠' : ''}`)
    await Promise.all([
      sendTelegram(`📅 <b>Tomorrow (${esc(date)}): ${appts.length} booking${appts.length > 1 ? 's' : ''}</b>\n${lines.map(esc).join('\n')}`),
      sendEmail({ to: ownerEmail(), subject: `Tomorrow's bookings (${date}): ${appts.length}`, html: shell(`Bookings for ${date}`, `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`), text: lines.join('\n') }),
    ])
  } catch (e) { console.error('notifyAgenda failed:', e?.message) }
}

/** Something needs the owner's attention (refund needed, etc.). */
export async function notifyPaymentProblem(text) {
  try {
    await Promise.all([
      sendEmail({ to: ownerEmail(), subject: 'Payment needs your attention', html: shell('Payment needs attention', `<p>${esc(text)}</p><p><a href="${SITE.url}/admin/orders">Open orders</a></p>`), text }),
      sendTelegram(`⚠️ <b>Payment needs attention</b>\n${esc(text)}`),
    ])
  } catch (e) { console.error('notifyPaymentProblem failed:', e?.message) }
}

/** Customer cancelled a shop order → tell the owner. */
export async function notifyOrderCancelled(order, customer, refundNeeded) {
  try {
    const t = `Order ${order.orderNo} (${inr(order.total)}) was cancelled by ${order.cancelledBy || 'the customer'}${refundNeeded ? ' — it was PAID online, so a refund is needed' : ''}.`
    await Promise.all([
      sendEmail({ to: ownerEmail(), subject: `Order cancelled: ${order.orderNo}`, html: shell('Order cancelled', `<p>${esc(t)}</p><p>${esc(customer?.name || '')} ${esc(order.shipping?.phone || '')}</p>`), text: t }),
      sendTelegram(`❌ <b>Order cancelled</b>\n${esc(t)}`),
    ])
  } catch (e) { console.error('notifyOrderCancelled failed:', e?.message) }
}

/** Customer gets an email when the owner moves the order along. */
export async function notifyOrderStatus(order, customerEmail) {
  try {
    if (!customerEmail) return
    const labels = { confirmed: 'confirmed ✅', shipped: 'on its way 🚚', delivered: 'delivered 🎉', cancelled: 'cancelled' }
    if (!labels[order.status]) return
    const track = order.status === 'shipped' && (order.courier || order.trackingNo) ? `<p><b>Courier:</b> ${esc(order.courier || '-')}<br><b>Tracking no.:</b> ${esc(order.trackingNo || '-')}</p>` : ''
    await sendEmail({
      to: customerEmail,
      subject: `Your order ${order.orderNo} is ${labels[order.status]}`,
      html: shell('Order update', `<p>Your order <b>${esc(order.orderNo)}</b> is now <b>${esc(labels[order.status])}</b>.</p>${track}<p><a href="${SITE.url}/dashboard/orders">View my orders</a></p>`),
    })
  } catch (e) { console.error('notifyOrderStatus failed:', e?.message) }
}

/** Password reset / email verification mails (customer only). Returns true if the mail provider accepted it. */
export async function sendResetEmail(user, link) {
  return sendEmail({
    to: user.email,
    subject: `Reset your ${SITE.name} password`,
    html: shell('Reset your password', `<p>Hi ${esc(user.name?.split(' ')[0] || 'there')}, we received a request to reset your password. This link works for 1 hour and can be used once.</p><p><a href="${esc(link)}" style="background:#E8622A;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700">Choose a new password</a></p><p style="font-size:12px;color:#8a6a50">If you didn't ask for this, you can ignore this email — your password won't change.</p>`),
    text: `Reset your password (valid 1 hour): ${link}\nIf you didn't ask for this, ignore this email.`,
  })
}
export async function sendVerifyEmail(user, link) {
  return sendEmail({
    to: user.email,
    subject: `Verify your email for ${SITE.name}`,
    html: shell('Verify your email', `<p>Hi ${esc(user.name?.split(' ')[0] || 'there')}, please confirm your email address so we can send you booking and order updates.</p><p><a href="${esc(link)}" style="background:#E8622A;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700">Verify my email</a></p>`),
    text: `Verify your email: ${link}`,
  })
}

/** Customer cancelled → tell the owner. */
export async function notifyCancellation(appt, user) {
  try {
    await Promise.all([
      sendEmail({
        to: ownerEmail(),
        subject: `Booking cancelled: ${appt.serviceName} — ${appt.date} ${appt.time}`,
        html: shell('Booking cancelled by customer', `<table style="border-collapse:collapse;font-size:14px">${row('Service', appt.serviceName)}${row('When', `${appt.date} at ${appt.time}`)}${row('Customer', user?.name)}${row('Phone', user?.phone)}${row('Reason', appt.cancelReason)}</table>`),
      }),
      sendTelegram(`❌ <b>Booking cancelled</b>\n${esc(appt.serviceName)} — ${esc(appt.date)} ${esc(appt.time)}\n👤 ${esc(user?.name)} · ${esc(user?.phone || '-')}`),
    ])
  } catch (e) {
    console.error('notifyCancellation failed:', e?.message)
  }
}

/** Customer gets an email when the owner changes the booking status in the admin panel. */
export async function notifyStatusChange(appt, user) {
  try {
    const labels = { confirmed: 'confirmed ✅', in_progress: 'now in progress', completed: 'completed 🎉', cancelled: 'cancelled', pending: 'pending' }
    await sendEmail({
      to: user?.email,
      subject: `Your ${appt.serviceName} booking is ${labels[appt.status] || appt.status}`,
      html: shell('Booking update', `<p>Your <b>${esc(appt.serviceName)}</b> booking on <b>${esc(appt.date)} at ${esc(appt.time)}</b> is now <b>${esc(labels[appt.status] || appt.status)}</b>.</p><p><a href="${SITE.url}/dashboard/appointments">View my bookings</a></p>`),
    })
  } catch (e) {
    console.error('notifyStatusChange failed:', e?.message)
  }
}

export function notificationStatus() {
  return {
    email: !!(process.env.RESEND_API_KEY && ownerEmail()),
    telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  }
}
