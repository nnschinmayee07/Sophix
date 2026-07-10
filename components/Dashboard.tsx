import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

type EventRow = {
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
  is_published: boolean
  enrolled_count: number
}

type Enrollment = {
  id: string
  event_id: string
  participant_name: string
  participant_email: string
  status: string
  payment_status: string
  amount_paid: string
  created_at: string
}

type Stats = {
  totalEvents: number
  publishedEvents: number
  totalEnrollments: number
  confirmedEnrollments: number
  paidEnrollments: number
  freeEnrollments: number
  totalRevenue: number
  events: { id: string; title: string; enrolled_count: number; revenue: number }[]
}

const emptyForm = {
  title: '', description: '', event_type: 'hackathon', event_date: '', event_time: '',
  location: '', capacity: '', price: '0', currency: 'inr', is_paid: false, is_published: true,
}

export default function Dashboard() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [formData, setFormData] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAll(true)
    const interval = setInterval(() => fetchAll(false), 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedEvent) fetchEnrollments(selectedEvent.id)
    else setEnrollments([])
  }, [selectedEvent])

  async function fetchAll(initial = false) {
    if (initial) setLoading(true)
    else setRefreshing(true)
    const [evRes, statsRes] = await Promise.all([
      fetch('/api/events/admin'),
      fetch('/api/admin/stats'),
    ])
    if (evRes.ok) setEvents(await evRes.json())
    if (statsRes.ok) setStats(await statsRes.json())
    if (initial) setLoading(false)
    else setRefreshing(false)
  }

  async function fetchEnrollments(eventId: string) {
    const res = await fetch(`/api/enrollments?event_id=${eventId}`)
    if (res.ok) setEnrollments(await res.json())
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = (e.target as HTMLInputElement).checked
    setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const startCreate = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setFormError('')
    setShowForm(true)
  }

  const startEdit = (ev: EventRow) => {
    setFormData({
      title: ev.title,
      description: ev.description || '',
      event_type: ev.event_type || 'hackathon',
      event_date: ev.event_date ? ev.event_date.slice(0, 10) : '',
      event_time: ev.event_time || '',
      location: ev.location || '',
      capacity: ev.capacity !== null ? String(ev.capacity) : '',
      price: ev.price || '0',
      currency: ev.currency || 'inr',
      is_paid: ev.is_paid,
      is_published: ev.is_published,
    })
    setEditingId(ev.id)
    setFormError('')
    setShowForm(true)
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!formData.title.trim()) return setFormError('Event title is required')
    const priceNum = Number(formData.price || 0)
    if (Number.isNaN(priceNum) || priceNum < 0) return setFormError('Price must be a valid non-negative number')
    if (formData.is_paid && priceNum <= 0) return setFormError('Paid events must have a price greater than 0')

    setSubmitting(true)
    const url = editingId ? `/api/events/admin/${editingId}` : '/api/events/admin'
    const method = editingId ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    setSubmitting(false)

    if (res.ok) {
      setShowForm(false)
      setEditingId(null)
      setSuccess(editingId ? 'Event updated successfully!' : 'Event created successfully!')
      setTimeout(() => setSuccess(''), 3000)
      fetchAll(false)
    } else {
      const { error } = await res.json()
      setFormError(error || 'Something went wrong')
    }
  }

  const togglePublish = async (ev: EventRow) => {
    const res = await fetch(`/api/events/admin/${ev.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !ev.is_published }),
    })
    if (res.ok) fetchAll(false)
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    const res = await fetch(`/api/events/admin/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEvents(prev => prev.filter(x => x.id !== id))
      if (selectedEvent?.id === id) setSelectedEvent(null)
    }
  }

  const pieData = stats ? [
    { name: 'Paid', value: stats.paidEnrollments },
    { name: 'Free', value: stats.freeEnrollments },
  ] : []
  const PIE_COLORS = ['#13a4ec', '#8b5cf6']

  return (
    <section className="dashboard" aria-labelledby="dashboard-heading">
      {success && <div className="toast success">{success}</div>}

      <div className="admin-hero">
        <div>
          <h1 id="dashboard-heading">Admin Dashboard</h1>
          <p className="muted">Manage your events and track enrollments {refreshing && <span className="refresh-dot">● live</span>}</p>
        </div>
        <button className="btn btn-primary" onClick={() => (showForm ? setShowForm(false) : startCreate())}>
          {showForm ? '✕ Close' : '+ Create Event'}
        </button>
      </div>

      {showForm && (
        <form className="create-form" onSubmit={submitForm}>
          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="title">Event Title *</label>
              <input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. AI Hackathon 2026" required />
            </div>
            <div className="form-row">
              <label htmlFor="event_type">Event Type</label>
              <select id="event_type" name="event_type" value={formData.event_type} onChange={handleChange}>
                <option value="hackathon">Hackathon</option>
                <option value="conference">Conference</option>
                <option value="competition">Competition</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="event_date">Date</label>
              <input id="event_date" name="event_date" type="date" value={formData.event_date} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="event_time">Time</label>
              <input id="event_time" name="event_time" type="time" value={formData.event_time} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="location">Location</label>
              <input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Hyderabad / Online" />
            </div>
            <div className="form-row">
              <label htmlFor="capacity">Capacity (optional)</label>
              <input id="capacity" name="capacity" value={formData.capacity} onChange={handleChange} inputMode="numeric" placeholder="e.g. 100" />
            </div>
            <div className="form-row">
              <label htmlFor="price">Price</label>
              <input id="price" name="price" value={formData.price} onChange={handleChange} inputMode="decimal" placeholder="0" disabled={!formData.is_paid} />
            </div>
            <div className="form-row">
              <label htmlFor="currency">Currency</label>
              <input id="currency" name="currency" value="INR" disabled />
              <p className="muted small">Payments are processed via Razorpay, which only supports INR.</p>
            </div>
            <div className="form-row checkbox-row">
              <label htmlFor="is_paid">
                <input id="is_paid" name="is_paid" type="checkbox" checked={formData.is_paid} onChange={handleChange} />
                {' '}Paid event
              </label>
            </div>
            <div className="form-row checkbox-row">
              <label htmlFor="is_published">
                <input id="is_published" name="is_published" type="checkbox" checked={formData.is_published} onChange={handleChange} />
                {' '}Published (visible to participants)
              </label>
            </div>
            <div className="form-row full-width">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="What is this event about?" rows={3} />
            </div>
          </div>
          {formError && <p className="error-msg">{formError}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Event'}
            </button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="stat-cards">
        <div className="stat-card"><div className="stat-icon">🎯</div><div><p className="stat-label">Total Events</p><p className="stat-value">{stats?.totalEvents ?? '—'}</p></div></div>
        <div className="stat-card"><div className="stat-icon">👥</div><div><p className="stat-label">Total Enrollments</p><p className="stat-value">{stats?.totalEnrollments ?? '—'}</p></div></div>
        <div className="stat-card"><div className="stat-icon">💰</div><div><p className="stat-label">Revenue</p><p className="stat-value">₹{(stats?.totalRevenue ?? 0).toFixed(2)}</p></div></div>
        <div className="stat-card"><div className="stat-icon">✅</div><div><p className="stat-label">Confirmed</p><p className="stat-value">{stats?.confirmedEnrollments ?? '—'}</p></div></div>
      </div>

      {stats && stats.events.length > 0 && (
        <div className="charts">
          <div className="chart-card">
            <h3>Enrollments per Event</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={stats.events.map(e => ({ name: e.title.length > 12 ? e.title.slice(0, 12) + '…' : e.title, enrolled: e.enrolled_count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#9aa4b2', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9aa4b2', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0f1724', border: 'none', borderRadius: 8 }} />
                  <Bar dataKey="enrolled" name="Enrolled" fill="#13a4ec" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <h3>Paid vs Free Enrollments</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f1724', border: 'none', borderRadius: 8 }} />
                </PieChart>
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
            <div key={ev.id} className={`event-card ${selectedEvent?.id === ev.id ? 'selected' : ''}`} onClick={() => setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)}>
              <div className="event-card-header">
                <div>
                  <h3 className="event-card-title">{ev.title}</h3>
                  {ev.event_date && <p className="muted small">📅 {ev.event_date.slice(0, 10)}{ev.event_time ? ` at ${ev.event_time}` : ''}</p>}
                  {ev.location && <p className="muted small">📍 {ev.location}</p>}
                </div>
                <div className="event-card-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn" onClick={() => startEdit(ev)}>Edit</button>
                  <button className="btn" onClick={() => togglePublish(ev)}>{ev.is_published ? 'Unpublish' : 'Publish'}</button>
                  <button className="btn btn-danger" onClick={() => deleteEvent(ev.id)}>Delete</button>
                </div>
              </div>
              {ev.description && <p className="event-desc">{ev.description}</p>}
              <div className="event-stats">
                <span className="pill">👥 {ev.enrolled_count} enrolled{ev.capacity ? ` / ${ev.capacity}` : ''}</span>
                <span className="pill">{ev.is_paid ? `💰 ${ev.currency?.toUpperCase()} ${ev.price}` : '🆓 Free'}</span>
                <span className={`pill ${ev.is_published ? 'pill-live' : 'pill-draft'}`}>{ev.is_published ? 'Published' : 'Draft'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-header" style={{ marginTop: 32 }}>
        <h2>Participants {selectedEvent ? `— ${selectedEvent.title}` : ''}</h2>
        <span className="badge">{enrollments.length}</span>
      </div>
      {!selectedEvent ? (
        <div className="empty-state"><p>Select an event above to view its participants.</p></div>
      ) : (
        <div className="participants-table">
          {enrollments.length === 0 ? (
            <div className="empty-state"><p>No participants yet for this event.</p></div>
          ) : (
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Status</th><th>Payment</th></tr></thead>
              <tbody>
                {enrollments.map((p, i) => (
                  <tr key={p.id}>
                    <td className="muted">{i + 1}</td>
                    <td>{p.participant_name}</td>
                    <td className="muted">{p.participant_email}</td>
                    <td><span className="pill">{p.status}</span></td>
                    <td><span className="pill">{p.payment_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  )
}
