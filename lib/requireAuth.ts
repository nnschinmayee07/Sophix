import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import type { Session } from 'next-auth'

export async function requireAuth(req: NextApiRequest, res: NextApiResponse): Promise<Session | null> {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return session
}
