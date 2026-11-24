'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { apiForgotPassword } from '@/lib/apiClient'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try { await apiForgotPassword(email.trim()); setDone(true) }
    catch (err) { setError(err.message || 'Something went wrong. Please try again.') }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-32 pb-16 max-w-md">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-brand-dark mb-2">Forgot your password?</h1>
          {done ? (
            <div role="status">
              <p className="text-gray-600 mt-3">If an account exists for <b>{email}</b>, we&apos;ve emailed a reset link. It&apos;s valid for 1 hour. Check your spam folder too.</p>
              <Link href="/auth/login" className="btn-primary mt-6 px-6 py-2.5 inline-flex">Back to log in</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-gray-500 text-sm">Enter your email and we&apos;ll send you a link to choose a new password.</p>
              {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">⚠️ {error}</div>}
              <div>
                <label htmlFor="fp-email" className="text-sm font-semibold text-brand-dark mb-1.5 block">Email</label>
                <input id="fp-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
              </div>
              <button type="submit" disabled={busy} className="btn-primary w-full justify-center py-3 disabled:opacity-60">{busy ? 'Sending…' : 'Send reset link'}</button>
              <Link href="/auth/login" className="block text-center text-sm text-brand-primary font-semibold hover:underline">← Back to log in</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
