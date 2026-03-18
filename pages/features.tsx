import Header from '../components/Header'
import { motion } from 'framer-motion'

export default function Features() {
  return (
    <div className='page'>
      <Header />
      <main className='container'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className='page-title'>Features</h1>
          <div className='glass-card'>
            <ul>
              <li>✨ Drag & drop event builder (MVP)</li>
              <li>🤖 AI-suggested layouts</li>
              <li>📊 Realtime analytics dashboard</li>
              <li>🔗 Seamless integrations (GitHub, Slack, Google)</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
