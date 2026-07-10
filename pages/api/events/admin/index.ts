import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../../../lib/db'
import { slugify } from '../../../../lib/slug'
import { requireAdmin } from '../../../../lib/requireAdmin'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (!(await requireAdmin(req, res))) return
    const events = await sql`
      SELECT
        e.*,
        COUNT(en.id) FILTER (WHERE en.status = 'confirmed') AS enrolled_count
      FROM events e
      LEFT JOIN enrollments en ON en.event_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `
    return res.status(200).json(events)
  }

  if (req.method === 'POST') {
    if (!(await requireAdmin(req, res))) return

    const {
      title, description, event_type, event_date, event_time,
      location, capacity, price, currency, is_paid, is_published, image_url,
    } = req.body

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Event title is required' })
    }

    const priceNum = Number(price || 0)
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' })
    }

    const capacityNum = capacity !== undefined && capacity !== null && capacity !== ''
      ? Number(capacity)
      : null
    if (capacityNum !== null && (Number.isNaN(capacityNum) || capacityNum < 0)) {
      return res.status(400).json({ error: 'Capacity must be a non-negative number' })
    }

    const session = await getServerSession(req, res, authOptions)
    const createdBy = (session?.user as any)?.id ?? null

    const baseSlug = slugify(title)
    let slug = baseSlug
    let suffix = 0
    while (true) {
      const [existing] = await sql`SELECT id FROM events WHERE slug = ${slug}`
      if (!existing) break
      suffix += 1
      slug = `${baseSlug}-${suffix}`
    }

    try {
      const [row] = await sql`
        INSERT INTO events (
          title, slug, description, event_type, event_date, event_time,
          location, capacity, price, currency, is_paid, is_published, image_url, created_by
        ) VALUES (
          ${title}, ${slug}, ${description || ''}, ${event_type || 'hackathon'},
          ${event_date || null}, ${event_time || ''}, ${location || ''}, ${capacityNum},
          ${priceNum}, ${currency || 'inr'}, ${Boolean(is_paid)}, ${Boolean(is_published)},
          ${image_url || ''}, ${createdBy}
        )
        RETURNING *
      `
      return res.status(201).json(row)
    } catch (err) {
      console.error('POST /api/events/admin failed', err)
      return res.status(500).json({ error: 'Failed to create event' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
