/**
 * Access Grant Controller — HTTP layer for the access grant & token system.
 *
 * Patient-facing:
 *   POST   /api/access-grants           — create a grant (returns raw token once)
 *   GET    /api/access-grants           — list patient's grants
 *   GET    /api/access-grants/:id       — get a specific grant
 *   POST   /api/access-grants/:id/revoke — revoke a grant
 *
 * Doctor-facing:
 *   POST   /api/access-tokens/validate            — validate token, get report metadata
 *   GET    /api/access-tokens/:token/report       — view full report metadata
 */
const accessGrantService = require('../services/accessGrant.service');
const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/apiResponse');

// ─── Patient Endpoints ────────────────────────────────────────────────────────

/**
 * POST /api/access-grants
 * Patient creates a new access grant for one of their reports.
 */
async function createGrant(req, res, next) {
  try {
    const { reportId, scope, expiresInHours, maxUses, recipientId } = req.body;

    const { grant, rawToken } = await accessGrantService.createGrant({
      patientId: req.user.id,
      reportId,
      scope,
      expiresInHours,
      maxUses,
      recipientId,
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Access grant created. Save the token — it will not be shown again.',
      data: {
        grant,
        // The raw token is returned ONCE and never again
        accessToken: rawToken,
        warning: 'Store this token securely. It cannot be retrieved after this response.',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/access-grants
 * Patient lists all their access grants.
 */
async function listGrants(req, res, next) {
  try {
    const { page, limit, status } = req.query;

    const result = await accessGrantService.listGrants(req.user.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status,
    });

    return sendSuccess(res, {
      message: 'Access grants retrieved',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/access-grants/:id
 * Patient gets a specific access grant by ID.
 */
async function getGrant(req, res, next) {
  try {
    const grant = await accessGrantService.getGrant(req.params.id, req.user.id);

    return sendSuccess(res, {
      message: 'Access grant retrieved',
      data: grant,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/access-grants/:id/revoke
 * Patient revokes an active access grant.
 */
async function revokeGrant(req, res, next) {
  try {
    const grant = await accessGrantService.revokeGrant(
      req.params.id,
      req.user.id,
      req.ip
    );

    return sendSuccess(res, {
      message: 'Access grant revoked successfully',
      data: grant,
    });
  } catch (error) {
    next(error);
  }
}

// ─── Doctor Endpoints ─────────────────────────────────────────────────────────

/**
 * POST /api/access-tokens/validate
 * Doctor submits a raw token to validate it and get report metadata.
 * The token's use_count is incremented on success.
 */
async function validateToken(req, res, next) {
  try {
    const { token } = req.body;

    const result = await accessGrantService.validateToken(
      token,
      req.user.id,
      req.ip
    );

    return sendSuccess(res, {
      message: 'Token is valid',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/access-tokens/:token/report
 * Doctor uses a token to view full report metadata.
 * If scope is 'download', also returns the decrypted file download URL.
 */
async function getReportViaToken(req, res, next) {
  try {
    const { token } = req.params;

    const result = await accessGrantService.validateToken(
      token,
      req.user.id,
      req.ip
    );

    // If download scope, include download instructions
    let downloadInfo = null;
    if (result.grant.scope === 'download') {
      downloadInfo = {
        message: 'Download authorized. Use GET /api/reports/:id/file with your Bearer token.',
        reportId: result.report.id,
      };
    }

    return sendSuccess(res, {
      message: 'Report access authorized',
      data: {
        grant: result.grant,
        report: result.report,
        downloadInfo,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createGrant,
  listGrants,
  getGrant,
  revokeGrant,
  validateToken,
  getReportViaToken,
};
