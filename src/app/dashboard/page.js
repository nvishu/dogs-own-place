'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES } from '@/lib/constants'
import { SITE } from '@/lib/site'
import toast from 'react-hot-toast'
import { apiGetMe, apiGetDogs, apiGetAppointments, apiResendVerification } from '@/lib/apiClient'

const STATUS = {
  pending:     { label: 'Pending',     cls: 'bg-yellow-100 text-yellow-700' },
  confirmed:   { label: 'Confirmed',   cls: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In progress', cls: 'bg-purple-100 text-purple-700' },
  completed:   { label: 'Completed',   cls: 'bg-green-100 text-green-700' },
  cancelled:   { label: 'Cancelled',   cls: 'bg-red-100 text-red-600' },
}

const apptDate = (a) => new Date(`${a.date}T00:00:00`)
const prettyDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

function daysUntil(a) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((apptDate(a) - today) / 86400000)
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [dogs, setDogs] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [resending, setResending] = useState(false)
  const resend = async () => {
    setResending(true)
    try { await apiResendVerification(); toast.success('Verification email sent — check your inbox') }
    catch (e) { toast.error(e.message || 'Could not send the email') }
    finally { setResending(false) }
  }

  useEffect(() => {
    let alive = true
    const boot = async () => {
      // Show the cached profile instantly, then confirm the session with the server
      // (so a logged-out / deactivated / expired session is caught right away).
      try {
        const cached = localStorage.getItem('dop_user')
        if (cached && alive) setUser(JSON.parse(cached))
      } catch {}
      try {
        const me = await apiGetMe()
        if (!alive) return
        if (me.user?.role === 'admin') { router.replace('/admin'); return }
        setUser(me.user)
        localStorage.setItem('dop_user', JSON.stringify(me.user))
      } catch {
        localStorage.removeItem('dop_user')
        router.replace('/auth/login')
        return
      }
      try {
        const [d, a] = await Promise.all([apiGetDogs(), apiGetAppointments()])
        if (!alive) return
        setDogs(d.dogs || [])
        setAppointments(a.appointments || [])
      } catch (e) {
        if (alive) setLoadError(e.message || 'Could not load your data. Pull to refresh or try again.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    boot()
    return () => { alive = false }
  }, [router])

  const { upcoming, past, next, totalSpent, unpaid } = useMemo(() => {
    const active = appointments.filter((a) => ['pending', 'confirmed', 'in_progress'].includes(a.status))
    const up = active.filter((a) => daysUntil(a) >= 0).sort((a, b) => apptDate(a) - apptDate(b))
    return {
      upcoming: up,
      past: appointments.filter((a) => a.status === 'completed').slice(0, 3),
      next: up[0] || null,
      totalSpent: appointments.filter((a) => a.paymentStatus === 'paid').reduce((s, a) => s + (a.price || 0), 0),
      unpaid: appointments.filter((a) => a.paymentStatus === 'unpaid' && a.status !== 'cancelled'),
    }
  }, [appointments])

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">🐾</div></div>
  }

  // Profile completeness drives the "finish your profile" nudge
  const checklist = [
    { done: !!user.phone, label: 'Add your mobile number', href: '/dashboard/profile' },
    { done: !!user.address, label: 'Add your address (for home visits)', href: '/dashboard/profile' },
    { done: dogs.length > 0, label: 'Add your dog', href: '/dashboard/dogs/add' },
    { done: appointments.length > 0, label: 'Book your first service', href: '/dashboard/appointments' },
  ]
  const doneCount = checklist.filter((c) => c.done).length
  const pct = Math.round((doneCount / checklist.length) * 100)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const nextDays = next ? daysUntil(next) : null
  const nextSvc = next ? SERVICES.find((s) => s.id === next.serviceId) : null

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="text-brand-primary font-semibold text-sm mb-1">{greeting} 👋</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-dark">{user.name}</h1>
            <p className="text-gray-500 mt-1 break-all">{user.email}{user.city ? ` • ${user.city}` : ''}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/dashboard/dogs/add" className="btn-secondary px-5 py-2.5 text-sm">+ Add Dog</Link>
            <Link href="/shop" className="btn-secondary px-5 py-2.5 text-sm">🛍️ Shop</Link>
            <Link href="/dashboard/appointments?view=book" className="btn-primary px-5 py-2.5 text-sm">📅 Book Service</Link>
          </div>
        </div>

        {user.emailVerified === false && (
          <div role="status" className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl px-5 py-3 mb-6 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>📧 Please verify your email address so you receive booking and order updates.</span>
            <button onClick={resend} disabled={resending} className="font-bold underline disabled:opacity-60 text-left">{resending ? 'Sending…' : 'Resend verification email'}</button>
          </div>
        )}
        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">⚠️ {loadError}</div>
        )}

        {/* Next appointment hero */}
        <div className="rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden shadow-warm-lg"
          style={{ background: 'linear-gradient(135deg,#E8622A 0%,#5C2E0A 100%)' }}>
          <div className="absolute inset-0 opacity-10 dots-bg" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
            {loading ? (
              <div className="h-20 w-full rounded-2xl bg-white/10 animate-pulse" />
            ) : next ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-4xl flex-shrink-0">{nextSvc?.icon || '🐾'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-orange-100/80 text-xs font-bold uppercase tracking-wider mb-1">
                    Your next appointment · {nextDays === 0 ? 'Today!' : nextDays === 1 ? 'Tomorrow' : `in ${nextDays} days`}
                  </div>
                  <h2 className="font-display text-2xl font-bold truncate">{next.serviceName}</h2>
                  <p className="text-white/80 text-sm mt-1">
                    {prettyDate(next.date)} at {next.time}{next.dogName ? ` · ${next.dogName}` : ''}{next.homeVisit ? ' · 🏠 Home visit' : ''}
                  </p>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${STATUS[next.status]?.cls || 'bg-white/20'}`}>{STATUS[next.status]?.label || next.status}</span>
                  {next.paymentStatus !== 'paid' && (
                    <Link href="/payment" className="bg-white text-brand-primary font-bold text-sm px-5 py-2.5 rounded-full hover:bg-orange-50 transition-colors text-center">💳 Pay {inr(next.price)}</Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl">🐶</div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold">No upcoming appointments</h2>
                  <p className="text-white/80 text-sm mt-1">Pick a service and a time slot — we’ll confirm it instantly.</p>
                </div>
                <Link href="/dashboard/appointments?view=book" className="bg-white text-brand-primary font-bold text-sm px-6 py-3 rounded-full hover:bg-orange-50 transition-colors text-center">Book a service</Link>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
          {[
            { icon: '🐕', label: 'My Dogs', value: loading ? '…' : dogs.length, href: '/dashboard/dogs', color: 'bg-orange-50 border-orange-200' },
            { icon: '📅', label: 'Total Bookings', value: loading ? '…' : appointments.length, href: '/dashboard/appointments', color: 'bg-blue-50 border-blue-200' },
            { icon: '⏳', label: 'Upcoming', value: loading ? '…' : upcoming.length, href: '/dashboard/appointments', color: 'bg-green-50 border-green-200' },
            { icon: '💰', label: 'Total Spent', value: loading ? '…' : inr(totalSpent), href: '/payment', color: 'bg-amber-50 border-amber-200' },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className={`card border-2 text-center hover:scale-105 cursor-pointer ${stat.color}`}>
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="font-display font-bold text-2xl md:text-3xl text-brand-dark">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* Payment reminder */}
        {!loading && unpaid.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-amber-800">
              <strong>{unpaid.length} booking{unpaid.length > 1 ? 's are' : ' is'} waiting for payment</strong> — {inr(unpaid.reduce((s, a) => s + a.price, 0))} due.
            </div>
            <Link href="/payment" className="btn-primary text-sm px-5 py-2 w-fit">Pay now</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: profile + dogs */}
          <div className="space-y-6">
            {pct < 100 && (
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-brand-dark text-lg">✨ Finish setting up</h2>
                  <span className="text-sm font-bold text-brand-primary">{pct}%</span>
                </div>
                <div className="h-2 bg-orange-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-brand-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <ul className="space-y-2">
                  {checklist.map((c) => (
                    <li key={c.label}>
                      {c.done ? (
                        <span className="flex items-center gap-2 text-sm text-gray-400 line-through"><span className="text-green-500 no-underline">✓</span>{c.label}</span>
                      ) : (
                        <Link href={c.href} className="flex items-center gap-2 text-sm font-semibold text-brand-dark hover:text-brand-primary"><span className="w-4 h-4 rounded-full border-2 border-orange-300 inline-block" />{c.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-brand-dark text-lg">🐕 My Dogs</h2>
                <Link href="/dashboard/dogs" className="text-brand-primary text-sm font-semibold hover:underline">View All</Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : dogs.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">🐾</div>
                  <p className="text-gray-500 text-sm mb-3">No dogs added yet</p>
                  <Link href="/dashboard/dogs/add" className="btn-primary text-sm px-4 py-2">Add My Dog</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {dogs.slice(0, 3).map((dog) => (
                    <Link key={dog._id} href={`/dashboard/dogs/${dog._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-light transition-colors">
                      <Image unoptimized width={48} height={48} src={dog.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&auto=format&fit=crop'} alt={dog.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-orange-100" />
                      <div className="min-w-0">
                        <div className="font-bold text-brand-dark truncate">{dog.name}</div>
                        <div className="text-xs text-gray-500 truncate">{dog.breed} {dog.gender ? `· ${dog.gender}` : ''}</div>
                      </div>
                      <span className="ml-auto text-xs text-brand-primary">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="font-bold text-brand-dark text-lg mb-3">💬 Need help?</h2>
              <p className="text-sm text-gray-500 mb-3">Our team is happy to help with bookings, home visits and emergencies.</p>
              <div className="flex flex-col gap-2 text-sm font-semibold">
                {SITE.phone && <a href={`tel:${SITE.phone.replace(/[^+\d]/g, '')}`} className="text-brand-primary hover:underline">📞 {SITE.phone}</a>}
                {SITE.whatsapp && <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">💬 WhatsApp us</a>}
                <Link href="/contact" className="text-brand-primary hover:underline">✉️ Send a message</Link>
              </div>
            </div>
          </div>

          {/* Right column: appointments */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-brand-dark text-lg">📅 Upcoming Appointments</h2>
                <Link href="/dashboard/appointments" className="text-brand-primary text-sm font-semibold hover:underline">View All</Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : upcoming.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📅</div>
                  <p className="text-gray-500 mb-4">Nothing booked yet</p>
                  <Link href="/dashboard/appointments?view=book" className="btn-primary text-sm px-6 py-2.5">Book a Service</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.slice(0, 5).map((appt) => {
                    const svc = SERVICES.find((s) => s.id === appt.serviceId)
                    return (
                      <div key={appt._id} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-light hover:bg-orange-100 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">{svc?.icon || '🐾'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-brand-dark text-sm truncate">{appt.serviceName}</div>
                          <div className="text-xs text-gray-500">{appt.dogName || 'No dog'} · {prettyDate(appt.date)} at {appt.time}</div>
                          <div className="text-xs mt-0.5"><span className={`font-bold px-2 py-0.5 rounded-full ${STATUS[appt.status]?.cls}`}>{STATUS[appt.status]?.label}</span></div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-brand-primary text-sm">{inr(appt.price)}</div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${appt.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {appt.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {!loading && past.length > 0 && (
              <div className="card">
                <h2 className="font-bold text-brand-dark text-lg mb-4">🕘 Recently completed</h2>
                <div className="space-y-2">
                  {past.map((a) => (
                    <div key={a._id} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-orange-50 last:border-0">
                      <span className="font-semibold text-brand-dark truncate">{a.serviceName}{a.dogName ? ` · ${a.dogName}` : ''}</span>
                      <span className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-gray-400">{prettyDate(a.date)}</span>
                        <Link href={`/dashboard/appointments?service=${a.serviceId}`} className="text-brand-primary font-bold hover:underline">Book again</Link>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick book */}
            <div>
              <h2 className="font-bold text-brand-dark text-lg mb-4">🐾 Quick Book a Service</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {SERVICES.map((s) => (
                  <Link key={s.id} href={`/dashboard/appointments?service=${s.id}`}
                    className="card p-3 text-center hover:border-brand-primary hover:border-2 hover:shadow-brand group cursor-pointer">
                    <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{s.icon}</div>
                    <div className="text-xs font-bold text-brand-dark leading-tight">{s.title}</div>
                    <div className="text-xs text-brand-primary font-semibold mt-1">from {inr(s.price.basic)}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
