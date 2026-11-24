/**
 * Central API client for Dog's Own Place
 * Automatically attaches the JWT token to every request.
 * Used by every page and component — no more localStorage data calls.
 */

const BASE = ''

// The session JWT lives in an httpOnly cookie set by the server, so JavaScript
// (and any XSS payload) can never read it. Only the non-sensitive user profile
// is cached in localStorage for the UI.
async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  let data = {}
  try { data = await res.json() } catch {}
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') localStorage.removeItem('dop_user')
    throw new Error(data.error || 'Request failed')
  }
  return data
}

function saveUser(data) {
  if (data?.user) localStorage.setItem('dop_user', JSON.stringify(data.user))
}

// ── Auth ──────────────────────────────────────────────────────────────────

export async function apiRegister(body) {
  const data = await request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) })
  saveUser(data)
  return data
}

export async function apiLogin(body) {
  const data = await request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) })
  saveUser(data)
  return data
}

export async function apiLogout() {
  localStorage.removeItem('dop_user')
  localStorage.removeItem('dop_token') // legacy key from older versions
  try { await request('/api/auth/logout', { method: 'POST' }) } catch {}
}

export async function apiUpdateProfile(body) {
  const data = await request('/api/auth/me', { method: 'PATCH', body: JSON.stringify(body) })
  saveUser(data)
  return data
}

export async function apiGetMe() {
  return request('/api/auth/me')
}

// ── Dogs ─────────────────────────────────────────────────────────────────

export async function apiGetDogs() {
  return request('/api/dogs')
}

export async function apiGetDog(id) {
  return request(`/api/dogs/${id}`)
}

export async function apiCreateDog(body) {
  return request('/api/dogs', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiUpdateDog(id, body) {
  return request(`/api/dogs/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
}

export async function apiDeleteDog(id) {
  return request(`/api/dogs/${id}`, { method: 'DELETE' })
}

// ── Appointments ─────────────────────────────────────────────────────────

export async function apiGetAppointments() {
  return request('/api/appointments')
}

export async function apiCreateAppointment(body) {
  return request('/api/appointments', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiCancelAppointment(id, cancelReason = '') {
  return request(`/api/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'cancelled', cancelReason }),
  })
}

// ── Payments ─────────────────────────────────────────────────────────────

export async function apiGetPayments() {
  return request('/api/payments')
}

export async function apiCreatePayment(body) {
  return request('/api/payments', { method: 'POST', body: JSON.stringify(body) })
}

// ── Admin ────────────────────────────────────────────────────────────────

export async function apiAdminStats() {
  return request('/api/admin/stats')
}

export async function apiAdminUsers(search = '') {
  return request(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`)
}

export async function apiAdminToggleUser(userId, isActive) {
  return request('/api/admin/users', { method: 'PATCH', body: JSON.stringify({ userId, isActive }) })
}

export async function apiAdminDeleteUser(userId) {
  return request('/api/admin/users', { method: 'DELETE', body: JSON.stringify({ userId }) })
}

export async function apiAdminBookings(status = 'all', markSeen = false) {
  return request(`/api/admin/bookings?status=${encodeURIComponent(status)}${markSeen ? '&markSeen=1' : ''}`)
}

export async function apiAdminUpdateBooking(bookingId, status) {
  return request('/api/admin/bookings', { method: 'PATCH', body: JSON.stringify({ bookingId, status }) })
}

export async function apiAddHealthRecord(dogId, body) {
  return request(`/api/dogs/${dogId}/health`, { method: 'POST', body: JSON.stringify(body) })
}

// ── Contact (public) & admin inbox ───────────────────────────────────────
export async function apiSendContact(body) {
  return request('/api/contact', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiAdminMessages() {
  return request('/api/admin/messages')
}

export async function apiAdminSetMessageStatus(id, status) {
  return request('/api/admin/messages', { method: 'PATCH', body: JSON.stringify({ id, status }) })
}

export async function apiAdminDeleteMessage(id) {
  return request('/api/admin/messages', { method: 'DELETE', body: JSON.stringify({ id }) })
}


// ── Shop orders ──────────────────────────────────────────────────────────
export async function apiCreateOrder(body) {
  return request('/api/orders', { method: 'POST', body: JSON.stringify(body) })
}
export async function apiGetOrders() {
  return request('/api/orders')
}
export async function apiAdminOrders(markSeen = false) {
  return request(`/api/admin/orders${markSeen ? '?markSeen=1' : ''}`)
}
export async function apiAdminUpdateOrder(orderId, fields) {
  // fields: { status?, courier?, trackingNo? }  (a plain string is treated as the status)
  const body = typeof fields === 'string' ? { status: fields } : fields
  return request('/api/admin/orders', { method: 'PATCH', body: JSON.stringify({ orderId, ...body }) })
}
export async function apiAdminRefundOrder(orderId) {
  return request('/api/admin/refund', { method: 'POST', body: JSON.stringify({ orderId }) })
}
export async function apiCancelOrder(orderId, reason = '') {
  return request(`/api/orders/${orderId}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) })
}
export async function apiPaymentConfig() {
  return request('/api/payments/config')
}
export async function apiRazorpayOrder(kind, id) {
  return request('/api/payments/razorpay/order', { method: 'POST', body: JSON.stringify({ kind, id }) })
}
export async function apiRazorpayVerify(payload) {
  return request('/api/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(payload) })
}

// ── Account (privacy) ────────────────────────────────────────────────────
export async function apiDeleteAccount(password) {
  const data = await request('/api/account/delete', { method: 'POST', body: JSON.stringify({ password }) })
  try { localStorage.removeItem('dop_user') } catch {}
  return data
}

// ── Password reset & email verification ─────────────────────────────────
export async function apiForgotPassword(email) {
  return request('/api/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) })
}
export async function apiResetPassword(token, password) {
  return request('/api/auth/reset', { method: 'POST', body: JSON.stringify({ token, password }) })
}
export async function apiVerifyEmail(token) {
  return request('/api/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
}
export async function apiResendVerification() {
  return request('/api/auth/resend-verification', { method: 'POST' })
}

// ── Booking slots ────────────────────────────────────────────────────────
export async function apiAvailability(date) {
  return request(`/api/appointments/availability?date=${encodeURIComponent(date)}`)
}
export async function apiReschedule(id, date, time) {
  return request(`/api/appointments/${id}/reschedule`, { method: 'POST', body: JSON.stringify({ date, time }) })
}
export async function apiAdminAgenda(days = 14) {
  return request(`/api/admin/agenda?days=${days}`)
}
