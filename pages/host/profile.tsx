import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { motion } from 'framer-motion'

type EventRow = {
  id: string
  title: string
  slug: string
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

type Stats = {
  totalEvents: number
  publishedEvents: number
  totalEnrollments: number
  confirmedEnrollments: number
  totalRevenue: number
}

function isSameDay(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export default function HostProfile() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [events, setEvents] = useState<EventRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = (session?.user as any)?.role === 'admin'

  useEffect(() => {
    if (status === 'loading') return
    if (!session || !isAdmin) {
      router.replace('/dashboard')
      return
    }
    Promise.all([
      fetch('/api/events/admin').then(r => r.ok ? r.json() : []),
      fetch('/api/admin/stats').then(r => r.ok ? r.json() : null),
    ]).then(([evts, s]) => {
      setEvents(evts)
      setStats(s)
    }).finally(() => setLoading(false))
  }, [session, status, isAdmin, router])

  if (status === 'loading' || (loading && session)) {
    return (
      <div className="page">
        <Header adminMode />
        <main className="container">
          <div className="loading-grid" style={{ marginTop: 40 }}>
            {[1, 2].map(i => <div key={i} className="event-card skeleton" />)}
          </div>
        </main>
      </div>
    )
  }

  if (!session || !isAdmin) return null

  const now = Date.now()
  const upcoming = events.filter(e => e.event_date && new Date(e.event_date).getTime() > now && !isSameDay(e.event_date))
  const ongoing = events.filter(e => e.event_date && isSameDay(e.event_date))
  const past = events.filter(e => e.event_date && new Date(e.event_date).getTime() < now && !isSameDay(e.event_date))
  const undated = events.filter(e => !e.event_date)

  const renderGroup = (title: string, list: EventRow[], emptyText: string) => (
    <>
      <div className="section-header" style={{ marginTop: 32 }}>
        <h2>{title}</h2>
        <span className="badge">{list.length}</span>
      </div>
      {list.length === 0 ? (
        <div className="empty-state"><p>{emptyText}</p></div>
      ) : (
        <div className="event-cards">
          {list.map(ev => (
            <div key={ev.id} className="event-card">
              <div className="event-card-top">
                <div className="event-tag">{ev.event_type}</div>
                <span className={`pill ${ev.is_published ? 'pill-live' : 'pill-draft'}`} style={{ marginLeft: 8 }}>
                  {ev.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <h3 className="event-card-title">{ev.title}</h3>
              <div className="event-meta">
                {ev.event_date && <span className="meta-chip">📅 {ev.event_date.slice(0, 10)}{ev.event_time ? ` at ${ev.event_time}` : ''}</span>}
                {ev.location && <span className="meta-chip">📍 {ev.location}</span>}
                <span className="meta-chip">👥 {ev.enrolled_count}{ev.capacity ? `/${ev.capacity}` : ''} enrolled</span>
              </div>
              <Link legacyBehavior href="/dashboard">
                <a className="btn btn-primary enroll-btn">Manage in Dashboard →</a>
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div className="page">
      <Header adminMode onLogout={() => signOut({ callbackUrl: '/' })} />
      <main className="container">
        <motion.div className="explore-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="gradient-text">Host Profile</h1>
          <p className="muted big-subtext">
            Signed in as {session.user?.name || session.user?.email}. Here's an overview of everything you're hosting.
          </p>
        </motion.div>

        <div className="stat-cards">
          <div className="stat-card"><div className="stat-icon">🎯</div><div><p className="stat-label">Total Events</p><p className="stat-value">{stats?.totalEvents ?? '—'}</p></div></div>
          <div className="stat-card"><div className="stat-icon">📡</div><div><p className="stat-label">Published</p><p className="stat-value">{stats?.publishedEvents ?? '—'}</p></div></div>
          <div className="stat-card"><div className="stat-icon">👥</div><div><p className="stat-label">Enrollments</p><p className="stat-value">{stats?.totalEnrollments ?? '—'}</p></div></div>
          <div className="stat-card"><div className="stat-icon">💰</div><div><p className="stat-label">Revenue</p><p className="stat-value">₹{(stats?.totalRevenue ?? 0).toFixed(2)}</p></div></div>
        </div>

        {renderGroup('Ongoing Today', ongoing, 'No events happening today.')}
        {renderGroup('Upcoming', upcoming, 'No upcoming events scheduled.')}
        {renderGroup('Past', past, 'No past events yet.')}
        {undated.length > 0 && renderGroup('No Date Set', undated, '')}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link legacyBehavior href="/dashboard"><a className="btn btn-primary">Go to Dashboard →</a></Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
