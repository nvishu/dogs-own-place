import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductDetail from '@/components/shop/ProductDetail'
import ProductCard from '@/components/shop/ProductCard'
import { PRODUCTS, startingPrice } from '@/lib/products'
import { getCatalogue, getProductBySlug } from '@/lib/catalogue'
import { SITE } from '@/lib/site'

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }))
}

export const revalidate = 60

export async function generateMetadata({ params }) {
  const p = await getProductBySlug(params.slug)
  if (!p) return { title: 'Product not found' }
  return {
    title: `${p.brand} ${p.name}`,
    description: `${p.tagline}. ${p.description}`.slice(0, 160),
    alternates: { canonical: `/shop/${p.slug}` },
  }
}

export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()
  const all = await getCatalogue()
  const related = all.filter((p) => p.slug !== product.slug && p.category === product.category && (p.type === product.type || p.brand === product.brand)).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.brand} ${product.name}`,
    brand: { '@type': 'Brand', name: product.brand },
    description: product.description,
    image: product.image.startsWith('http') ? product.image : `${SITE.url}${product.image}`,
    offers: {
      '@type': 'AggregateOffer', priceCurrency: 'INR', lowPrice: startingPrice(product),
      highPrice: Math.max(...product.variants.map((v) => v.price)), offerCount: product.variants.length, availability: product.variants.some((v) => v.stock === undefined || v.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16">
        <nav className="text-sm text-gray-500 mb-6 flex flex-wrap gap-1.5" aria-label="Breadcrumb">
          <Link href="/shop" className="hover:text-brand-primary">Shop</Link><span>/</span>
          <span>{product.category === 'dog' ? 'Dog Food' : 'Cat Food'}</span><span>/</span>
          <span className="text-brand-dark font-semibold">{product.brand}</span>
        </nav>
        <ProductDetail product={product} />
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-6">You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">{related.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
          </section>
        )}
      </div>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </div>
  )
}
