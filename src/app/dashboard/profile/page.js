'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { apiGetMe, apiUpdateProfile, apiDeleteAccount } from '@/lib/apiClient'

export default function ProfilePage() {
  const router = useRouter()
  const [form, setForm] = useState(null)
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [delOpen, setDelOpen] = useState(false)
  const [delPw, setDelPw] = useState('')
  const [delBusy, setDelBusy] = useState(false)
  const [delErr, setDelErr] = useState('')

  useEffect(() => {
    apiGetMe()
      .then(({ user }) => {
        if (user.role === 'admin') { router.replace('/admin'); return }
        setEmail(user.email)
        setForm({ name: user.name || '', phone: user.phone || '', city: user.city || '', address: user.address || '' })
      })
      .catch(() => router.replace('/auth/login'))
  }, [router])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = async (e) => {
    e.preventDefault()
    setError('')
    const phone = form.phone.replace(/[\s-]/g, '')
    if (!form.name.trim()) return setError('Name is required')
    if (phone && !/^\d{10}$/.test(phone)) return setError('Please enter a valid 10-digit mobile number')
    setSaving(true)
    try {
      await apiUpdateProfile({ ...form, phone })
      toast.success('Profile saved')
    } catch (err) {
      setError(err.message || 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async (e) => {
    e.preventDefault()
    setDelErr('')
    setDelBusy(true)
    try {
      await apiDeleteAccount(delPw)
      toast.success('Your account has been deleted')
      router.replace('/')
    } catch (err) {
      setDelErr(err.message || 'Could not delete your account')
      setDelBusy(false)
    }
  }

  if (!form) return <div className="min-h-screen flex items-center justify-center text-4xl animate-bounce">🐾</div>

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16 max-w-xl">
        <Link href="/dashboard" className="text-brand-primary text-sm font-semibold hover:underline">← Dashboard</Link>
        <h1 className="font-display text-3xl font-bold text-brand-dark mt-2 mb-6">⚙️ My Profile</h1>
        <form onSubmit={save} className="card space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">⚠️ {error}</div>}
          <div>
            <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Email</label>
            <input value={email} disabled className="input-field bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label htmlFor="p-name" className="text-sm font-semibold text-brand-dark mb-1.5 block">Full name</label>
            <input id="p-name" value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="p-phone" className="text-sm font-semibold text-brand-dark mb-1.5 block">Mobile number</label>
            <input id="p-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input-field" inputMode="numeric" autoComplete="tel" placeholder="10-digit number" />
          </div>
          <div>
            <label htmlFor="p-city" className="text-sm font-semibold text-brand-dark mb-1.5 block">City</label>
            <input id="p-city" value={form.city} onChange={(e) => set('city', e.target.value)} className="input-field" autoComplete="address-level2" />
          </div>
          <div>
            <label htmlFor="p-address" className="text-sm font-semibold text-brand-dark mb-1.5 block">Address (used for home visits)</label>
            <textarea id="p-address" value={form.address} onChange={(e) => set('address', e.target.value)} className="input-field resize-none h-24" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3 disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
        </form>

        <section className="card mt-8 p-6" aria-labelledby="privacy-h">
          <h2 id="privacy-h" className="font-bold text-brand-dark text-lg mb-1">🔒 Your data &amp; privacy</h2>
          <p className="text-sm text-gray-500 mb-4">Read how we use your data in our <Link href="/privacy" className="text-brand-primary font-semibold hover:underline">Privacy Policy</Link>.</p>
          <a href="/api/account/export" download className="btn-secondary inline-flex px-5 py-2.5 text-sm">⬇️ Download my data</a>

          <div className="border-t border-red-100 mt-6 pt-5">
            <h3 className="font-bold text-red-600 mb-1">Delete my account</h3>
            <p className="text-sm text-gray-500 mb-3">This permanently deletes your account, dogs and bookings. Order and payment records are kept only as long as the law requires.</p>
            {!delOpen ? (
              <button type="button" onClick={() => setDelOpen(true)} className="text-sm font-bold text-red-600 border-2 border-red-200 rounded-full px-5 py-2 hover:bg-red-50">Delete my account…</button>
            ) : (
              <form onSubmit={deleteAccount} className="space-y-3">
                {delErr && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">⚠️ {delErr}</div>}
                <label htmlFor="del-pw" className="text-sm font-semibold text-brand-dark block">Enter your password to confirm</label>
                <input id="del-pw" type="password" autoComplete="current-password" value={delPw} onChange={(e) => setDelPw(e.target.value)} className="input-field" required />
                <div className="flex gap-3">
                  <button type="submit" disabled={delBusy} className="bg-red-600 text-white font-bold rounded-full px-6 py-2.5 text-sm hover:bg-red-700 disabled:opacity-60">{delBusy ? 'Deleting…' : 'Permanently delete'}</button>
                  <button type="button" onClick={() => { setDelOpen(false); setDelPw(''); setDelErr('') }} className="text-sm font-semibold text-gray-500 hover:text-brand-dark px-3">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
