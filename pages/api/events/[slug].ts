import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { slug } = req.query
  if (typeof slug !== 'string') return res.status(400).json({ error: 'Invalid slug' })

  try {
    const [event] = await sql`
      SELECT
        e.id, e.title, e.slug, e.description, e.event_type, e.event_date, e.event_time,
        e.location, e.capacity, e.price, e.currency, e.is_paid, e.is_published, e.image_url,
        e.created_at,
        COUNT(en.id) FILTER (WHERE en.status = 'confirmed') AS enrolled_count
      FROM events e
      LEFT JOIN enrollments en ON en.event_id = e.id
      WHERE e.slug = ${slug} AND e.is_published = true
      GROUP BY e.id
    `
    if (!event) return res.status(404).json({ error: 'Event not found' })
    return res.status(200).json(event)
  } catch (err) {
    console.error('GET /api/events/[slug] failed', err)
    return res.status(500).json({ error: 'Failed to load event' })
  }
}
