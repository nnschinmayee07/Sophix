import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

type Event = { id: string; name: string; description: string; location: string; event_date: string; attendees: number; engagement: number }
type Participant = { id: string; name: string; email: string; event: string }

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', location: '', event_date: '', attendees: '', engagement: '' })
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 10000)
    return () => clearInterval(interval)
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [evRes, parRes] = await Promise.all([fetch('/api/events'), fetch('/api/participants')])
    if (evRes.ok) setEvents(await evRes.json())
    if (parRes.ok) setParticipants(await parRes.json())
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(f => ({ ...f, [name]: value }))
  }

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return alert('Event name required')
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, attendees: Number(formData.attendees || 0), engagement: Number(formData.engagement || 0) }),
    })
    if (res.ok) {
      const evt = await res.json()
      setEvents(prev => [evt, ...prev])
      setFormData({ name: '', description: '', location: '', event_date: '', attendees: '', engagement: '' })
      setShowForm(false)
      setSuccess('Event created successfully!')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
    if (res.ok) setEvents(prev => prev.filter(x => x.id !== id))
  }

  const totalEvents = events.length
  const totalParticipants = events.reduce((s, e) => s + (e.attendees || 0), 0)
  const avgEngagement = events.length ? Math.round(events.reduce((s, e) => s + e.engagement, 0) / events.length) : 0
  const eventData = events.map(ev => ({ name: ev.name.length > 12 ? ev.name.slice(0, 12) + '…' : ev.name, attendees: ev.attendees, engagement: ev.engagement }))
  const filteredParticipants = selectedEvent ? participants.filter(p => p.event === selectedEvent) : participants

  return (
    <section className="dashboard" aria-labelledby="dashboard-heading">
      {success && <div className="toast success">{success}</div>}

      <div className="admin-hero">
        <div>
          <h1 id="dashboard-heading">Admin Dashboard</h1>
          <p className="muted">Manage your events and track enrollments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Close' : '+ Create Event'}
        </button>
      </div>

      {showForm && (
        <form className="create-form" onSubmit={addEvent}>
          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="name">Event Name *</label>
              <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. AI Hackathon 2026" required />
            </div>
            <div className="form-row">
              <label htmlFor="event_date">Date</label>
              <input id="event_date" name="event_date" type="date" value={formData.event_date} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="location">Location</label>
              <input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Hyderabad / Online" />
            </div>
            <div className="form-row">
              <label htmlFor="engagement">Engagement % (0-100)</label>
              <input id="engagement" name="engagement" value={formData.engagement} onChange={handleChange} inputMode="numeric" placeholder="e.g. 85" />
            </div>
            <div className="form-row full-width">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="What is this event about?" rows={3} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Create Event</button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="stat-cards">
        <div className="stat-card"><div className="stat-icon">🎯</div><div><p className="stat-label">Total Events</p><p className="stat-value">{totalEvents}</p></div></div>
        <div className="stat-card"><div className="stat-icon">👥</div><div><p className="stat-label">Total Enrollments</p><p className="stat-value">{totalParticipants}</p></div></div>
        <div className="stat-card"><div className="stat-icon">📈</div><div><p className="stat-label">Avg. Engagement</p><p className="stat-value">{avgEngagement}%</p></div></div>
        <div className="stat-card"><div className="stat-icon">🏆</div><div><p className="stat-label">Participants</p><p className="stat-value">{participants.length}</p></div></div>
      </div>

      {events.length > 0 && (
        <div className="charts">
          <div className="chart-card">
            <h3>Attendees per Event</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={eventData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#9aa4b2', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9aa4b2', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#0f1724', border: 'none', borderRadius: 8 }} />
                  <Bar dataKey="attendees" name="Attendees" fill="#13a4ec" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <h3>Engagement Trend</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={eventData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#9aa4b2', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9aa4b2', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#0f1724', border: 'none', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <h2>Events</h2>
        <span className="badge">{events.length}</span>
      </div>
      {loading ? <p className="muted">Loading...</p> : (
        <div className="event-cards">
          {events.length === 0 ? (
            <div className="empty-state">
              <p>No events yet. Create your first event above!</p>
            </div>
          ) : events.map(ev => (
            <div key={ev.id} className={`event-card ${selectedEvent === ev.name ? 'selected' : ''}`} onClick={() => setSelectedEvent(selectedEvent === ev.name ? null : ev.name)}>
              <div className="event-card-header">
                <div>
                  <h3 className="event-card-title">{ev.name}</h3>
                  {ev.event_date && <p className="muted small">📅 {ev.event_date}</p>}
                  {ev.location && <p className="muted small">📍 {ev.location}</p>}
                </div>
                <button className="btn btn-danger" onClick={e => { e.stopPropagation(); deleteEvent(ev.id) }}>Delete</button>
              </div>
              {ev.description && <p className="event-desc">{ev.description}</p>}
              <div className="event-stats">
                <span className="pill">👥 {ev.attendees} enrolled</span>
                <span className="pill">📊 {ev.engagement}% engagement</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-header" style={{ marginTop: 32 }}>
        <h2>Participants {selectedEvent ? `— ${selectedEvent}` : '(All Events)'}</h2>
        <span className="badge">{filteredParticipants.length}</span>
      </div>
      {selectedEvent && <p className="muted small" style={{ marginBottom: 8 }}>Click the event card again to show all participants</p>}
      <div className="participants-table">
        {filteredParticipants.length === 0 ? (
          <div className="empty-state"><p>No participants yet.</p></div>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Event</th></tr></thead>
            <tbody>
              {filteredParticipants.map((p, i) => (
                <tr key={p.id}>
                  <td className="muted">{i + 1}</td>
                  <td>{p.name}</td>
                  <td className="muted">{p.email}</td>
                  <td><span className="pill">{p.event}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
