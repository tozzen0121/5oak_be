const { isValidTenant, normalizeTenant } = require('../config/tenants');
const { getReportModel } = require('../models/Report');
const { getLaunchGameModel } = require('../models/LaunchGame');

const tenantMiddleware = (req, res, next) => {
  const tenant = normalizeTenant(req.params.tenant);

  if (!isValidTenant(tenant)) {
    return res.status(400).json({
      message: `Invalid tenant "${req.params.tenant}". Allowed: check REPORT_TENANTS.`,
    });
  }

  req.tenant = tenant;
  req.Report = getReportModel(tenant);
  req.LaunchGame = getLaunchGameModel(tenant);
  next();
};

/** Force tenant=5oak for legacy /api/reports and /api/launchGames mounts */
const defaultTenantMiddleware = (req, res, next) => {
  req.params.tenant = '5oak';
  return tenantMiddleware(req, res, next);
};

module.exports = {
  tenantMiddleware,
  defaultTenantMiddleware,
};
