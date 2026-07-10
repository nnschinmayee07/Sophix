import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { motion } from 'framer-motion'

export default function CheckoutCancel() {
  return (
    <div className="page">
      <Header />
      <main className="container">
        <motion.div className="result-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="admin-lock-icon">✕</div>
          <h2>Checkout cancelled</h2>
          <p className="muted">Your payment was not completed, and you have not been enrolled. You can try again anytime.</p>
          <Link legacyBehavior href="/participants"><a className="btn btn-primary" style={{ marginTop: 20 }}>Back to events</a></Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
