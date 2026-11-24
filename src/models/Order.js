import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  slug: String,
  name: String,
  brand: String,
  size: String,
  price: Number, // unit price at time of purchase (taken from the server catalogue)
  qty: Number,
  image: String,
}, { _id: false })

const OrderSchema = new mongoose.Schema({
  orderNo:   { type: String, unique: true, index: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items:     { type: [OrderItemSchema], validate: (v) => v.length > 0 },
  subtotal:  { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  total:     { type: Number, required: true },
  shipping: {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    address: { type: String, required: true },
    city:    { type: String, required: true },
    pincode: { type: String, required: true },
  },
  notes:         { type: String, default: '' },
  paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refund_pending', 'refunded'], default: 'unpaid' },
  status:        { type: String, enum: ['pending_payment', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'placed', index: true },
  // online payment (Razorpay)
  razorpayOrderId:   { type: String, default: '', index: true },
  razorpayPaymentId: { type: String, default: '' },
  paidAt:            { type: Date },
  expiresAt:         { type: Date }, // unpaid online orders are released after this
  refundId:          { type: String, default: '' },
  refundedAt:        { type: Date },
  stockReserved:     { type: Boolean, default: false },
  // fulfilment
  courier:           { type: String, default: '' },
  trackingNo:        { type: String, default: '' },
  cancelledBy:       { type: String, enum: ['', 'customer', 'admin', 'system'], default: '' },
  cancelReason:      { type: String, default: '' },
  cancelledAt:       { type: Date },
  seenByAdmin:   { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)
