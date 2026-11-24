import mongoose from 'mongoose'

let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

/** Error with a short machine code so API routes can show a useful message. */
export class DbConfigError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'DbConfigError'
    this.code = code
  }
}

function checkUri(uri) {
  if (!uri) {
    throw new DbConfigError('DB_NOT_CONFIGURED', 'MONGODB_URI is not set. Add it in Vercel → Settings → Environment Variables, then redeploy.')
  }
  if (/[<>]/.test(uri)) {
    throw new DbConfigError('DB_URI_PLACEHOLDER', 'MONGODB_URI still contains <password> / <user> placeholders. Replace the whole <...> part with the real value (no angle brackets).')
  }
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new DbConfigError('DB_URI_INVALID', 'MONGODB_URI must start with mongodb+srv:// or mongodb://')
  }
}

export async function connectDB() {
  // Checked lazily (not at import time) so `next build` never fails when the
  // variable is only available at runtime.
  const MONGODB_URI = (process.env.MONGODB_URI || '').trim()
  checkUri(MONGODB_URI)

  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        // Atlas free clusters sometimes resolve IPv6 first, which Vercel can't always reach
        family: 4,
      })
      .then((m) => m)
  }
  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    cached.conn = null
    throw e
  }
  return cached.conn
}

/** Turns any DB/config error into { status, code, error } that is safe to show to a visitor. */
export function describeDbError(e) {
  const msg = String(e?.message || '')
  if (e instanceof DbConfigError) {
    return { status: 503, code: e.code, error: 'The website database is not set up yet. Please contact support.' }
  }
  if (/bad auth|authentication failed|auth/i.test(msg)) {
    return { status: 503, code: 'DB_AUTH', error: 'Database login failed. Please contact support.' }
  }
  if (/ENOTFOUND|querySrv|ECONNREFUSED|EAI_AGAIN/i.test(msg)) {
    return { status: 503, code: 'DB_UNREACHABLE', error: 'Cannot reach the database right now. Please try again shortly.' }
  }
  if (/Server selection timed out|MongoServerSelectionError|whitelist|not allowed|ReplicaSetNoPrimary/i.test(msg)) {
    return { status: 503, code: 'DB_NETWORK', error: 'The database is not accepting connections right now. Please try again shortly.' }
  }
  if (/JWT_SECRET/i.test(msg)) {
    return { status: 503, code: 'JWT_SECRET', error: 'Server login settings are incomplete. Please contact support.' }
  }
  return null
}

export default connectDB
