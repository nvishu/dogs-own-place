import Link from 'next/link'
import LegalLayout, { Section, P, UL } from '@/components/legal/LegalLayout'
import { BUSINESS, POLICY, contactText } from '@/lib/business'
import { SITE } from '@/lib/site'

export const metadata = { title: 'Refund & Cancellation Policy', description: 'How cancellations, returns and refunds work for services and shop orders.', alternates: { canonical: '/refund-policy' } }

export default function RefundPage() {
  return (
    <LegalLayout current="/refund-policy" title="Refund & Cancellation Policy"
      intro="We want you and your pet to be happy with every service and order. This page explains how cancellations, returns and refunds work.">
      <Section title="1. Cancelling a service booking">
        <UL items={[
          `You can cancel an upcoming booking from Dashboard → Appointments. Cancel at least ${POLICY.serviceCancelHours} hours before the appointment for a full refund of anything you have paid.`,
          `Cancellations made less than ${POLICY.serviceCancelHours} hours before the appointment, or no-shows, may not be refunded.`,
          'To reschedule, cancel and book a new slot, or contact us and we will help.',
          'If we cancel or cannot provide a booked service, we will offer a new slot or a full refund.',
        ]} />
      </Section>
      <Section title="2. Cancelling a shop order">
        <UL items={[
          'You can cancel an order free of charge before it is shipped. Call or email us with your order number as soon as possible.',
          'Once an order is out for delivery it cannot be cancelled; you may refuse delivery, but please tell us so we can update the order.',
        ]} />
      </Section>
      <Section title="3. Returns and replacements for shop orders">
        <P>Pet food and treats are consumables, so for hygiene and safety we accept returns only in these cases:</P>
        <UL items={[
          'The item arrived damaged, leaking or tampered with.',
          'You received the wrong item, size or flavour.',
          'The item is expired or close to expiry on delivery.',
        ]} />
        <P>Please contact us within <b>{POLICY.returnWindowHours} hours of delivery</b> with your order number and clear photos of the item, its batch/expiry label and the outer packaging. We will arrange a replacement or refund after checking.</P>
        <P>We cannot accept returns of opened packs because of taste or preference, or where a pack has been used, unless there is a genuine quality problem. If your pet does not take to a food, contact us and we will try to help.</P>
      </Section>
      <Section title="4. How refunds are paid">
        <UL items={[
          `Approved refunds are processed within ${POLICY.refundDays}.`,
          'Cash on Delivery orders: refunded by UPI or bank transfer to the details you give us.',
          'Online payments (when available): refunded to the original payment method. Your bank may take extra days to show it.',
          'Delivery charges are refunded only if the cancellation or return is due to our error.',
        ]} />
      </Section>
      <Section title="5. Contact us">
        <P>Contact us: {contactText()} ({BUSINESS.hours}). If you are not satisfied with our response, write to our <Link className="text-brand-primary font-semibold" href="/grievance">Grievance Officer</Link>.</P>
      </Section>
    </LegalLayout>
  )
}
