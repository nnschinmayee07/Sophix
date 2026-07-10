import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../../lib/db'
import { razorpay, razorpayEnabled } from '../../../lib/razorpay'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!razorpayEnabled || !razorpay) {
    return res.status(503).json({ error: 'Payments are not configured yet. Please contact the organizer.' })
  }

  const { enrollment_id } = req.body
  if (!enrollment_id) return res.status(400).json({ error: 'enrollment_id is required' })

  const [enrollment] = await sql`SELECT * FROM enrollments WHERE id = ${enrollment_id}`
  if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' })
  if (enrollment.status === 'confirmed') return res.status(409).json({ error: 'This enrollment is already confirmed' })

  const [event] = await sql`SELECT * FROM events WHERE id = ${enrollment.event_id}`
  if (!event) return res.status(404).json({ error: 'Event not found' })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const amountInPaise = Math.round(Number(event.price) * 100)

  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInPaise,
      currency: 'INR',
      accept_partial: false,
      description: `Enrollment for ${event.title}`,
      customer: {
        name: enrollment.participant_name,
        email: enrollment.participant_email,
      },
      notify: { sms: false, email: true },
      reminder_enable: true,
      notes: {
        enrollment_id: enrollment.id,
        event_id: event.id,
      },
      callback_url: `${appUrl}/checkout/success?enrollment_id=${enrollment.id}`,
      callback_method: 'get',
    })

    await sql`UPDATE enrollments SET payment_link_id = ${paymentLink.id} WHERE id = ${enrollment.id}`

    return res.status(200).json({ url: paymentLink.short_url })
  } catch (err) {
    console.error('POST /api/checkout/create-session failed', err)
    return res.status(500).json({ error: 'Failed to create payment link' })
  }
}
