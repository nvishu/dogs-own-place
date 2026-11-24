import mongoose from 'mongoose'

const AppointmentSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dog:         { type: mongoose.Schema.Types.ObjectId, ref: 'Dog' },
  dogName:     { type: String, default: '' },
  serviceId:   { type: String, required: true },
  serviceName: { type: String, required: true },
  plan:        { type: String, enum: ['basic', 'standard', 'premium'], default: 'standard' },
  date:        { type: String, required: true },
  time:        { type: String, required: true },
  notes:       { type: String, default: '' },
  address:     { type: String, default: '' },
  homeVisit:   { type: Boolean, default: false },
  price:       { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'confirmed',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  paymentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  cancelReason:{ type: String, default: '' },
  razorpayOrderId: { type: String, default: '', index: true },
  ownerNotified:{ type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false },
  rescheduleCount: { type: Number, default: 0 },
  seenByAdmin: { type: Boolean, default: false },
}, { timestamps: true })

// Index for fast user lookups
AppointmentSchema.index({ user: 1, createdAt: -1 })
AppointmentSchema.index({ status: 1 })
AppointmentSchema.index({ date: 1 })

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema)
