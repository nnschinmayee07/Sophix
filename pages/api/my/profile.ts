import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../../lib/db'
import { requireAuth } from '../../../lib/requireAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res)
  if (!session) return

  const userId = (session.user as any)?.id
  if (!userId) return res.status(400).json({ error: 'No user id on session' })

  if (req.method === 'GET') {
    const [user] = await sql`SELECT id, name, email, role, created_at FROM users WHERE id = ${userId}`
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.status(200).json(user)
  }

  if (req.method === 'PATCH') {
    const { name } = req.body
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Name is required' })
    }
    const [user] = await sql`
      UPDATE users SET name = ${name.trim()} WHERE id = ${userId}
      RETURNING id, name, email, role, created_at
    `
    return res.status(200).json(user)
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).json({ error: 'Method not allowed' })
}
