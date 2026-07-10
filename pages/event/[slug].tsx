import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { motion, AnimatePresence } from 'framer-motion'

type Event = {
  id: string
  title: string
  slug: string
  description: string
  event_type: string
  event_date: string | null
  event_time: string
  location: string
  capacity: number | null
  price: string
  currency: string
  is_paid: boolean
  enrolled_count: number
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EventDetail() {
  const router = useRouter()
  const { slug } = router.query
  const { data: session } = useSession()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (typeof slug !== 'string') return
    fetchEvent(slug)
  }, [slug])

  useEffect(() => {
    if (session?.user) {
      setForm({ name: session.user.name || '', email: session.user.email || '' })
    }
  }, [session])

  async function fetchEvent(s: string) {
    setLoading(true)
    setNotFound(false)
    const res = await fetch(`/api/events/${s}`)
    if (res.status === 404) {
      setNotFound(true)
      setLoading(false)
      return
    }
    if (res.ok) setEvent(await res.json())
    setLoading(false)
  }

  const full = event?.capacity !== null && event !== null && event.enrolled_count >= (event.capacity ?? Infinity)

  const submitEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.name.trim()) return setFormError('Name is required')
    if (!EMAIL_RE.test(form.email.trim())) return setFormError('Enter a valid email address')
    if (!event) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id, name: form.name, email: form.email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || 'Enrollment failed')
        setSubmitting(false)
        return
      }

      if (data.requiresPayment) {
        const checkoutRes = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollment_id: data.enrollment.id }),
        })
        const checkoutData = await checkoutRes.json()
        if (!checkoutRes.ok) {
          setFormError(checkoutData.error || 'Could not start checkout')
          setSubmitting(false)
          return
        }
        window.location.href = checkoutData.url
        return
      }

      setModalOpen(false)
      setForm({ name: '', email: '' })
      setSuccess(`You're enrolled in "${event.title}"! A confirmation has been recorded.`)
      fetchEvent(event.slug)
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Header />
        <main className="container">
          <div className="skeleton" style={{ height: 300, marginTop: 40 }} />
        </main>
      </div>
    )
  }

  if (notFound || !event) {
    return (
      <div className="page">
        <Header />
        <main className="container">
          <div className="empty-state" style={{ marginTop: 40 }}>
            <p>🔍 Event not found. It may have been unpublished or removed.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <Header />
      <main className="container">
        {success && (
          <motion.div className="toast success" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            🎉 {success}
          </motion.div>
        )}

        <motion.div className="event-detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="event-tag">{event.event_type}</div>
          <h1 className="page-title gradient-text" style={{ marginTop: 12 }}>{event.title}</h1>
          <div className="event-meta" style={{ margin: '16px 0' }}>
            {event.event_date && <span className="meta-chip">📅 {event.event_date.slice(0, 10)}{event.event_time ? ` at ${event.event_time}` : ''}</span>}
            {event.location && <span className="meta-chip">📍 {event.location}</span>}
            {event.capacity !== null && <span className="meta-chip">👥 {event.enrolled_count}/{event.capacity} enrolled</span>}
            <span className="meta-chip">{event.is_paid ? `💰 ${event.currency?.toUpperCase()} ${event.price}` : '🆓 Free'}</span>
          </div>

          {event.description && <p className="event-desc" style={{ fontSize: 15, maxWidth: 640 }}>{event.description}</p>}

          <div style={{ marginTop: 28 }}>
            {full ? (
              <button className="btn btn-disabled" disabled>Event Full</button>
            ) : (
              <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }} onClick={() => setModalOpen(true)}>
                {event.is_paid ? `Enroll — Pay ${event.currency?.toUpperCase()} ${event.price}` : 'Enroll for Free'}
              </button>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {modalOpen && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)}>
              <motion.div
                className="modal-card"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                onClick={e => e.stopPropagation()}
              >
                <h2>Enroll in {event.title}</h2>
                <p className="muted" style={{ marginBottom: 16 }}>
                  {event.is_paid
                    ? `You'll be redirected to a secure payment link to pay ${event.currency?.toUpperCase()} ${event.price}.`
                    : 'Fill in your details to confirm your spot instantly.'}
                </p>
                <form onSubmit={submitEnroll}>
                  {session?.user ? (
                    <div className="form-row" style={{ marginBottom: 12 }}>
                      <label>Enrolling as</label>
                      <p style={{ fontSize: 14 }}>{form.name} — <span className="muted">{form.email}</span></p>
                    </div>
                  ) : (
                    <>
                      <div className="form-row" style={{ marginBottom: 12 }}>
                        <label htmlFor="enroll-name">Your Name</label>
                        <input id="enroll-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" required />
                      </div>
                      <div className="form-row">
                        <label htmlFor="enroll-email">Email Address</label>
                        <input id="enroll-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" required />
                      </div>
                    </>
                  )}
                  {formError && <p className="error-msg">{formError}</p>}
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Processing...' : event.is_paid ? 'Continue to Payment' : 'Confirm Enrollment'}
                    </button>
                    <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
