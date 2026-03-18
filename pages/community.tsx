import Header from '../components/Header'
import { motion } from 'framer-motion'

export default function Community() {
  return (
    <div className='page'>
      <Header />
      <main className='container'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className='page-title'>Community</h1>
          <div className='glass-card'>
            <p className='big-subtext'>Join discussions, connect with mentors, and collaborate with sponsors to grow your network.</p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
