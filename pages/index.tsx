import Header from '../components/Header'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home(){
  return (
    <div className='page'>
      <Header/>
      <main className='container'>
        <section className='hero-landing'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className='gradient-text'>Participate. Learn. Grow.</h1>
            <p className='muted big-subtext'>Your gateway to next-gen hackathons, conferences, and competitions.</p>
            <div className='cta-buttons'>
              <Link legacyBehavior href='/participants'><a className='btn btn-primary'>Join as Participant</a></Link>
              <Link legacyBehavior href='/dashboard'><a className='btn'>Explore Events</a></Link>
            </div>
          </motion.div>
          <motion.img 
            src='https://source.unsplash.com/600x400/?hackathon,technology'
            alt='Hackathon illustration'
            className='hero-img'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
        </section>
      </main>
    </div>
  )
}
