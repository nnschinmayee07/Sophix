import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'id is required' })

  const [row] = await sql`SELECT status, payment_status FROM enrollments WHERE id = ${id}`
  if (!row) return res.status(404).json({ error: 'Enrollment not found' })

  return res.status(200).json({ status: row.status, payment_status: row.payment_status })
}
