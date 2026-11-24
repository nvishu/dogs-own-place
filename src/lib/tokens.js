import crypto from 'crypto'
import AuthToken from '@/models/AuthToken'

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex')

export const TOKEN_TTL = { reset: 60 * 60 * 1000, verify: 48 * 60 * 60 * 1000 } // 1 hour / 48 hours

/** Creates a fresh token (invalidating older unused ones of the same type) and returns the RAW token for the email link. */
export async function createToken(userId, type) {
  await AuthToken.deleteMany({ user: userId, type, usedAt: null })
  const raw = crypto.randomBytes(32).toString('hex')
  await AuthToken.create({ user: userId, type, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + TOKEN_TTL[type]) })
  return raw
}

/** Atomically consumes a token: valid only once, only before expiry. Returns the token doc (with .user) or null. */
export async function consumeToken(raw, type) {
  if (typeof raw !== 'string' || !/^[a-f0-9]{64}$/.test(raw)) return null
  return AuthToken.findOneAndUpdate(
    { tokenHash: sha256(raw), type, usedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { usedAt: new Date() } },
    { new: true },
  )
}
