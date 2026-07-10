import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../lib/db'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { event_id } = req.query
    if (typeof event_id !== 'string') return res.status(400).json({ error: 'event_id is required' })
    const rows = await sql`
      SELECT id, event_id, participant_name, participant_email, status, payment_status, amount_paid, created_at
      FROM enrollments WHERE event_id = ${event_id} ORDER BY created_at DESC
    `
    return res.status(200).json(rows)
  }

  if (req.method === 'POST') {
    const { event_id, name, email } = req.body

    if (!event_id || !name || !String(name).trim() || !email || !EMAIL_RE.test(String(email).trim())) {
      return res.status(400).json({ error: 'Valid name, email, and event are required' })
    }

    const [event] = await sql`SELECT * FROM events WHERE id = ${event_id}`
    if (!event) return res.status(404).json({ error: 'Event not found' })
    if (!event.is_published) return res.status(403).json({ error: 'This event is not open for enrollment' })

    const [existing] = await sql`
      SELECT id FROM enrollments WHERE event_id = ${event_id} AND participant_email = ${email.toLowerCase().trim()}
      AND status != 'cancelled'
    `
    if (existing) return res.status(409).json({ error: 'You have already enrolled in this event' })

    if (event.capacity !== null) {
      const [{ count }] = await sql`
        SELECT COUNT(*)::int AS count FROM enrollments WHERE event_id = ${event_id} AND status = 'confirmed'
      `
      if (count >= event.capacity) return res.status(409).json({ error: 'This event is full' })
    }

    try {
      if (event.is_paid && Number(event.price) > 0) {
        const [row] = await sql`
          INSERT INTO enrollments (event_id, participant_name, participant_email, status, payment_status)
          VALUES (${event_id}, ${name.trim()}, ${email.toLowerCase().trim()}, 'pending', 'pending')
          RETURNING *
        `
        return res.status(201).json({ enrollment: row, requiresPayment: true })
      }

      const [row] = await sql`
        INSERT INTO enrollments (event_id, participant_name, participant_email, status, payment_status)
        VALUES (${event_id}, ${name.trim()}, ${email.toLowerCase().trim()}, 'confirmed', 'not_required')
        RETURNING *
      `
      return res.status(201).json({ enrollment: row, requiresPayment: false })
    } catch (err: any) {
      if (err?.code === '23505') {
        return res.status(409).json({ error: 'You have already enrolled in this event' })
      }
      console.error('POST /api/enrollments failed', err)
      return res.status(500).json({ error: 'Failed to enroll' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
