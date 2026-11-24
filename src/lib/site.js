// Single source of truth for business details. Change them here (or via env vars in Vercel).
const envUrl = process.env.NEXT_PUBLIC_APP_URL
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL

export const SITE = {
  name: "DOG'S OWN PLACE",
  shortName: 'DOP',
  tagline: 'Premium dog training, grooming, health & care',
  description:
    "Professional dog training, walking, health checkups, vaccinations, grooming & more. Book trusted dog services online with DOG'S OWN PLACE.",
  url: (envUrl || (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000')).replace(/\/$/, ''),
  // Set these in Vercel (NEXT_PUBLIC_PHONE / NEXT_PUBLIC_EMAIL). Left empty on purpose so no made-up number is ever shown to customers.
  phone: process.env.NEXT_PUBLIC_PHONE || '',
  email: process.env.NEXT_PUBLIC_EMAIL || '',
  // digits only incl. country code, e.g. 919876543210 — the WhatsApp button shows only when set
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '',
  themeColor: '#E8622A',
}
