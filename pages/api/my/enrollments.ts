import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../../lib/db'
import { requireAuth } from '../../../lib/requireAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireAuth(req, res)
  if (!session) return

  const email = session.user?.email
  if (!email) return res.status(400).json({ error: 'No email on session' })

  const rows = await sql`
    SELECT
      en.id, en.status, en.payment_status, en.amount_paid, en.created_at,
      e.id AS event_id, e.title, e.slug, e.event_type, e.event_date, e.event_time,
      e.location, e.is_paid, e.price, e.currency
    FROM enrollments en
    JOIN events e ON e.id = en.event_id
    WHERE en.participant_email = ${email.toLowerCase()}
    ORDER BY en.created_at DESC
  `

  return res.status(200).json(rows)
}
