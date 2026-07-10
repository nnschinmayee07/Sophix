import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const [[eventStats], [enrollmentStats]] = await Promise.all([
    sql`SELECT COUNT(*)::int AS published_events FROM events WHERE is_published = true`,
    sql`SELECT COUNT(*)::int AS confirmed_enrollments FROM enrollments WHERE status = 'confirmed'`,
  ])

  return res.status(200).json({
    publishedEvents: eventStats.published_events,
    confirmedEnrollments: enrollmentStats.confirmed_enrollments,
  })
}
