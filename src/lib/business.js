// ─────────────────────────────────────────────────────────────────────────────
// Business & policy details — shown in the footer, contact page and legal pages.
// Set the values in Vercel → Settings → Environment Variables (then redeploy),
// or edit the fallbacks below. NEXT_PUBLIC_* values are baked in at build time.
// ─────────────────────────────────────────────────────────────────────────────
import { SITE } from '@/lib/site'

const env = (k, d = '') => (process.env[k] || d).trim()
const list = (v) => v.split(',').map((s) => s.trim()).filter(Boolean)

export const BUSINESS = {
  legalName: env('NEXT_PUBLIC_LEGAL_NAME', "DOG'S OWN PLACE"),
  address: env('NEXT_PUBLIC_ADDRESS'), // full postal address, e.g. "12 Park Street, Kolkata 700016, West Bengal"
  hours: env('NEXT_PUBLIC_HOURS', 'Mon–Sun: 7:00 AM – 9:00 PM'),
  emergencyPhone: env('NEXT_PUBLIC_EMERGENCY_PHONE'), // shown only if set
  gstin: env('NEXT_PUBLIC_GSTIN'), // shown only if set
  fssai: env('NEXT_PUBLIC_FSSAI'), // shown only if set (FSSAI licence / registration number, if you hold one)
  serviceCities: list(env('NEXT_PUBLIC_SERVICE_CITIES')), // e.g. "Kolkata, Howrah" — section hidden if empty
  social: {
    instagram: env('NEXT_PUBLIC_INSTAGRAM'),
    facebook: env('NEXT_PUBLIC_FACEBOOK'),
    youtube: env('NEXT_PUBLIC_YOUTUBE'),
  },
  grievance: {
    name: env('NEXT_PUBLIC_GRIEVANCE_NAME'),
    designation: env('NEXT_PUBLIC_GRIEVANCE_DESIGNATION', 'Grievance Officer'),
    email: env('NEXT_PUBLIC_GRIEVANCE_EMAIL') || SITE.email,
    phone: env('NEXT_PUBLIC_GRIEVANCE_PHONE') || SITE.phone,
    hours: env('NEXT_PUBLIC_GRIEVANCE_HOURS', 'Mon–Sat, 10:00 AM – 6:00 PM'),
  },
}

// Shop delivery rules (client + server both read these). Pincode prefixes: "700,711" allows every pincode starting 700 or 711.
export const SERVICEABLE_PINCODES = list(env('NEXT_PUBLIC_SERVICEABLE_PINCODES'))
export const COD_MAX = Number(env('NEXT_PUBLIC_COD_MAX', '5000')) || 5000 // largest order total allowed with Cash on Delivery (₹)
export const pincodeServiceable = (pin) => SERVICEABLE_PINCODES.length === 0 || SERVICEABLE_PINCODES.some((p) => String(pin).startsWith(p))

// Policy numbers used on every legal page, the cart and the product pages. Change them in ONE place.
export const POLICY = {
  updated: '22 November 2026',
  consentVersion: 'v1-2026-11-22', // bump this when you change the Privacy Policy / Terms materially
  returnWindowHours: 48, // report damaged / wrong / expired items within this time of delivery
  refundDays: '5–7 business days',
  deliveryDays: '2–5 business days',
  serviceCancelHours: 24, // free cancellation up to this many hours before an appointment
  grievanceAckHours: 48,
  grievanceResolveDays: 30,
}

/** "email x or phone y" — only the parts that are configured. */
export const contactText = () =>
  [SITE.email && `email ${SITE.email}`, SITE.phone && `phone ${SITE.phone}`].filter(Boolean).join(' or ') || 'the contact details on our Contact page'

/** Which required business details are still missing (reported — names only — by /api/health). */
export function businessSetupMissing() {
  const missing = []
  if (!BUSINESS.address) missing.push('NEXT_PUBLIC_ADDRESS')
  if (!BUSINESS.grievance.name) missing.push('NEXT_PUBLIC_GRIEVANCE_NAME')
  if (!process.env.NEXT_PUBLIC_PHONE) missing.push('NEXT_PUBLIC_PHONE')
  if (!process.env.NEXT_PUBLIC_EMAIL) missing.push('NEXT_PUBLIC_EMAIL')
  return missing
}
