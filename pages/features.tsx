import Header from '../components/Header'
import { motion } from 'framer-motion'

const features = [
  { icon: '🎯', title: 'Event Creation', desc: 'Admins can create events with name, date, location and description in seconds.' },
  { icon: '👥', title: 'Participant Enrollment', desc: 'Participants browse events and enroll with just their name and email.' },
  { icon: '📊', title: 'Live Analytics', desc: 'Real-time dashboard with attendee counts and engagement trends that update automatically.' },
  { icon: '🔍', title: 'Event Discovery', desc: 'Explore all available events with full details before enrolling.' },
  { icon: '📅', title: 'Event Scheduling', desc: 'Set dates and locations for every event so participants know exactly when and where.' },
  { icon: '🏆', title: 'Engagement Tracking', desc: 'Track engagement percentage per event to measure success and improve future events.' },
]

export default function Features() {
  return (
    <div className='page'>
      <Header />
      <main className='container'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className='page-title gradient-text'>Features</h1>
          <p className='muted big-subtext' style={{ marginBottom: 32 }}>Everything you need to run a great event.</p>
          <div className='features-grid'>
            {features.map((f, i) => (
              <motion.div key={i} className='feature-card' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                <div className='feature-icon'>{f.icon}</div>
                <h3>{f.title}</h3>
                <p className='muted'>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
