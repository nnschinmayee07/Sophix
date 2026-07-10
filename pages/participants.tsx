import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'

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

export default function Participants() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/events')
      if (!res.ok) throw new Error()
      setEvents(await res.json())
    } catch {
      setError('Could not load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <Header />
      <main className="container">

        <motion.div className="explore-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="gradient-text">Explore Events</h1>
          <p className="muted big-subtext">Discover hackathons, workshops, and competitions. Find your next challenge.</p>
        </motion.div>

        <div className="section-header">
          <h2>Available Events</h2>
          <span className="badge">{events.length}</span>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3].map(i => <div key={i} className="event-card skeleton" />)}
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>⚠️ {error}</p>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={fetchEvents}>Retry</button>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p>🗓 No events available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="event-cards">
            {events.map((ev, i) => {
              const full = ev.capacity !== null && ev.enrolled_count >= ev.capacity
              return (
                <motion.div
                  key={ev.id}
                  className="event-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="event-card-top">
                    <div className="event-tag">{ev.event_type}</div>
                    {ev.is_paid ? (
                      <span className="pill" style={{ marginLeft: 8 }}>{ev.currency?.toUpperCase()} {ev.price}</span>
                    ) : (
                      <span className="pill pill-live" style={{ marginLeft: 8 }}>Free</span>
                    )}
                  </div>
                  <h3 className="event-card-title">{ev.title}</h3>
                  {ev.description && <p className="event-desc">{ev.description}</p>}
                  <div className="event-meta">
                    {ev.event_date && <span className="meta-chip">📅 {ev.event_date.slice(0, 10)}</span>}
                    {ev.location && <span className="meta-chip">📍 {ev.location}</span>}
                    {ev.capacity !== null && <span className="meta-chip">👥 {ev.enrolled_count}/{ev.capacity}</span>}
                  </div>
                  <Link legacyBehavior href={`/event/${ev.slug}`}>
                    <a className={`btn btn-primary enroll-btn ${full ? 'btn-disabled' : ''}`} aria-disabled={full}>
                      {full ? 'Event Full' : 'View Details →'}
                    </a>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
