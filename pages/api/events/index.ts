import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const events = await sql`
      SELECT
        e.id, e.title, e.slug, e.description, e.event_type, e.event_date, e.event_time,
        e.location, e.capacity, e.price, e.currency, e.is_paid, e.is_published, e.image_url,
        e.created_at,
        COUNT(en.id) FILTER (WHERE en.status = 'confirmed') AS enrolled_count
      FROM events e
      LEFT JOIN enrollments en ON en.event_id = e.id
      WHERE e.is_published = true
      GROUP BY e.id
      ORDER BY e.event_date ASC NULLS LAST, e.created_at DESC
    `
    return res.status(200).json(events)
  } catch (err) {
    console.error('GET /api/events failed', err)
    return res.status(500).json({ error: 'Failed to load events' })
  }
}
