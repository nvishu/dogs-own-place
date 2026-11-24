import mongoose from 'mongoose'

// One-time tokens for password reset and email verification.
// Only a SHA-256 hash is stored, so a database leak cannot be used to reset anyone's password.
const AuthTokenSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:      { type: String, enum: ['reset', 'verify'], required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // MongoDB deletes expired tokens automatically
  usedAt:    { type: Date, default: null },
}, { timestamps: true })

export default mongoose.models.AuthToken || mongoose.model('AuthToken', AuthTokenSchema)
