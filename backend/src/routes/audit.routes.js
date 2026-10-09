/**
 * Read-only audit feed.
 * Non-administrative users can only inspect audit events they generated.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.get(
  '/logs',
  authenticate,
  authorize(ROLES.PATIENT, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabaseAdmin
        .from('audit_logs')
        .select('id, actor_id, actor_role, action, resource_type, resource_id, result, metadata, ip_address, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      // Only platform admins can review the platform-wide feed.
      if (req.user.role !== ROLES.ADMIN) {
        query = query.eq('actor_id', req.user.id);
      }

      if (req.query.action) query = query.eq('action', String(req.query.action));
      if (req.query.resource_id) query = query.eq('resource_id', String(req.query.resource_id));

      const { data, error, count } = await query;
      if (error) {
        const failure = new Error('Unable to retrieve audit events');
        failure.statusCode = 502;
        return next(failure);
      }

      const total = count || 0;
      return res.json({
        success: true,
        message: 'Audit logs retrieved',
        data: data || [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      return next(error);
    }
  },
);

module.exports = router;
