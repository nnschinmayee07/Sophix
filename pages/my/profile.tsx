import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { motion } from 'framer-motion'

type MyEnrollment = {
  id: string
  status: string
  payment_status: string
  amount_paid: string
  created_at: string
  event_id: string
  title: string
  slug: string
  event_type: string
  event_date: string | null
  event_time: string
  location: string
  is_paid: boolean
  price: string
  currency: string
}

type Profile = { id: string; name: string; email: string; created_at: string }

export default function MyProfile() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [enrollments, setEnrollments] = useState<MyEnrollment[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.replace('/login')
      return
    }
    Promise.all([
      fetch('/api/my/enrollments').then(r => r.ok ? r.json() : []),
      fetch('/api/my/profile').then(r => r.ok ? r.json() : null),
    ]).then(([enr, prof]) => {
      setEnrollments(enr)
      setProfile(prof)
      if (prof) setNameInput(prof.name)
    }).finally(() => setLoading(false))
  }, [session, status, router])

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim()) return
    setSavingName(true)
    setSaveMessage('')
    const res = await fetch('/api/my/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameInput }),
    })
    setSavingName(false)
    if (res.ok) {
      const updated = await res.json()
      setProfile(updated)
      setSaveMessage('Saved!')
      setTimeout(() => setSaveMessage(''), 2500)
    } else {
      setSaveMessage('Could not save changes.')
    }
  }

  if (status === 'loading' || (loading && session)) {
    return (
      <div className="page">
        <Header />
        <main className="container">
          <div className="loading-grid" style={{ marginTop: 40 }}>
            {[1, 2].map(i => <div key={i} className="event-card skeleton" />)}
          </div>
        </main>
      </div>
    )
  }

  if (!session) return null

  const upcoming = enrollments.filter(en => en.status !== 'cancelled')

  return (
    <div className="page">
      <Header />
      <main className="container">
        <motion.div className="explore-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="gradient-text">My Profile</h1>
          <p className="muted big-subtext">Manage your account and view your event history.</p>
        </motion.div>

        <div className="section-header"><h2>Account Settings</h2></div>
        <form className="create-form" onSubmit={saveName} style={{ maxWidth: 480 }}>
          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="profile-name">Name</label>
              <input id="profile-name" value={nameInput} onChange={e => setNameInput(e.target.value)} required />
            </div>
            <div className="form-row">
              <label htmlFor="profile-email">Email</label>
              <input id="profile-email" value={profile?.email || ''} disabled />
            </div>
          </div>
          {saveMessage && <p className="muted small" style={{ marginTop: 8 }}>{saveMessage}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={savingName}>
              {savingName ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-danger" onClick={() => signOut({ callbackUrl: '/' })}>Log Out</button>
          </div>
        </form>

        <div className="section-header" style={{ marginTop: 40 }}>
          <h2>Your Events</h2>
          <span className="badge">{upcoming.length}</span>
        </div>

        {upcoming.length === 0 ? (
          <div className="empty-state">
            <p>You haven't enrolled in any events yet.</p>
            <Link legacyBehavior href="/participants">
              <a className="btn btn-primary" style={{ marginTop: 12 }}>Browse Events</a>
            </Link>
          </div>
        ) : (
          <div className="event-cards">
            {upcoming.map((en, i) => (
              <motion.div key={en.id} className="event-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="event-card-top">
                  <div className="event-tag">{en.event_type}</div>
                  <span className={`pill ${en.status === 'confirmed' ? 'pill-live' : 'pill-draft'}`} style={{ marginLeft: 8 }}>
                    {en.status}
                  </span>
                </div>
                <h3 className="event-card-title">{en.title}</h3>
                <div className="event-meta">
                  {en.event_date && <span className="meta-chip">📅 {en.event_date.slice(0, 10)}</span>}
                  {en.location && <span className="meta-chip">📍 {en.location}</span>}
                  {en.is_paid && (
                    <span className="meta-chip">
                      💰 {en.payment_status === 'paid' ? `Paid ${en.currency?.toUpperCase()} ${en.amount_paid}` : `${en.currency?.toUpperCase()} ${en.price} — ${en.payment_status}`}
                    </span>
                  )}
                </div>
                <Link legacyBehavior href={`/event/${en.slug}`}>
                  <a className="btn enroll-btn">View Event →</a>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
