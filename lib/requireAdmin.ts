import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  const session = await getServerSession(req, res, authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}
