'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiGetMe, apiAdminAgenda } from '@/lib/apiClient'

const COLORS = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', in_progress: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700' }
const dayLabel = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

export default function AdminAgenda() {
  const router = useRouter()
  const [rows, setRows] = useState(null)
  const [days, setDays] = useState(14)
  const [error, setError] = useState('')

  useEffect(() => {
    apiGetMe().then(({ user }) => {
      if (user.role !== 'admin') return router.replace('/dashboard')
      return apiAdminAgenda(days).then((d) => setRows(d.appointments || []))
    }).catch((e) => { if (/auth|login|token|unauthor/i.test(e.message || '')) router.replace('/auth/login?next=/admin/agenda'); else setError(e.message) })
  }, [router, days])

  const grouped = (rows || []).reduce((m, a) => { (m[a.date] ||= []).push(a); return m }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-dark text-white px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="font-display font-bold text-lg">📅 Upcoming Bookings</div>
        <Link href="/admin" className="text-sm font-semibold text-amber-300 hover:underline">← Admin panel</Link>
      </header>
      <main className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <label htmlFor="days" className="text-sm font-semibold">Show next</label>
          <select id="days" value={days} onChange={(e) => setDays(Number(e.target.value))} className="input-field !py-2 !w-auto text-sm">{[7, 14, 30].map((d) => <option key={d} value={d}>{d} days</option>)}</select>
        </div>
        {error && <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>}
        {rows === null && !error ? <div className="bg-white rounded-2xl h-40 animate-pulse" /> : Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500">No upcoming bookings in this period.</div>
        ) : Object.entries(grouped).map(([date, list]) => (
          <section key={date} className="mb-6">
            <h2 className="font-display font-bold text-brand-dark mb-2">{dayLabel(date)} <span className="text-sm font-semibold text-gray-400">· {list.length} booking{list.length > 1 ? 's' : ''}</span></h2>
            <div className="bg-white rounded-2xl border border-orange-100 divide-y divide-orange-50">
              {list.map((a) => (
                <div key={a._id} className="p-4 flex flex-wrap gap-x-6 gap-y-1 items-start">
                  <div className="font-bold text-brand-primary w-24">{a.time}</div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-bold text-brand-dark">{a.serviceName} <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${COLORS[a.status] || 'bg-gray-100'}`}>{a.status}</span> {a.paymentStatus === 'paid' && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">Paid</span>}</div>
                    <div className="text-sm text-gray-600">{a.user?.name} · <a className="text-brand-primary font-semibold" href={`tel:${a.user?.phone}`}>📞 {a.user?.phone || '-'}</a>{a.dogName ? ` · 🐕 ${a.dogName}` : ''}</div>
                    {a.homeVisit && <div className="text-sm text-gray-600">🏠 {a.address || 'Home visit — address not given'}</div>}
                    {a.notes && <div className="text-xs text-gray-500">Note: {a.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
