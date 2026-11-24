import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import { notificationStatus } from '@/lib/notify'
import { businessSetupMissing } from '@/lib/business'
import { razorpayEnabled } from '@/lib/razorpay'

export const dynamic = 'force-dynamic'

// Open  https://YOUR-SITE/api/health  after deploying to see what is (mis)configured.
// Only true/false flags are returned — never secret values.
// Boolean-only checks on the connection string's SHAPE (never its values), to pinpoint typos.
function inspectUri(raw) {
  const uri = (raw || '').trim()
  const rest = uri.replace(/^mongodb(\+srv)?:\/\//, '')
  const authority = rest.split(/[/?]/)[0]
  const host = authority.includes('@') ? authority.slice(authority.lastIndexOf('@') + 1) : authority
  return {
    starts_with_mongodb_scheme: /^mongodb(\+srv)?:\/\//.test(uri),
    has_quotes_or_spaces: /["'\s]/.test(uri),
    has_MONGODB_URI_prefix_pasted: /^MONGODB_URI\s*=/i.test(raw || ''),
    has_angle_brackets: /[<>]/.test(uri),
    has_database_name: /\.mongodb\.net\/[^?]+/.test(uri),
    password_has_unencoded_at_sign: (authority.match(/@/g) || []).length > 1,
    host_looks_like_placeholder: /xxxx|example|cluster0\.\.|\.\./i.test(host) || host.split('.').length < 3,
    host_ends_with_mongodb_net: /\.mongodb\.net$/i.test(host),
  }
}

export async function GET() {
  const env = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    JWT_SECRET_set: !!process.env.JWT_SECRET,
    JWT_SECRET_long_enough: (process.env.JWT_SECRET || '').length >= 32,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
  }

  let database = 'not configured'
  if (env.MONGODB_URI) {
    try {
      await connectDB()
      await mongoose.connection.db.admin().ping()
      database = 'connected'
    } catch (e) {
      // Generic hint only; full details go to the Vercel function logs
      console.error('Health check DB error:', e)
      database = e?.code === 'DB_URI_PLACEHOLDER' ? 'failed: MONGODB_URI still has <password> placeholder brackets'
        : /auth/i.test(e?.message || '') ? 'failed: wrong username/password'
        : /ENOTFOUND|querySrv|ECONNREFUSED/i.test(e?.message || '') ? 'failed: cannot reach cluster (check the connection string)'
        : /whitelist|IP|selection|timed out/i.test(e?.message || '') ? 'failed: Atlas Network Access is blocking Vercel (allow 0.0.0.0/0)'
        : 'failed: see Vercel function logs'
    }
  }

  const ready = database === 'connected' && env.JWT_SECRET_long_enough
  const uri_check = database.startsWith('failed') ? inspectUri(process.env.MONGODB_URI) : undefined
  return NextResponse.json({ ready, database, uri_check, env, notifications: notificationStatus(), business_setup_missing: businessSetupMissing(), payments: { razorpay: razorpayEnabled(), webhook_secret: !!process.env.RAZORPAY_WEBHOOK_SECRET, mock_enabled: process.env.ALLOW_MOCK_PAYMENTS !== 'false' }, cron_secret: !!process.env.CRON_SECRET }, { status: ready ? 200 : 503 })
}
