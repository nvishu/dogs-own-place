// Razorpay (UPI / cards / netbanking). Keys come from Vercel env vars — never from the browser:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET   (Dashboard → Account & Settings → API keys; start with TEST keys)
//   RAZORPAY_WEBHOOK_SECRET                (Dashboard → Webhooks; used to confirm payments even if the customer closes the tab)
import crypto from 'crypto'

const keyId = () => (process.env.RAZORPAY_KEY_ID || '').trim()
const keySecret = () => (process.env.RAZORPAY_KEY_SECRET || '').trim()
export const razorpayEnabled = () => !!(keyId() && keySecret())
export const razorpayKeyId = keyId

async function rzp(path, { method = 'POST', body } = {}) {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: { Authorization: 'Basic ' + Buffer.from(`${keyId()}:${keySecret()}`).toString('base64'), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(12000),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const e = new Error(data?.error?.description || `Razorpay error ${res.status}`)
    e.status = res.status
    throw e
  }
  return data
}

/** amountRupees is a whole-rupee number; Razorpay wants paise. */
export const createRazorpayOrder = ({ amountRupees, receipt, notes = {} }) =>
  rzp('/orders', { body: { amount: Math.round(amountRupees * 100), currency: 'INR', receipt: String(receipt).slice(0, 40), notes } })

export const refundRazorpayPayment = (paymentId, amountRupees, notes = {}) =>
  rzp(`/payments/${encodeURIComponent(paymentId)}/refund`, { body: { ...(amountRupees ? { amount: Math.round(amountRupees * 100) } : {}), notes } })

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a || ''), 'utf8'), y = Buffer.from(String(b || ''), 'utf8')
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

/** Checkout success signature: HMAC_SHA256(order_id|payment_id, key_secret) */
export function verifyPaymentSignature(orderId, paymentId, signature, secret = keySecret()) {
  if (!orderId || !paymentId || !signature || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')
  return safeEqual(expected, signature)
}

/** Webhook signature: HMAC_SHA256(raw request body, webhook_secret) */
export function verifyWebhookSignature(rawBody, signature, secret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim()) {
  if (!rawBody || !signature || !secret) return false
  return safeEqual(crypto.createHmac('sha256', secret).update(rawBody).digest('hex'), signature)
}
