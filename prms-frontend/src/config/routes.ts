/* Issue #9: Centralized role-to-route mapping */

/** Map of role names to their dashboard paths */
export const ROLE_ROUTES: Record<string, string> = {
  admin: '/admin',
  landlord: '/landlord',
  tenant: '/tenant',
  agent: '/agent',
};

/** List of all valid role names */
export const VALID_ROLES = Object.keys(ROLE_ROUTES);

/** Resolve a route for the given role name (case-insensitive) */
export function roleToPath(role: string | null | undefined): string {
  if (!role) return '/login';
  const lower = role.toLowerCase();
  for (const [roleKey, path] of Object.entries(ROLE_ROUTES)) {
    if (lower.includes(roleKey)) return path;
  }
  return '/login';
}
