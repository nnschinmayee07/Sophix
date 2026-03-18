import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

type Event = { id: string; name: string; attendees: number; engagement: number }

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', attendees: '', engagement: '' })
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
    const interval = setInterval(fetchEvents, 10000) // refresh every 10s
    return () => clearInterval(interval)
  }, [])

  async function fetchEvents() {
    setLoading(true)
    const res = await fetch('/api/events')
    if (res.ok) setEvents(await res.json())
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(f => ({ ...f, [name]: value }))
  }

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return alert('Event name required')
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.name.trim(), attendees: Number(formData.attendees || 0), engagement: Number(formData.engagement || 0) }),
    })
    if (res.ok) {
      const evt = await res.json()
      setEvents(prev => [evt, ...prev])
      setFormData({ name: '', attendees: '', engagement: '' })
      setShowForm(false)
      setSuccess('Event created')
      setTimeout(() => setSuccess(''), 2500)
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete event?')) return
    const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
    if (res.ok) setEvents(prev => prev.filter(x => x.id !== id))
  }

  const totalEvents = events.length
  const totalParticipants = events.reduce((s, e) => s + (e.attendees || 0), 0)
  const avgEngagement = events.length ? Math.round(events.reduce((s, e) => s + e.engagement, 0) / events.length) : 0
  const eventData = events.map(ev => ({ name: ev.name, attendees: ev.attendees, engagement: ev.engagement }))
  const engagementData = events.slice(0, 5).map(ev => ({ name: ev.name, engagement: ev.engagement }))

  return (
    <section className="dashboard" aria-labelledby="dashboard-heading">
      <div className="hero">
        <div><h1 id="dashboard-heading">Admin Dashboard</h1><p className="muted">Create and manage your events</p></div>
        <div><button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>{showForm ? 'Close' : '+ Create Event'}</button></div>
      </div>
      {success && <div className="toast success">{success}</div>}
      {showForm && (
        <form className="create-form" onSubmit={addEvent}>
          <div className="form-row"><label htmlFor="name">Event name</label><input id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
          <div className="form-row"><label htmlFor="attendees">Attendees</label><input id="attendees" name="attendees" value={formData.attendees} onChange={handleChange} inputMode="numeric" /></div>
          <div className="form-row"><label htmlFor="engagement">Engagement (0-100)</label><input id="engagement" name="engagement" value={formData.engagement} onChange={handleChange} inputMode="numeric" /></div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Create</button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      <div className="cards" role="region" aria-label="Key Metrics">
        <div className="card"><h3>Total Events</h3><p className="big">{totalEvents}</p></div>
        <div className="card"><h3>Participants</h3><p className="big">{totalParticipants}</p></div>
        <div className="card"><h3>Avg. Engagement</h3><p className="big">{avgEngagement}%</p></div>
        <div className="card"><h3>Sponsors</h3><p className="big">25</p></div>
      </div>
      <div className="charts">
        <div className="chart-card" role="region" aria-label="Event Performance">
          <h3>Event Performance</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer><BarChart data={eventData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="attendees" name="Attendees" fill="#13a4ec" /><Bar dataKey="engagement" name="Engagement" fill="#8b5cf6" /></BarChart></ResponsiveContainer>
          </div>
        </div>
        <div className="chart-card" role="region" aria-label="Engagement Trend">
          <h3>Engagement Trend</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer><LineChart data={engagementData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="engagement" stroke="#13a4ec" strokeWidth={3} /></LineChart></ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="chart-card" style={{ marginTop: 12 }}>
        <h3>Events</h3>
        {loading ? <p className="muted">Loading...</p> : (
          <div className="event-list">
            {events.map(ev => (
              <div key={ev.id} className="event-item">
                <div style={{ flex: 1 }}>
                  <div className="event-name">{ev.name}</div>
                  <div className="muted">Attendees: {ev.attendees} · Engagement: {ev.engagement}%</div>
                </div>
                <button className="btn" onClick={() => deleteEvent(ev.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
