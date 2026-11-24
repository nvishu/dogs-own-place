import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'

process.env.RAZORPAY_KEY_ID = 'rzp_test_abc'
process.env.RAZORPAY_KEY_SECRET = 'test_secret_123'
process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_456'

const { verifyPaymentSignature, verifyWebhookSignature, razorpayEnabled } = await import('../src/lib/razorpay.js')
const { slotStart, hoursUntil, istDate, validSlot } = await import('../src/lib/slots.js')
const { cleanProductInput, slugify } = await import('../src/lib/productInput.js')
const { consumeToken } = await import('../src/lib/tokens.js')

const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex')

test('razorpay: enabled only with both keys', () => assert.equal(razorpayEnabled(), true))

test('razorpay checkout signature: accepts the genuine one, rejects forged/tampered', () => {
  const good = hmac('test_secret_123', 'order_ABC|pay_XYZ')
  assert.equal(verifyPaymentSignature('order_ABC', 'pay_XYZ', good), true)
  assert.equal(verifyPaymentSignature('order_ABC', 'pay_OTHER', good), false)      // different payment id
  assert.equal(verifyPaymentSignature('order_DEF', 'pay_XYZ', good), false)         // different order id
  assert.equal(verifyPaymentSignature('order_ABC', 'pay_XYZ', good.replace(/.$/, 'x')), false)
  assert.equal(verifyPaymentSignature('order_ABC', 'pay_XYZ', 'short'), false)
  assert.equal(verifyPaymentSignature('order_ABC', 'pay_XYZ', ''), false)
  assert.equal(verifyPaymentSignature('', 'pay_XYZ', good), false)
  assert.equal(verifyPaymentSignature('order_ABC', 'pay_XYZ', hmac('wrong_secret', 'order_ABC|pay_XYZ')), false)
})

test('razorpay webhook signature uses the raw body + webhook secret', () => {
  const raw = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_1', order_id: 'order_1' } } } })
  const sig = hmac('whsec_456', raw)
  assert.equal(verifyWebhookSignature(raw, sig), true)
  assert.equal(verifyWebhookSignature(raw + ' ', sig), false)                       // body changed by one byte
  assert.equal(verifyWebhookSignature(raw, hmac('test_secret_123', raw)), false)    // signed with the wrong secret
  assert.equal(verifyWebhookSignature(raw, null), false)
})

test('slots: IST parsing and lead-time maths', () => {
  assert.equal(slotStart('2026-12-01', '09:00 AM').toISOString(), '2026-12-01T03:30:00.000Z')
  assert.equal(slotStart('2026-12-01', '12:00 PM').toISOString(), '2026-12-01T06:30:00.000Z')
  assert.equal(slotStart('2026-12-01', '06:00 PM').toISOString(), '2026-12-01T12:30:00.000Z')
  assert.equal(slotStart('2026-12-01', '12:00 AM').toISOString(), '2026-11-30T18:30:00.000Z')
  assert.equal(slotStart('2026-12-01', 'noon'), null)
  assert.equal(slotStart('bad', '09:00 AM'), null)
  const now = new Date('2026-12-01T01:30:00Z') // 07:00 IST
  assert.equal(hoursUntil('2026-12-01', '09:00 AM', now), 2)
  assert.ok(hoursUntil('2026-12-01', '08:00 AM', now) < 2)
  assert.equal(istDate(0, new Date('2026-12-01T20:00:00Z')), '2026-12-02') // 01:30 IST next day
  assert.equal(istDate(1, new Date('2026-12-01T10:00:00Z')), '2026-12-02')
  assert.equal(validSlot('09:00 AM'), true)
  assert.equal(validSlot('09:30 AM'), false)
})

test('product input: accepts a good product, rejects bad ones', () => {
  const ok = cleanProductInput({ name: 'Adult Dry', brand: 'Acme', category: 'dog', type: 'Dry Food', highlights: 'a\nb\n\n', image: '/api/product-image/' + 'a'.repeat(24), variants: [{ size: '3 kg', price: 500, mrp: 600, stock: 10 }] })
  assert.ok(ok.value, ok.error)
  assert.deepEqual(ok.value.highlights, ['a', 'b'])
  const bad = (patch) => cleanProductInput({ name: 'X', brand: 'Y', category: 'dog', type: 'Dry Food', variants: [{ size: '1 kg', price: 100, mrp: 120, stock: 1 }], ...patch }).error
  assert.match(bad({ category: 'bird' }), /Category/)
  assert.match(bad({ variants: [] }), /pack sizes/)
  assert.match(bad({ variants: [{ size: '1 kg', price: 100, mrp: 50, stock: 1 }] }), /MRP/)
  assert.match(bad({ variants: [{ size: '1 kg', price: 100, mrp: 120, stock: -1 }] }), /Stock/)
  assert.match(bad({ variants: [{ size: '1 kg', price: 100, mrp: 120, stock: 1.5 }] }), /Stock/)
  assert.match(bad({ variants: [{ size: '1 kg', price: 100, mrp: 120, stock: 1 }, { size: '1 KG', price: 90, mrp: 120, stock: 1 }] }), /twice/)
  assert.match(bad({ image: 'javascript:alert(1)' }), /Image/)
  assert.match(bad({ image: 'http://insecure.example/x.jpg' }), /Image/)
  assert.match(bad({ name: '' }), /Name/)
  assert.equal(slugify("Hill's Science Diet – Adult 7+"), 'hills-science-diet-adult-7')
})

test('tokens: malformed tokens are rejected before touching the database', async () => {
  for (const t of [undefined, null, '', 'abc', 'x'.repeat(64), '../etc', { $ne: '' }, 'A'.repeat(64)]) assert.equal(await consumeToken(t, 'reset'), null)
})
