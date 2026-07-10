import type { NextApiRequest, NextApiResponse } from 'next'
import Razorpay from 'razorpay'
import sql from '../../../lib/db'
import { razorpayEnabled } from '../../../lib/razorpay'

export const config = {
  api: { bodyParser: false },
}

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!razorpayEnabled) {
    return res.status(503).json({ error: 'Payments are not configured' })
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set; refusing to process webhook')
    return res.status(503).json({ error: 'Webhook not configured' })
  }

  const signature = req.headers['x-razorpay-signature']
  const rawBody = await readRawBody(req)

  const valid = typeof signature === 'string' &&
    Razorpay.validateWebhookSignature(rawBody.toString(), signature, webhookSecret)

  if (!valid) {
    console.error('Razorpay webhook signature verification failed')
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  let event
  try {
    event = JSON.parse(rawBody.toString())
  } catch {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  try {
    if (event.event === 'payment_link.paid') {
      const paymentLink = event.payload?.payment_link?.entity
      const payment = event.payload?.payment?.entity
      const enrollmentId = paymentLink?.notes?.enrollment_id

      if (enrollmentId) {
        const [enrollment] = await sql`SELECT * FROM enrollments WHERE id = ${enrollmentId}`
        if (enrollment) {
          const amountPaid = (payment?.amount ?? paymentLink?.amount_paid ?? 0) / 100
          await sql`
            UPDATE enrollments
            SET status = 'confirmed', payment_status = 'paid', amount_paid = ${amountPaid}, payment_link_id = ${paymentLink.id}
            WHERE id = ${enrollmentId}
          `
          await sql`
            INSERT INTO payments (enrollment_id, provider, provider_payment_id, amount, currency, status)
            VALUES (${enrollmentId}, 'razorpay', ${payment?.id || paymentLink.id}, ${amountPaid}, 'inr', 'paid')
          `
        }
      }
    }

    if (event.event === 'payment_link.expired' || event.event === 'payment_link.cancelled') {
      const paymentLink = event.payload?.payment_link?.entity
      const enrollmentId = paymentLink?.notes?.enrollment_id
      if (enrollmentId) {
        await sql`
          UPDATE enrollments SET payment_status = 'failed'
          WHERE id = ${enrollmentId} AND status = 'pending'
        `
      }
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Razorpay webhook handler failed', err)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}
