import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const data = await sql`SELECT * FROM events ORDER BY created_at DESC`
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { name, attendees, engagement } = req.body
    if (!name) return res.status(400).json({ error: 'Event name required' })
    const [row] = await sql`
      INSERT INTO events (name, attendees, engagement)
      VALUES (${name}, ${Number(attendees || 0)}, ${Number(engagement || 0)})
      RETURNING *`
    return res.status(201).json(row)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    await sql`DELETE FROM events WHERE id = ${id as string}`
    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
