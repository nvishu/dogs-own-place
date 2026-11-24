import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ShopClient from '@/components/shop/ShopClient'
import { getCatalogue } from '@/lib/catalogue'

export const revalidate = 60 // refresh prices & stock at most once a minute

export const metadata = {
  title: 'Shop — Dog Food & Cat Food',
  description: 'Shop premium dog food, puppy food, cat food, kitten food and treats from trusted brands. Clear prices, pack sizes and cash on delivery.',
  alternates: { canonical: '/shop' },
}

export default async function ShopPage() {
  const products = await getCatalogue()
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <ShopClient products={products} />
      <Footer />
    </div>
  )
}
