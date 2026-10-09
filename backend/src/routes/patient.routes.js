/**
 * Patient directory endpoints used by the hospital/doctor portal.
 * Results are scoped to the current hospital's patient-link records unless
 * the caller is a platform administrator. A patient may only access their own
 * profile and reports.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../utils/constants');
const { ForbiddenError, NotFoundError, BadRequestError } = require('../utils/errors');
const reportService = require('../services/report.service');

const router = express.Router();

async function getHospitalId(user) {
  if (user.role === ROLES.HOSPITAL_ADMIN) {
    const { data, error } = await supabaseAdmin
      .from('hospital_staff')
      .select('hospital_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();
    if (error || !data) throw new ForbiddenError('Active hospital membership not found');
    return data.hospital_id;
  }
  if (user.role === ROLES.DOCTOR) {
    const { data, error } = await supabaseAdmin
      .from('doctors')
      .select('hospital_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();
    if (error || !data) throw new ForbiddenError('Active doctor membership not found');
    return data.hospital_id;
  }
  return null;
}

async function assertPatientVisible(patientId, user) {
  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.PATIENT && user.id === patientId) return;
  if (![ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN].includes(user.role)) {
    throw new ForbiddenError('You cannot access this patient');
  }

  const hospitalId = await getHospitalId(user);
  const { data, error } = await supabaseAdmin
    .from('patient_links')
    .select('id')
    .eq('patient_id', patientId)
    .eq('used_by_hospital_id', hospitalId)
    .eq('used', true)
    .limit(1)
    .maybeSingle();
  if (error || !data) throw new ForbiddenError('This patient is not linked to your hospital');
}

function mapProfile(profile, extras = {}) {
  return {
    id: profile.id,
    patient_id: `PAT-${String(profile.id).slice(0, 8).toUpperCase()}`,
    full_name: profile.full_name,
    phone: profile.phone || undefined,
    created_at: profile.created_at,
    ...extras,
  };
}

async function listPatients(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const search = String(req.query.search || '').trim().toLowerCase();
    let profiles = [];
    let hospitalId = null;
    let hospitalName = null;

    if (req.user.role === ROLES.ADMIN) {
      let query = supabaseAdmin
        .from('profiles')
        .select('id, full_name, phone, created_at, role', { count: 'exact' })
        .eq('role', ROLES.PATIENT)
        .order('created_at', { ascending: false })
        .range(0, 9999);
      if (search) query = query.ilike('full_name', `%${search.replace(/[%_]/g, '\\$&')}%`);
      const { data, error } = await query;
      if (error) throw new BadRequestError('Failed to list patients');
      profiles = data || [];
    } else {
      hospitalId = await getHospitalId(req.user);
      const { data: hospital } = await supabaseAdmin.from('hospitals').select('id, name').eq('id', hospitalId).maybeSingle();
      hospitalName = hospital?.name || null;

      const allLinks = [];
      const batchSize = 1000;
      for (let offset = 0; ; offset += batchSize) {
        const { data, error } = await supabaseAdmin
          .from('patient_links')
          .select('patient_id, profiles:patient_id(id, full_name, phone, created_at, role)')
          .eq('used_by_hospital_id', hospitalId)
          .eq('used', true)
          .order('used_at', { ascending: false })
          .range(offset, offset + batchSize - 1);
        if (error) throw new BadRequestError('Failed to list linked patients');
        allLinks.push(...(data || []));
        if (!data || data.length < batchSize) break;
      }

      const seen = new Set();
      for (const link of allLinks) {
        const profile = link.profiles;
        if (!profile || profile.role !== ROLES.PATIENT || seen.has(profile.id)) continue;
        seen.add(profile.id);
        profiles.push(profile);
      }
    }

    if (search && req.user.role === ROLES.ADMIN) {
      profiles = profiles.filter((profile) => (profile.full_name || '').toLowerCase().includes(search));
    } else if (search) {
      profiles = profiles.filter((profile) => (profile.full_name || '').toLowerCase().includes(search));
    }

    const total = profiles.length;
    const pageProfiles = profiles.slice((page - 1) * limit, page * limit);
    const ids = pageProfiles.map((profile) => profile.id);
    const counts = new Map();

    if (ids.length) {
      const { data: reports, error } = await supabaseAdmin
        .from('medical_reports')
        .select('patient_id')
        .in('patient_id', ids)
        .neq('status', 'DELETED');
      if (error) throw new BadRequestError('Failed to count patient reports');
      for (const item of reports || []) counts.set(item.patient_id, (counts.get(item.patient_id) || 0) + 1);
    }

    const data = pageProfiles.map((profile) => mapProfile(profile, {
      hospital_id: hospitalId || undefined,
      hospital_name: hospitalName || undefined,
      report_count: counts.get(profile.id) || 0,
    }));
    return res.json({ success: true, message: 'Patients retrieved', data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) { return next(error); }
}

router.get('/', authenticate, authorize(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.ADMIN), listPatients);

router.get('/:patientId/reports', authenticate, async (req, res, next) => {
  try {
    await assertPatientVisible(req.params.patientId, req.user);
    const result = await reportService.listReports({
      user: req.user,
      patientId: req.params.patientId,
      page: Math.max(1, Number.parseInt(req.query.page, 10) || 1),
      limit: Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20)),
    });
    return res.json({ success: true, message: 'Patient reports retrieved', data: result });
  } catch (error) { return next(error); }
});

router.get('/:patientId', authenticate, async (req, res, next) => {
  try {
    await assertPatientVisible(req.params.patientId, req.user);
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, created_at, role')
      .eq('id', req.params.patientId)
      .eq('role', ROLES.PATIENT)
      .maybeSingle();
    if (error) throw new BadRequestError('Failed to retrieve patient');
    if (!profile) throw new NotFoundError('Patient not found');

    const { count: reportCount } = await supabaseAdmin
      .from('medical_reports')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', profile.id)
      .neq('status', 'DELETED');

    const { data: link } = await supabaseAdmin
      .from('patient_links')
      .select('used_by_hospital_id')
      .eq('patient_id', profile.id)
      .eq('used', true)
      .order('used_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let hospitalId;
    let hospitalName;
    if (link?.used_by_hospital_id) {
      hospitalId = link.used_by_hospital_id;
      const { data: hospital } = await supabaseAdmin.from('hospitals').select('name').eq('id', hospitalId).maybeSingle();
      hospitalName = hospital?.name;
    }
    if (req.user.role === ROLES.PATIENT && req.user.id === profile.id) {
      return res.json({ success: true, data: mapProfile(profile, {
        email: req.user.email, hospital_id: hospitalId, hospital_name: hospitalName, report_count: reportCount || 0,
      }) });
    }
    return res.json({ success: true, data: mapProfile(profile, {
      hospital_id: hospitalId, hospital_name: hospitalName, report_count: reportCount || 0,
    }) });
  } catch (error) { return next(error); }
});

module.exports = router;
