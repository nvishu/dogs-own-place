import Link from 'next/link'
import { SITE } from '@/lib/site'
import { BUSINESS } from '@/lib/business'

const SOCIAL = [
  ['instagram', 'Instagram', '📸'],
  ['facebook', 'Facebook', '📘'],
  ['youtube', 'YouTube', '▶️'],
]

export default function Footer() {
  const year = new Date().getFullYear()
  const socials = SOCIAL.filter(([k]) => BUSINESS.social[k])
  return (
    <footer className="bg-brand-dark text-white">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🐾</span>
              <div>
                <div className="font-display font-bold text-xl leading-none">DOG&apos;S OWN PLACE</div>
                <div className="text-xs text-brand-accent font-semibold tracking-widest">DOP</div>
              </div>
            </div>
            <p className="text-orange-200/70 text-sm leading-relaxed">
              Dog training, grooming, health care and a pet shop — all in one place.
            </p>
            {socials.length > 0 && (
              <div className="flex gap-3 mt-5">
                {socials.map(([k, label, icon]) => (
                  <a key={k} href={BUSINESS.social[k]} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-primary transition-colors text-sm">{icon}</a>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-brand-accent">Services</h4>
            <ul className="space-y-2 text-sm text-orange-200/70">
              {['Dog Training', 'Dog Walking', 'Health Checkup', 'Vaccinations', 'Grooming', 'Daycare'].map(s => (
                <li key={s}>
                  <Link href="/services" className="hover:text-brand-accent transition-colors">🐾 {s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-brand-accent">Quick Links</h4>
            <ul className="space-y-2 text-sm text-orange-200/70">
              {[['Shop', '/shop'], ['My Orders', '/dashboard/orders'], ['About Us', '/about'], ['Contact', '/contact'], ['Dashboard', '/dashboard'], ['Book Appointment', '/dashboard/appointments'], ['Grievance Officer', '/grievance']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-brand-accent transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-brand-accent">Contact</h4>
            <ul className="space-y-3 text-sm text-orange-200/70">
              {BUSINESS.address && <li className="flex gap-2"><span>📍</span><span>{BUSINESS.address}</span></li>}
              {SITE.phone && <li className="flex gap-2"><span>📞</span><a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`} className="hover:text-white transition-colors">{SITE.phone}</a></li>}
              {SITE.email && <li className="flex gap-2"><span>✉️</span><a href={`mailto:${SITE.email}`} className="hover:text-white transition-colors break-all">{SITE.email}</a></li>}
              <li className="flex gap-2"><span>⏰</span><span>{BUSINESS.hours}</span></li>
            </ul>
          </div>
        </div>

        <hr className="border-white/10 my-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-orange-200/50">
          <div className="text-center md:text-left space-y-1">
            <p>© {year} {BUSINESS.legalName}. All rights reserved.</p>
            {(BUSINESS.gstin || BUSINESS.fssai) && (
              <p className="text-xs">{BUSINESS.gstin && <>GSTIN: {BUSINESS.gstin}</>}{BUSINESS.gstin && BUSINESS.fssai && ' · '}{BUSINESS.fssai && <>FSSAI: {BUSINESS.fssai}</>}</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-brand-accent transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand-accent transition-colors">Terms of Service</Link>
            <Link href="/refund-policy" className="hover:text-brand-accent transition-colors">Refund &amp; Cancellation</Link>
            <Link href="/shipping-policy" className="hover:text-brand-accent transition-colors">Shipping &amp; Delivery</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
