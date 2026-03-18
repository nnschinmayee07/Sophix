import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { motion, AnimatePresence } from 'framer-motion'

const HACKATHONS = [
  { id: 'h1', name: 'AI Hackathon', desc: 'Build with AI & ML', date: '2025-10-01' },
  { id: 'h2', name: 'Web3 Jam', desc: 'Blockchain builders unite', date: '2025-11-12' },
  { id: 'h3', name: 'GreenTech Challenge', desc: 'Sustainable tech innovation', date: '2025-12-05' },
]

type Participant = { id: string; name: string; email: string; event: string }

export default function Participants() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [form, setForm] = useState({ name: '', email: '', event: '' })
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchParticipants() }, [])

  async function fetchParticipants() {
    setLoading(true)
    const res = await fetch('/api/participants')
    if (res.ok) setParticipants(await res.json())
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
      setSuccess('Enrolled successfully!')
      setTimeout(() => setSuccess(''), 2500)
    } else {
      const { error } = await res.json()
      alert(error || 'Enrollment failed')
    }
  }

  return (
    <div className="page">
      <Header />
      <main className="container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <section className="participants">
          <h1>Enroll as Participant</h1>
          {success && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}><div className="toast success">{success}</div></motion.div>}
          <form className="create-form" onSubmit={enroll} aria-label="Enroll form">
            <div className="form-row"><label>Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
            <div className="form-row"><label>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} required /></div>
            <div className="form-row">
              <label>Event</label>
              <select name="event" value={form.event} onChange={handleChange} required>
                <option value="">Select an event</option>
                {HACKATHONS.map(h => <option key={h.id} value={h.name}>{h.name} — {h.date}</option>)}
              </select>
            </div>
            <div className="form-actions"><button className="btn btn-primary" type="submit">Enroll</button></div>
          </form>

          <h2 className="mt-8">Browse Hackathons</h2>
          <div className="hackathon-grid">
            {HACKATHONS.map(h => (
              <div key={h.id} className="hackathon-card">
                <h3>{h.name}</h3>
                <p className="muted">{h.desc}</p>
                <p className="muted">Date: {h.date}</p>
                <button className="btn btn-primary mt-2" onClick={() => setForm(f => ({ ...f, event: h.name }))}>Enroll</button>
              </div>
            ))}
          </div>

          <h2 className="mt-8">Enrolled Participants</h2>
          {loading ? <p className="muted">Loading...</p> : (
            <AnimatePresence>
              {participants.map(p => (
                <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <div className="participant-item">
                    <strong>{p.name}</strong> — {p.email} → <span className="muted">{p.event}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </section>
        </motion.div>
      </main>
    </div>
  )
}
