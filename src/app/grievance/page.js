import LegalLayout, { Section, P, UL } from '@/components/legal/LegalLayout'
import { BUSINESS, POLICY } from '@/lib/business'
import { SITE } from '@/lib/site'

export const metadata = { title: 'Grievance Officer', description: 'How to raise a complaint and who handles it.', alternates: { canonical: '/grievance' } }

export default function GrievancePage() {
  const g = BUSINESS.grievance
  return (
    <LegalLayout current="/grievance" title="Grievance Officer"
      intro="If you have a complaint about a service, an order, your data or anything else on this website, please write to our Grievance Officer.">
      <Section title="Contact details">
        <div className="bg-brand-light rounded-2xl p-5 text-brand-dark leading-relaxed">
          <div><b>Name:</b> {g.name || 'To be updated'}</div>
          <div><b>Designation:</b> {g.designation}</div>
          <div><b>Business:</b> {BUSINESS.legalName}</div>
          {BUSINESS.address && <div><b>Address:</b> {BUSINESS.address}</div>}
          {g.email && <div><b>Email:</b> <a className="text-brand-primary font-semibold" href={`mailto:${g.email}`}>{g.email}</a></div>}
          {g.phone && <div><b>Phone:</b> <a className="text-brand-primary font-semibold" href={`tel:${g.phone.replace(/[^\d+]/g, '')}`}>{g.phone}</a> ({g.hours})</div>}
        </div>
      </Section>
      <Section title="How we handle complaints">
        <UL items={[
          'Include your name, registered email or phone, your order or booking number, and a short description of the problem.',
          `We acknowledge your complaint within ${POLICY.grievanceAckHours} hours.`,
          `We aim to resolve it within ${POLICY.grievanceResolveDays} days of receiving it and will tell you the outcome.`,
        ]} />
      </Section>
      <Section title="If you are still not satisfied">
        <P>You can contact the National Consumer Helpline on 1915 or at consumerhelpline.gov.in. For complaints about how we handle your personal data, you may approach the Data Protection Board of India after first contacting us.</P>
      </Section>
      <Section title="Website">
        <P>{SITE.url}</P>
      </Section>
    </LegalLayout>
  )
}
