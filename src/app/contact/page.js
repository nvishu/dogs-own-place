'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import toast from 'react-hot-toast'
import { apiSendContact } from '@/lib/apiClient'
import { SITE } from '@/lib/site'
import { BUSINESS } from '@/lib/business'

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'', website:'' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await apiSendContact(form)
      setSent(true)
    } catch (err) {
      toast.error(err.message || 'Could not send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-28 pb-16 bg-brand-cream dots-bg">
        <div className="page-container text-center">
          <span className="badge bg-orange-100 text-brand-primary mb-4">📞 Contact Us</span>
          <h1 className="section-title mb-4">We&apos;d Love to Hear From You</h1>
          <p className="section-subtitle mx-auto">Questions about a service, an order or your dog&apos;s care? Send us a message and we&apos;ll get back to you.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-5">
                {[
                  BUSINESS.address && {icon:'📍',title:'Office',lines:[BUSINESS.address]},
                  SITE.phone && {icon:'📞',title:'Phone',lines:[SITE.phone]},
                  SITE.email && {icon:'✉️',title:'Email',lines:[SITE.email]},
                  {icon:'⏰',title:'Hours',lines:[BUSINESS.hours]},
                ].filter(Boolean).map(item => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="font-bold text-brand-dark">{item.title}</div>
                      {item.lines.map(l=><div key={l} className="text-gray-500 text-sm">{l}</div>)}
                    </div>
                  </div>
                ))}
              </div>
              {BUSINESS.emergencyPhone && (
                <div className="card bg-brand-dark text-white">
                  <h3 className="font-bold mb-2">🚨 Emergency Number</h3>
                  <p className="text-orange-200 text-sm mb-3">For urgent help, call:</p>
                  <a href={`tel:${BUSINESS.emergencyPhone.replace(/[^\d+]/g, '')}`} className="font-display font-bold text-2xl text-brand-accent">{BUSINESS.emergencyPhone}</a>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Complaint? Write to our <Link href="/grievance" className="text-brand-primary font-semibold hover:underline">Grievance Officer</Link>.
              </p>
            </div>
            <div className="lg:col-span-3">
              {sent ? (
                <div className="card text-center py-16">
                  <div className="text-7xl mb-4">🎉</div>
                  <h2 className="font-display text-2xl font-bold text-brand-dark mb-2">Message Sent!</h2>
                  <p className="text-gray-500 mb-6">We&apos;ll get back to you within 2 hours.</p>
                  <button onClick={()=>{setSent(false);setForm({name:'',email:'',phone:'',subject:'',message:'',website:''})}} className="btn-secondary">Send Another</button>
                </div>
              ) : (
                <div className="card">
                  <h2 className="font-display text-xl font-bold text-brand-dark mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} style={{position:'absolute',left:'-9999px',width:1,height:1,opacity:0}} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Full Name *</label>
                        <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" className="input-field"/>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Phone</label>
                        <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="10-digit mobile number" className="input-field"/>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Email *</label>
                      <input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@email.com" className="input-field"/>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Subject</label>
                      <select value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className="input-field">
                        <option value="">Select a topic</option>
                        {['General Inquiry','Booking Help','Service Question','Complaint','Partnership','Emergency','Other'].map(o=><option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Message *</label>
                      <textarea required rows={5} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="How can we help?" className="input-field resize-none"/>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
                      {loading ? '⏳ Sending...' : 'Send Message 📨'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {BUSINESS.serviceCities.length > 0 && (
        <section className="py-16 bg-brand-cream">
          <div className="page-container text-center">
            <h2 className="section-title mb-8">Where We Serve</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {BUSINESS.serviceCities.map(city=>(
                <span key={city} className="badge bg-white border border-orange-200 text-brand-dark py-2 px-4">📍 {city}</span>
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </div>
  )
}
