import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import DotField from '../components/DotField'
import CurvedLoop from '../components/CurvedLoop'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="page">
      <Header />
      <main>
        <section className="hero-v2">
          <DotField
            dotRadius={1.5}
            dotSpacing={18}
            bulgeStrength={60}
            glowRadius={220}
            gradientFrom="rgba(77, 107, 255, 0.4)"
            gradientTo="rgba(0, 0, 181, 0.2)"
            glowColor="#1a1aff"
          />
          <div className="hero-v2-blur" />

          <div className="hero-v2-inner">
            <motion.h1
              className="hero-v2-title"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            >
              Premium events, <span className="hero-v2-serif">discovered</span> on demand.
            </motion.h1>

            <motion.div
              className="hero-v2-cta-row"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button className="gradient-cta" onClick={() => setPickerOpen(true)}>
                <span>Start your journey</span>
              </button>
            </motion.div>

            <motion.div
              className="hero-curved-loop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            >
              <CurvedLoop
                marqueeText="Sophix ✦ Hackathons ✦ Conferences ✦ Workshops ✦ Competitions ✦"
                speed={1.5}
                curveAmount={120}
                className="curved-loop-text curved-loop-text-sm"
              />
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />

      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPickerOpen(false)}
          >
            <motion.div
              className="modal-card role-picker-card"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              onClick={e => e.stopPropagation()}
            >
              <h2>Sign in as</h2>
              <p className="muted" style={{ marginBottom: 20 }}>Choose how you'd like to continue.</p>
              <div className="role-picker-options">
                <Link legacyBehavior href="/login">
                  <a className="role-picker-option">
                    <span className="role-picker-icon">🎓</span>
                    <span>
                      <span className="role-picker-title">Participant</span>
                      <span className="role-picker-desc">Browse events, enroll, and track your registrations</span>
                    </span>
                  </a>
                </Link>
                <Link legacyBehavior href="/dashboard">
                  <a className="role-picker-option">
                    <span className="role-picker-icon">🛠️</span>
                    <span>
                      <span className="role-picker-title">Admin / Host</span>
                      <span className="role-picker-desc">Create and manage events, view analytics</span>
                    </span>
                  </a>
                </Link>
              </div>
              <button type="button" className="btn" style={{ marginTop: 20, width: '100%' }} onClick={() => setPickerOpen(false)}>
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
