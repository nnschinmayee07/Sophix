import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { motion } from 'framer-motion'

type Status = 'checking' | 'confirmed' | 'pending' | 'error'

export default function CheckoutSuccess() {
  const router = useRouter()
  const { enrollment_id } = router.query
  const [status, setStatus] = useState<Status>('checking')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (typeof enrollment_id !== 'string') return
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(`/api/enrollments/status?id=${enrollment_id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (cancelled) return
        if (data.status === 'confirmed') {
          setStatus('confirmed')
        } else if (attempts >= 6) {
          setStatus('pending')
        } else {
          setAttempts(a => a + 1)
          setTimeout(poll, 1500)
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    poll()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment_id])

  return (
    <div className="page">
      <Header />
      <main className="container">
        <motion.div className="result-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {status === 'checking' && (
            <>
              <div className="admin-lock-icon">⏳</div>
              <h2>Confirming your payment...</h2>
              <p className="muted">This usually takes a few seconds.</p>
            </>
          )}
          {status === 'confirmed' && (
            <>
              <div className="admin-lock-icon">🎉</div>
              <h2>Payment successful!</h2>
              <p className="muted">Your enrollment is confirmed. See you at the event!</p>
              <Link legacyBehavior href="/participants"><a className="btn btn-primary" style={{ marginTop: 20 }}>Browse more events</a></Link>
            </>
          )}
          {status === 'pending' && (
            <>
              <div className="admin-lock-icon">⏱</div>
              <h2>Payment received, confirming...</h2>
              <p className="muted">Your payment succeeded but confirmation is still processing. Refresh in a moment or check your email.</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="admin-lock-icon">⚠️</div>
              <h2>Couldn't verify payment status</h2>
              <p className="muted">If you completed checkout, your enrollment will confirm shortly. Contact support if this persists.</p>
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
