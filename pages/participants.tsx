import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { motion } from 'framer-motion'

type Event = { id: string; name: string; description: string; location: string; event_date: string; attendees: number }

export default function Participants() {
  const [events, setEvents] = useState<Event[]>([])
  const [form, setForm] = useState({ name: '', email: '', event: '' })
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    setLoading(true)
    const res = await fetch('/api/events')
    if (res.ok) setEvents(await res.json())
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleEnrollClick = (eventName: string) => {
    setForm(f => ({ ...f, event: eventName }))
    setTimeout(() => {
      document.getElementById('enroll-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const enroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.event) return alert('All fields required')
    const res = await fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ name: '', email: '', event: '' })
      setSuccess(`🎉 You're enrolled in "${form.event}"! See you there.`)
      setTimeout(() => setSuccess(''), 4000)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const { error } = await res.json()
      alert(error || 'Enrollment failed')
    }
  }

  return (
    <div className="page">
      <Header />
      <main className="container">

        {success && (
          <motion.div className="toast success" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {success}
          </motion.div>
        )}

        {/* Hero */}
        <motion.div className="explore-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="gradient-text">Explore Events</h1>
          <p className="muted big-subtext">Discover hackathons, workshops, and competitions. Find your next challenge.</p>
        </motion.div>

        {/* Events Grid */}
        <div className="section-header">
          <h2>Available Events</h2>
          <span className="badge">{events.length}</span>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1,2,3].map(i => <div key={i} className="event-card skeleton" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p>🗓 No events available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="event-cards">
            {events.map((ev, i) => (
              <motion.div
                key={ev.id}
                className="event-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div className="event-card-top">
                  <div className="event-tag">Event</div>
                </div>
                <h3 className="event-card-title">{ev.name}</h3>
                {ev.description && <p className="event-desc">{ev.description}</p>}
                <div className="event-meta">
                  {ev.event_date && <span className="meta-chip">📅 {ev.event_date}</span>}
                  {ev.location && <span className="meta-chip">📍 {ev.location}</span>}
                </div>
                <button className="btn btn-primary enroll-btn" onClick={() => handleEnrollClick(ev.name)}>
                  Enroll Now →
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Enroll Form */}
        <motion.div
          id="enroll-form"
          className="enroll-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="enroll-header">
            <h2>Enroll as Participant</h2>
            <p className="muted">Fill in your details below to secure your spot.</p>
          </div>
          <form className="create-form enroll-form" onSubmit={enroll}>
            <div className="form-grid">
              <div className="form-row">
                <label>Your Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
              </div>
              <div className="form-row">
                <label>Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required />
              </div>
              <div className="form-row full-width">
                <label>Select Event</label>
                <select name="event" value={form.event} onChange={handleChange} required>
                  <option value="">Choose an event...</option>
                  {events.map(e => (
                    <option key={e.id} value={e.name}>
                      {e.name}{e.event_date ? ` — ${e.event_date}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" style={{ padding: '12px 28px', fontSize: '15px' }}>
                Confirm Enrollment
              </button>
            </div>
          </form>
        </motion.div>

      </main>
    </div>
  )
}
