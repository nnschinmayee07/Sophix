import Header from '../components/Header'
import { motion } from 'framer-motion'

const items = [
  { icon: '💬', title: 'Discussions', desc: 'Connect with other participants and share ideas before and after events.' },
  { icon: '🧑‍🏫', title: 'Mentors', desc: 'Get guidance from experienced professionals in your field.' },
  { icon: '🤝', title: 'Sponsors', desc: 'Meet sponsors who support innovation and are looking for talent.' },
  { icon: '🌐', title: 'Network', desc: 'Build lasting connections with people who share your passion.' },
]

export default function Community() {
  return (
    <div className='page'>
      <Header />
      <main className='container'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className='page-title gradient-text'>Community</h1>
          <p className='muted big-subtext' style={{ marginBottom: 32 }}>Join a growing network of builders, learners, and innovators.</p>
          <div className='features-grid'>
            {items.map((item, i) => (
              <motion.div key={i} className='feature-card' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                <div className='feature-icon'>{item.icon}</div>
                <h3>{item.title}</h3>
                <p className='muted'>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
