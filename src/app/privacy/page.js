import Link from 'next/link'
import LegalLayout, { Section, P, UL } from '@/components/legal/LegalLayout'
import { BUSINESS, contactText } from '@/lib/business'
import { SITE } from '@/lib/site'

export const metadata = { title: 'Privacy Policy', description: `How ${SITE.name} collects, uses and protects your personal data.`, alternates: { canonical: '/privacy' } }

export default function PrivacyPage() {
  const g = BUSINESS.grievance
  return (
    <LegalLayout current="/privacy" title="Privacy Policy"
      intro={`This policy explains what personal data ${BUSINESS.legalName} ("we", "us") collects through ${SITE.url.replace(/^https?:\/\//, '')}, why we collect it, who we share it with and the choices you have.`}>
      <Section title="1. Who we are">
        <P>{BUSINESS.legalName}{BUSINESS.address ? `, ${BUSINESS.address}` : ''}. For contact: {contactText()}. For privacy questions or complaints, contact our <Link className="text-brand-primary font-semibold" href="/grievance">Grievance Officer</Link>{g.name ? ` (${g.name})` : ''}.</P>
      </Section>
      <Section title="2. Personal data we collect">
        <UL items={[
          'Account details: your name, email address, mobile number, city, address and password (stored only as a one-way encrypted hash).',
          'Your dog’s details: name, breed, age, gender, photo and the health or vaccination notes you choose to add.',
          'Bookings: the service, plan, date, time, home-visit address and notes you provide.',
          'Shop orders: items ordered, delivery name, phone number, address, pincode and delivery notes.',
          'Payment records: the amount, method and status of a payment. We do not store your card number, UPI PIN or net-banking credentials; when online payments are enabled, they are handled by our payment gateway.',
          'Messages you send us through the contact form.',
          'Technical data: your IP address and basic request logs, used for security, fraud prevention and fixing errors.',
        ]} />
      </Section>
      <Section title="3. Why we use your data">
        <UL items={[
          'To create and run your account, and to deliver the services and products you order.',
          'To send booking and order confirmations, status updates and replies to your messages.',
          'To keep the website secure and prevent misuse, fraud and spam.',
          'To meet legal, tax and accounting obligations.',
          'To improve our services. We do not use your data for advertising and we do not sell it.',
        ]} />
      </Section>
      <Section title="4. Your consent">
        <P>When you create an account you are asked to accept this policy and our Terms. By doing so you consent to the processing described here. You can withdraw consent at any time by deleting your account from your profile page or by contacting us; withdrawing consent means we can no longer provide the services that depend on that data.</P>
      </Section>
      <Section title="5. Who we share data with">
        <P>We share data only with service providers who help us run the business, and only what they need:</P>
        <UL items={[
          'Hosting and infrastructure: Vercel (website hosting) and MongoDB Atlas (database).',
          'Email delivery: Resend (booking and order emails).',
          'Internal alerts: our team receives booking, order and sign-up alerts (for example on Telegram or email) so we can serve you quickly.',
          'Delivery and service partners: your name, phone number and address, so that an order or home visit can reach you.',
          'Payment gateway: when online payment is available, the gateway processes your payment details under its own privacy policy.',
          'Authorities: where the law requires us to disclose information.',
        ]} />
        <P>Some of these providers store data on servers outside India. We choose reputable providers and share only what is necessary.</P>
      </Section>
      <Section title="6. Cookies and local storage">
        <P>We use one essential cookie to keep you logged in, and your browser’s local storage to remember your shopping cart and basic profile details for faster loading. We do not currently use advertising or analytics cookies. If that changes we will update this page and ask for your consent where required.</P>
      </Section>
      <Section title="7. How long we keep data">
        <UL items={[
          'Account, dog and booking data: kept while your account is active and deleted when you delete your account.',
          'Order and payment records: kept for the period required by tax and accounting law, even after your account is deleted, with your account link removed where possible.',
          'Contact messages: kept for as long as needed to resolve your query.',
          'Backups may hold deleted data for a short period before they are overwritten.',
        ]} />
      </Section>
      <Section title="8. Security">
        <P>Passwords are stored hashed, traffic is encrypted with HTTPS and access to customer data is limited to authorised staff. No online system is completely secure, so please use a strong, unique password. If a personal data breach affects you, we will inform you and the authorities as the law requires.</P>
      </Section>
      <Section title="9. Your rights">
        <UL items={[
          'Access: download a copy of your data from your profile page (Dashboard → My Profile → Download my data).',
          'Correction: update your details on your profile page or ask us to correct them.',
          'Erasure: delete your account and data from your profile page (subject to the legal retention in section 7).',
          'Withdraw consent: as described in section 4.',
          'Grievance: raise a complaint with our Grievance Officer. If you are not satisfied with our response you may complain to the Data Protection Board of India.',
          'Nominate: you may nominate another person to exercise your rights if you die or become unable to do so.',
        ]} />
      </Section>
      <Section title="10. Children">
        <P>Our accounts are for adults aged 18 or over. We do not knowingly collect personal data of children. If you believe a child has given us their data, contact us and we will delete it.</P>
      </Section>
      <Section title="11. Changes to this policy">
        <P>We may update this policy from time to time. The “last updated” date above shows the current version, and we will ask you to accept it again if the changes are significant.</P>
      </Section>
      <Section title="12. Contact us">
        <P>{g.email || g.phone ? `Email ${g.email || '—'} or call ${g.phone || '—'} (${g.hours}).` : 'Please use the contact details on our Contact page.'}</P>
      </Section>
    </LegalLayout>
  )
}
