import { apiRazorpayOrder, apiRazorpayVerify } from '@/lib/apiClient'
import { openRazorpay } from '@/lib/razorpayClient'

/** Runs the whole online payment for an order or a booking. Resolves with the server's verify response; rejects with an Error (e.dismissed = customer closed the window). */
export async function payOnline(kind, id) {
  const o = await apiRazorpayOrder(kind, id)
  const r = await openRazorpay({ keyId: o.keyId, razorpayOrderId: o.razorpayOrderId, amount: o.amount, currency: o.currency, name: o.name, description: o.description, prefill: o.prefill })
  return apiRazorpayVerify({ kind, id, razorpay_order_id: r.razorpay_order_id, razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature })
}
