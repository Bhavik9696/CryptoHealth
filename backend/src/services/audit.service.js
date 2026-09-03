/**
 * Audit Service — creates audit log entries for sensitive operations.
 * This is a foundational service used by all other services.
 */
const { supabaseAdmin } = require('../config/supabase');

/**
 * Create an audit log entry.
 * @param {object} params
 * @param {string} params.actorId - User ID of who performed the action
 * @param {string} params.actorRole - Role of the actor
 * @param {string} params.action - Action performed (from AUDIT_ACTIONS)
 * @param {string} params.resourceType - Type of resource (e.g., 'medical_report')
 * @param {string} [params.resourceId] - ID of the resource
 * @param {string} params.result - Result (success/failure/denied)
 * @param {object} [params.metadata] - Additional context
 * @param {string} [params.ipAddress] - Client IP address
 */
async function createAuditLog({
  actorId,
  actorRole,
  action,
  resourceType,
  resourceId = null,
  result,
  metadata = null,
  ipAddress = null,
}) {
  try {
    const { error } = await supabaseAdmin.from('audit_logs').insert({
      actor_id: actorId,
      actor_role: actorRole,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      result,
      metadata,
      ip_address: ipAddress,
    });

    if (error) {
      // Audit logging should never block the main operation
      console.error('Audit log error:', error);
    }
  } catch (err) {
    console.error('Audit log exception:', err);
  }
}

module.exports = { createAuditLog };
