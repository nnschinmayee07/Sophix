import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const data = await sql`SELECT * FROM participants ORDER BY created_at DESC`
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { name, email, event } = req.body
    if (!name || !email || !event) return res.status(400).json({ error: 'All fields Required' })
    const [row] = await sql`
      INSERT INTO participants (name, email, event)
      VALUES (${name}, ${email}, ${event})
      RETURNING *`
    // increment attendees count on the matching event
    await sql`UPDATE events SET attendees = attendees + 1 WHERE name = ${event}`
    return res.status(201).json(row)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
