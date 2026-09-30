export const ADMIN_ROLES = ['Admin', 'SuperAdmin'];

export const isAdminUser = (user?: { role?: string }): boolean =>
  !!user && ADMIN_ROLES.includes(user.role as string);
