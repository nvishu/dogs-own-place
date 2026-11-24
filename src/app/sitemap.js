import { SITE } from '@/lib/site'
import { SERVICES } from '@/lib/constants'
import { getCatalogue } from '@/lib/catalogue'

export default async function sitemap() {
  const now = new Date()
  const pages = ['', '/services', '/shop', '/about', '/contact', '/privacy', '/terms', '/refund-policy', '/shipping-policy', '/grievance'].map((p) => ({
    url: `${SITE.url}${p}`, lastModified: now, changeFrequency: p === '' ? 'weekly' : 'monthly', priority: p === '' ? 1 : 0.8,
  }))
  const services = SERVICES.map((s) => ({ url: `${SITE.url}/services/${s.id}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 }))
  const products = (await getCatalogue()).map((p) => ({ url: `${SITE.url}/shop/${p.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 }))
  return [...pages, ...services, ...products]
}
