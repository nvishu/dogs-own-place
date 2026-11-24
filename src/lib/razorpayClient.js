// Browser helper: loads Razorpay Checkout and resolves with the payment result (or rejects if the customer closes it).
let loading
function loadScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser only'))
  if (window.Razorpay) return Promise.resolve()
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.async = true
      s.onload = resolve
      s.onerror = () => { loading = null; reject(new Error('Could not load the payment window. Check your internet connection and try again.')) }
      document.body.appendChild(s)
    })
  }
  return loading
}

export async function openRazorpay({ keyId, razorpayOrderId, amount, currency = 'INR', name, description, prefill }) {
  await loadScript()
  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay({
      key: keyId, order_id: razorpayOrderId, amount, currency, name, description, prefill,
      theme: { color: '#E8622A' },
      handler: (r) => resolve(r),
      modal: { ondismiss: () => { const e = new Error('Payment window closed before completing'); e.dismissed = true; reject(e) } },
    })
    rz.on('payment.failed', (r) => reject(new Error(r?.error?.description || 'Payment failed. Please try again.')))
    rz.open()
  })
}
