import Header from '../components/Header'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className='page'>
      <Header />
      <main className='container'>
        <section className='hero-landing'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className='gradient-text'>Participate. Learn. Grow.</h1>
            <p className='muted big-subtext'>Your gateway to next-gen hackathons, conferences, and competitions.</p>
            <div className='cta-buttons'>
              <Link legacyBehavior href='/dashboard'>
                <a className='btn btn-primary'>Create Event (Admin)</a>
              </Link>
              <Link legacyBehavior href='/participants'>
                <a className='btn'>Enroll as Participant</a>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src='https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80'
              alt='Hackathon illustration'
              className='hero-img'
            />
          </motion.div>
        </section>
      </main>
    </div>
  )
}
