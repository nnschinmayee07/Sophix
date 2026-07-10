import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import sql from '../../../lib/db'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, password, role } = req.body

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Name is required' })
  }
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return res.status(400).json({ error: 'A valid email is required' })
  }
  if (!password || String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const normalizedRole = role === 'admin' ? 'admin' : 'participant'
  const normalizedEmail = email.toLowerCase().trim()

  const [existing] = await sql`SELECT id FROM users WHERE email = ${normalizedEmail}`
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const [user] = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name.trim()}, ${normalizedEmail}, ${passwordHash}, ${normalizedRole})
      RETURNING id, name, email, role
    `
    return res.status(201).json({ user })
  } catch (err: any) {
    if (err?.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }
    console.error('POST /api/auth/signup failed', err)
    return res.status(500).json({ error: 'Failed to create account' })
  }
}
