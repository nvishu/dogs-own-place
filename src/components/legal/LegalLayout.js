import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { POLICY } from '@/lib/business'

const LINKS = [
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Service'],
  ['/refund-policy', 'Refund & Cancellation'],
  ['/shipping-policy', 'Shipping & Delivery'],
  ['/grievance', 'Grievance Officer'],
]

export function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl md:text-2xl font-bold text-brand-dark mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
export const P = ({ children }) => <p className="text-brand-brown/80 leading-relaxed">{children}</p>
export const UL = ({ items }) => (
  <ul className="list-disc pl-6 space-y-1.5 text-brand-brown/80 leading-relaxed">
    {items.map((i, n) => <li key={n}>{i}</li>)}
  </ul>
)

export default function LegalLayout({ title, intro, current, children }) {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="page-container pt-28 pb-16 max-w-3xl">
        <nav aria-label="Legal pages" className="flex flex-wrap gap-2 mb-8">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} aria-current={current === href ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition ${current === href ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white border-orange-200 text-brand-dark hover:border-brand-primary'}`}>
              {label}
            </Link>
          ))}
        </nav>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-dark">{title}</h1>
        <p className="text-sm text-gray-500 mt-2">Last updated: {POLICY.updated}</p>
        {intro && <p className="text-brand-brown/80 leading-relaxed mt-5">{intro}</p>}
        <article className="card mt-6 p-6 md:p-8">{children}</article>
      </main>
      <Footer />
    </div>
  )
}
