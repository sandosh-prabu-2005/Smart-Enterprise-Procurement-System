export const CANONICAL_ROLES = {
  ADMIN: "Procurement Admin",
  REQUESTER: "Requester",
  APPROVER: "Approver",
  FINANCE: "Finance",
  RECEIVER: "Goods Receiver",
};


export function normalizeRole(rawRole) {
  if (!rawRole) return null;
  const value = rawRole.toString().toLowerCase();

  if (value.includes("admin")) return CANONICAL_ROLES.ADMIN;
  if (value.includes("manage") || value.includes("approv")) return CANONICAL_ROLES.APPROVER;
  if (value.includes("finance")) return CANONICAL_ROLES.FINANCE;
  if (value.includes("receiv")) return CANONICAL_ROLES.RECEIVER;
  if (value.includes("request")) return CANONICAL_ROLES.REQUESTER;

  
  return CANONICAL_ROLES.REQUESTER;
}


export function normalizeRoles(rawRoles) {
  if (!Array.isArray(rawRoles) || rawRoles.length === 0) {
    return [CANONICAL_ROLES.REQUESTER];
  }
  const normalized = rawRoles.map(normalizeRole).filter(Boolean);
  return [...new Set(normalized)];
}


const PRIVILEGE_ORDER = [
  CANONICAL_ROLES.ADMIN,
  CANONICAL_ROLES.FINANCE,
  CANONICAL_ROLES.APPROVER,
  CANONICAL_ROLES.RECEIVER,
  CANONICAL_ROLES.REQUESTER,
];

export function getPrimaryRole(roles) {
  for (const role of PRIVILEGE_ORDER) {
    if (roles.includes(role)) return role;
  }
  return CANONICAL_ROLES.REQUESTER;
}

// Where to land right after login, based on primary role.
export function getDefaultRouteForRole(primaryRole) {
  switch (primaryRole) {
    case CANONICAL_ROLES.ADMIN:
    case CANONICAL_ROLES.FINANCE:
      return "/dashboard";
    case CANONICAL_ROLES.APPROVER:
      return "/approvals";
    case CANONICAL_ROLES.RECEIVER:
      return "/purchase-orders";
    default:
      return "/dashboard";
  }
}