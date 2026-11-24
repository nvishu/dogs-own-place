import Link from 'next/link'
import LegalLayout, { Section, P, UL } from '@/components/legal/LegalLayout'
import { BUSINESS, POLICY, contactText } from '@/lib/business'
import { SITE } from '@/lib/site'
import { FREE_DELIVERY_ABOVE, DELIVERY_FEE } from '@/lib/products'

export const metadata = { title: 'Shipping & Delivery Policy', description: 'Delivery areas, charges, timelines and what to do if something goes wrong.', alternates: { canonical: '/shipping-policy' } }

export default function ShippingPage() {
  return (
    <LegalLayout current="/shipping-policy" title="Shipping & Delivery Policy"
      intro="How and when your shop order reaches you.">
      <Section title="1. Where we deliver">
        <P>{BUSINESS.serviceCities.length ? `We currently deliver in: ${BUSINESS.serviceCities.join(', ')}.` : 'We deliver to the locations we are able to serve.'} If we cannot deliver to your pincode, we will contact you and cancel the order with a full refund of anything you have paid.</P>
      </Section>
      <Section title="2. Delivery time">
        <P>Orders are usually delivered within <b>{POLICY.deliveryDays}</b> of confirmation. This is an estimate; delays can happen because of weather, festivals or courier issues. We will contact you if there is a significant delay.</P>
      </Section>
      <Section title="3. Delivery charges">
        <UL items={[
          `Free delivery on orders of ₹${FREE_DELIVERY_ABOVE.toLocaleString('en-IN')} and above.`,
          `A delivery fee of ₹${DELIVERY_FEE} applies to smaller orders. The fee is shown in your cart and at checkout before you place the order.`,
        ]} />
      </Section>
      <Section title="4. Payment on delivery">
        <P>We currently accept Cash on Delivery. Please keep the exact amount ready. You can follow your order status under Dashboard → My Orders.</P>
      </Section>
      <Section title="5. When your order arrives">
        <UL items={[
          'Check that the packs are sealed and undamaged before accepting. If a pack is damaged, tell the delivery person and contact us.',
          `Report damaged, wrong or expired items within ${POLICY.returnWindowHours} hours of delivery (see our `,
        ].map((t, i) => (i === 1 ? <span key={i}>{t}<Link className="text-brand-primary font-semibold" href="/refund-policy">Refund &amp; Cancellation Policy</Link>).</span> : t))} />
      </Section>
      <Section title="6. Failed delivery">
        <P>If we cannot reach you or no one is available, we will try again. After repeated failed attempts the order may be cancelled.</P>
      </Section>
      <Section title="7. Questions">
        <P>Contact us: {contactText()} ({BUSINESS.hours}).</P>
      </Section>
    </LegalLayout>
  )
}
