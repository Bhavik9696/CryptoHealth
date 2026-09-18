const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/apiResponse');

async function uploadReport(req, res, next) {
  try {
    if (!req.file) throw new Error('A medical file is required');
    const patientId = req.body.patientId || req.body.patient_id;
    const reportType = req.body.reportType || req.body.report_type;
    const { title, description } = req.body;
    if (!patientId || !reportType) throw new Error('patient_id and report_type are required');

    const report = await reportService.uploadReport({
      file: req.file,
      patientId,
      reportType,
      title,
      description,
      user: req.user,
      ipAddress: req.ip,
    });
    return sendSuccess(res, { statusCode: 201, message: 'Medical report encrypted, signed, and uploaded', data: report });
  } catch (error) {
    next(error);
  }
}

async function listReports(req, res, next) {
  try {
    const result = await reportService.listReports({
      user: req.user,
      patientId: req.query.patientId,
      hospitalId: req.query.hospitalId,
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 100),
    });
    return sendSuccess(res, { message: 'Reports retrieved', data: result });
  } catch (error) {
    next(error);
  }
}

async function getReport(req, res, next) {
  try {
    const report = await reportService.getReport(req.params.id, req.user);
    return sendSuccess(res, { message: 'Report retrieved', data: report });
  } catch (error) {
    next(error);
  }
}

async function downloadReport(req, res, next) {
  try {
    const { report, plaintext } = await reportService.downloadReport(req.params.id, req.user, req.ip);
    res.set('Content-Type', report.mime_type || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${encodeURIComponent(report.file_name)}"`);
    return res.send(plaintext);
  } catch (error) {
    next(error);
  }
}

async function deleteReport(req, res, next) {
  try {
    await reportService.deleteReport(req.params.id, req.user, req.ip);
    return sendSuccess(res, { message: 'Report deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = { uploadReport, listReports, getReport, downloadReport, deleteReport };