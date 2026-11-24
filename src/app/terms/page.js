import Link from 'next/link'
import LegalLayout, { Section, P, UL } from '@/components/legal/LegalLayout'
import { BUSINESS, POLICY } from '@/lib/business'
import { SITE } from '@/lib/site'
import { FREE_DELIVERY_ABOVE, DELIVERY_FEE } from '@/lib/products'

export const metadata = { title: 'Terms of Service', description: `The terms for using ${SITE.name}: bookings, shop orders and your account.`, alternates: { canonical: '/terms' } }

export default function TermsPage() {
  return (
    <LegalLayout current="/terms" title="Terms of Service"
      intro={`These terms govern your use of the ${SITE.name} website, our dog care services and our online shop, operated by ${BUSINESS.legalName}. By creating an account, booking a service or placing an order, you agree to them.`}>
      <Section title="1. Eligibility and your account">
        <UL items={[
          'You must be 18 or older and able to enter a binding contract.',
          'Give accurate information and keep your password confidential. You are responsible for activity under your account.',
          'We may suspend or close accounts that are used for fraud, abuse or in breach of these terms.',
        ]} />
      </Section>
      <Section title="2. Dog care services">
        <UL items={[
          'Prices, plans and available time slots are shown when you book. A booking is confirmed once we confirm it; we may reschedule or decline a slot if we cannot serve it.',
          'A home-visit fee may apply where shown at booking.',
          'You must tell us about your dog’s health, behaviour (for example aggression or bite history) and vaccination status. We may refuse or stop a service if safety is at risk.',
          'Our services are not a substitute for veterinary diagnosis or treatment. In an emergency, go to your nearest veterinary hospital immediately.',
          'You are responsible for your dog’s behaviour and for any damage or injury it causes, as far as the law allows.',
        ]} />
        <P>Cancellation and refunds for services are covered in our <Link className="text-brand-primary font-semibold" href="/refund-policy">Refund &amp; Cancellation Policy</Link>.</P>
      </Section>
      <Section title="3. Shop orders">
        <UL items={[
          'Prices are in Indian Rupees (₹) and include applicable taxes. Delivery is free on orders of ₹' + FREE_DELIVERY_ABOVE.toLocaleString('en-IN') + ' and above; otherwise a delivery fee of ₹' + DELIVERY_FEE + ' applies.',
          'Your order is a request to buy. It is accepted when we confirm it. We may cancel an order, and refund any payment, if an item is out of stock, mispriced or cannot be delivered to your address.',
          'Payment is currently Cash on Delivery. When online payment is added, the amount is charged at checkout.',
          'Product images are for illustration. Please read the pack for ingredients, feeding instructions and expiry. Brand names belong to their owners.',
        ]} />
        <P>Delivery details are in our <Link className="text-brand-primary font-semibold" href="/shipping-policy">Shipping &amp; Delivery Policy</Link>; returns are in the <Link className="text-brand-primary font-semibold" href="/refund-policy">Refund &amp; Cancellation Policy</Link>.</P>
      </Section>
      <Section title="4. Acceptable use">
        <UL items={[
          'Do not misuse the website, attempt to access other people’s data, interfere with its operation, or place fake orders or bookings.',
          'Do not post unlawful, abusive or misleading content in messages or reviews.',
        ]} />
      </Section>
      <Section title="5. Intellectual property">
        <P>The website, its design, text and software belong to {BUSINESS.legalName} or its licensors. Third-party brand names and logos belong to their respective owners. You may not copy or reuse our content without permission.</P>
      </Section>
      <Section title="6. Our responsibility">
        <P>We provide our services with reasonable care and skill. To the extent permitted by law, we are not liable for indirect or consequential losses, or for events beyond our reasonable control. Nothing in these terms limits any right you have under consumer protection law or any liability that cannot legally be excluded.</P>
      </Section>
      <Section title="7. Privacy">
        <P>How we handle your personal data is described in our <Link className="text-brand-primary font-semibold" href="/privacy">Privacy Policy</Link>.</P>
      </Section>
      <Section title="8. Changes">
        <P>We may update these terms. The version in force is the one on this page on the date you book or order (last updated {POLICY.updated}). Continued use after a change means you accept it.</P>
      </Section>
      <Section title="9. Governing law and disputes">
        <P>These terms are governed by the laws of India. Please first contact our <Link className="text-brand-primary font-semibold" href="/grievance">Grievance Officer</Link> so we can try to resolve any complaint. Courts at {BUSINESS.address ? 'the place of our registered office' : 'our place of business'} have jurisdiction, without affecting any rights you have under consumer protection law.</P>
      </Section>
      <Section title="10. Contact">
        <P>{[BUSINESS.legalName, BUSINESS.address, SITE.email, SITE.phone].filter(Boolean).join(' · ')}</P>
      </Section>
    </LegalLayout>
  )
}
