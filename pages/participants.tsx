import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { motion, AnimatePresence } from 'framer-motion'

type Participant = { id: string; name: string; email: string; event: string }
type Event = { id: string; name: string; description: string; location: string; event_date: string; attendees: number }

export default function Participants() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [form, setForm] = useState({ name: '', email: '', event: '' })
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [evRes, parRes] = await Promise.all([fetch('/api/events'), fetch('/api/participants')])
    if (evRes.ok) setEvents(await evRes.json())
    if (parRes.ok) setParticipants(await parRes.json())
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
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
      const p = await res.json()
      setParticipants(prev => [p, ...prev])
      setForm({ name: '', email: '', event: '' })
      setSuccess(`You're enrolled in ${form.event}!`)
      setTimeout(() => setSuccess(''), 3000)
    } else {
      const { error } = await res.json()
      alert(error || 'Enrollment failed')
    }
  }

  const filteredParticipants = filter === 'all' ? participants : participants.filter(p => p.event === filter)

  return (
    <div className="page">
      <Header />
      <main className="container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

          {success && (
            <motion.div className="toast success" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              ✅ {success}
            </motion.div>
          )}

          <div className="page-hero">
            <h1 className="gradient-text">Find Your Event</h1>
            <p className="muted big-subtext">Browse events and enroll in seconds.</p>
          </div>

          {/* Events Grid */}
          <h2 className="section-title">Available Events</h2>
          {loading ? <p className="muted">Loading events...</p> : events.length === 0 ? (
            <div className="empty-state"><p>No events available yet. Check back soon!</p></div>
          ) : (
            <div className="event-cards">
              {events.map(ev => (
                <motion.div key={ev.id} className="event-card" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <div className="event-card-header">
                    <h3 className="event-card-title">{ev.name}</h3>
                  </div>
                  {ev.description && <p className="event-desc">{ev.description}</p>}
                  <div className="event-meta">
                    {ev.event_date && <span className="muted small">📅 {ev.event_date}</span>}
                    {ev.location && <span className="muted small">📍 {ev.location}</span>}
                  </div>
                  <button className="btn btn-primary mt-2" onClick={() => setForm(f => ({ ...f, event: ev.name }))}>
                    Enroll Now
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Enroll Form */}
          <div className="enroll-section">
            <h2 className="section-title">Enroll as Participant</h2>
            <form className="create-form enroll-form" onSubmit={enroll}>
              <div className="form-grid">
                <div className="form-row">
                  <label>Your Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required />
                </div>
                <div className="form-row full-width">
                  <label>Select Event</label>
                  <select name="event" value={form.event} onChange={handleChange} required>
                    <option value="">Choose an event...</option>
                    {events.map(e => <option key={e.id} value={e.name}>{e.name}{e.event_date ? ` — ${e.event_date}` : ''}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" type="submit">Confirm Enrollment</button>
              </div>
            </form>
          </div>

        </motion.div>
      </main>
    </div>
  )
}
