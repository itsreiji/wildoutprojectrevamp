
import { describe, it, expect } from 'vitest';
import { ROLE_PERMISSIONS } from '../lib/gallery/permissions';
import { type AuthRole } from '../contexts/AuthContext';

describe('RBAC Consistency Audit', () => {
  it('should have permission definitions for all AuthContext roles', () => {
    // defined in AuthContext.tsx
    const authRoles: AuthRole[] = ['admin', 'editor', 'user', 'anonymous'];
    
    authRoles.forEach(role => {
      expect(ROLE_PERMISSIONS).toHaveProperty(role);
    });
  });

  it('should have consistent role names', () => {
    // 'contributor' and 'viewer' are in ROLE_PERMISSIONS but not in AuthRole
    // 'user' is in AuthRole but not in ROLE_PERMISSIONS (likely)
    const permissionRoles = Object.keys(ROLE_PERMISSIONS);
    expect(permissionRoles).toContain('user');
  });
});
