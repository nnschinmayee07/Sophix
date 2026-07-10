import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../../lib/db'
import { requireAdmin } from '../../../lib/requireAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!(await requireAdmin(req, res))) return

  const [[eventStats], [enrollmentStats], [revenueStats], eventBreakdown] = await Promise.all([
    sql`SELECT COUNT(*)::int AS total_events, COUNT(*) FILTER (WHERE is_published)::int AS published_events FROM events`,
    sql`
      SELECT
        COUNT(*)::int AS total_enrollments,
        COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed_enrollments,
        COUNT(*) FILTER (WHERE payment_status = 'paid')::int AS paid_enrollments,
        COUNT(*) FILTER (WHERE payment_status = 'not_required' AND status = 'confirmed')::int AS free_enrollments
      FROM enrollments
    `,
    sql`SELECT COALESCE(SUM(amount_paid), 0)::float AS total_revenue FROM enrollments WHERE payment_status = 'paid'`,
    sql`
      SELECT e.id, e.title, e.is_published, e.is_paid,
        COUNT(en.id) FILTER (WHERE en.status = 'confirmed')::int AS enrolled_count,
        COALESCE(SUM(en.amount_paid) FILTER (WHERE en.payment_status = 'paid'), 0)::float AS revenue
      FROM events e
      LEFT JOIN enrollments en ON en.event_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `,
  ])

  return res.status(200).json({
    totalEvents: eventStats.total_events,
    publishedEvents: eventStats.published_events,
    totalEnrollments: enrollmentStats.total_enrollments,
    confirmedEnrollments: enrollmentStats.confirmed_enrollments,
    paidEnrollments: enrollmentStats.paid_enrollments,
    freeEnrollments: enrollmentStats.free_enrollments,
    totalRevenue: revenueStats.total_revenue,
    events: eventBreakdown,
  })
}
