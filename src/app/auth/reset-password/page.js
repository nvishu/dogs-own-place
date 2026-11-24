'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { apiResetPassword } from '@/lib/apiClient'

export default function ResetPasswordPage() {
  const [token, setToken] = useState(null)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setToken(new URLSearchParams(window.location.search).get('token') || '') }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (pw.length < 8) return setError('Password must be at least 8 characters')
    if (pw !== pw2) return setError('The two passwords do not match')
    setBusy(true)
    try { await apiResetPassword(token, pw); setDone(true) }
    catch (err) { setError(err.message || 'Could not reset your password') }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-32 pb-16 max-w-md">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-brand-dark mb-4">Choose a new password</h1>
          {token === null ? <div className="h-24 animate-pulse bg-gray-100 rounded-xl" /> : !token ? (
            <p className="text-gray-600">This link is incomplete. Please <Link href="/auth/forgot-password" className="text-brand-primary font-semibold">request a new one</Link>.</p>
          ) : done ? (
            <div role="status">
              <p className="text-green-700 font-semibold">✅ Your password has been changed.</p>
              <Link href="/auth/login" className="btn-primary mt-5 px-6 py-2.5 inline-flex">Log in</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">⚠️ {error} {/expired|invalid/i.test(error) && <Link href="/auth/forgot-password" className="underline font-bold">Request a new link</Link>}</div>}
              <div>
                <label htmlFor="rp1" className="text-sm font-semibold text-brand-dark mb-1.5 block">New password</label>
                <input id="rp1" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={pw} onChange={(e) => setPw(e.target.value)} className="input-field" />
              </div>
              <div>
                <label htmlFor="rp2" className="text-sm font-semibold text-brand-dark mb-1.5 block">Confirm new password</label>
                <input id="rp2" type="password" autoComplete="new-password" required value={pw2} onChange={(e) => setPw2(e.target.value)} className="input-field" />
              </div>
              <button type="submit" disabled={busy} className="btn-primary w-full justify-center py-3 disabled:opacity-60">{busy ? 'Saving…' : 'Change password'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
