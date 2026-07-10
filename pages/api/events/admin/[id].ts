import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../../../lib/db'
import { requireAdmin } from '../../../../lib/requireAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdmin(req, res))) return

  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid event id' })

  if (req.method === 'PATCH') {
    const {
      title, description, event_type, event_date, event_time,
      location, capacity, price, currency, is_paid, is_published, image_url,
    } = req.body

    const [existing] = await sql`SELECT id FROM events WHERE id = ${id}`
    if (!existing) return res.status(404).json({ error: 'Event not found' })

    if (price !== undefined) {
      const priceNum = Number(price)
      if (Number.isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ error: 'Price must be a non-negative number' })
      }
    }

    try {
      const [row] = await sql`
        UPDATE events SET
          title = COALESCE(${title ?? null}, title),
          description = COALESCE(${description ?? null}, description),
          event_type = COALESCE(${event_type ?? null}, event_type),
          event_date = COALESCE(${event_date ?? null}, event_date),
          event_time = COALESCE(${event_time ?? null}, event_time),
          location = COALESCE(${location ?? null}, location),
          capacity = ${capacity !== undefined ? (capacity === '' ? null : Number(capacity)) : sql`capacity`},
          price = ${price !== undefined ? Number(price) : sql`price`},
          currency = COALESCE(${currency ?? null}, currency),
          is_paid = ${is_paid !== undefined ? Boolean(is_paid) : sql`is_paid`},
          is_published = ${is_published !== undefined ? Boolean(is_published) : sql`is_published`},
          image_url = COALESCE(${image_url ?? null}, image_url),
          updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `
      return res.status(200).json(row)
    } catch (err) {
      console.error('PATCH /api/events/admin/[id] failed', err)
      return res.status(500).json({ error: 'Failed to update event' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [deleted] = await sql`DELETE FROM events WHERE id = ${id} RETURNING id`
      if (!deleted) return res.status(404).json({ error: 'Event not found' })
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('DELETE /api/events/admin/[id] failed', err)
      return res.status(500).json({ error: 'Failed to delete event' })
    }
  }

  res.setHeader('Allow', 'PATCH, DELETE')
  return res.status(405).json({ error: 'Method not allowed' })
}
