const DEFAULT_TENANTS = ['5oak', 'intelligate'];

const allowedTenants = (process.env.REPORT_TENANTS || DEFAULT_TENANTS.join(','))
  .split(',')
  .map((t) => t.trim().toLowerCase())
  .filter(Boolean);

const isValidTenant = (tenant) => allowedTenants.includes(String(tenant || '').toLowerCase());

const normalizeTenant = (tenant) => String(tenant || '').toLowerCase();

module.exports = {
  allowedTenants,
  isValidTenant,
  normalizeTenant,
};
