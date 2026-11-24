'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { apiVerifyEmail } from '@/lib/apiClient'

export default function VerifyEmailPage() {
  const [state, setState] = useState('working') // working | ok | fail
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) { setState('fail'); setMsg('This link is incomplete.'); return }
    apiVerifyEmail(token)
      .then(() => {
        setState('ok')
        try { const u = JSON.parse(localStorage.getItem('dop_user') || 'null'); if (u) localStorage.setItem('dop_user', JSON.stringify({ ...u, emailVerified: true })) } catch {}
      })
      .catch((e) => { setState('fail'); setMsg(e.message || 'Verification failed') })
  }, [])

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-32 pb-16 max-w-md">
        <div className="card p-8 text-center" role="status">
          {state === 'working' && <><div className="text-4xl animate-bounce mb-3">🐾</div><p className="text-gray-600">Verifying your email…</p></>}
          {state === 'ok' && <><div className="text-5xl mb-3">✅</div><h1 className="font-display text-2xl font-bold text-brand-dark mb-2">Email verified</h1><p className="text-gray-600 mb-5">Thank you! You&apos;ll now receive booking and order updates.</p><Link href="/dashboard" className="btn-primary px-6 py-2.5 inline-flex">Go to dashboard</Link></>}
          {state === 'fail' && <><div className="text-5xl mb-3">⚠️</div><h1 className="font-display text-2xl font-bold text-brand-dark mb-2">Couldn&apos;t verify</h1><p className="text-gray-600 mb-5">{msg} You can request a new link from your dashboard.</p><Link href="/dashboard" className="btn-primary px-6 py-2.5 inline-flex">Go to dashboard</Link></>}
        </div>
      </div>
    </div>
  )
}
