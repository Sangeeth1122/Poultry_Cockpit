/**
 * PoultryCockpit - Role-Based Access Control (RBAC) Engine
 * Chapter 22 Security & Access Controls Matrix
 */

import { UserRole } from '../types';
import { ERROR_CODES, BusinessEngineException } from './errors';

export type PermissionAction =
  | 'VIEW_DASHBOARD'
  | 'MANAGE_FARM'
  | 'CREATE_BATCH'
  | 'EDIT_BATCH'
  | 'ARCHIVE_BATCH'
  | 'ENTER_DAILY_LOG'
  | 'RECORD_LIFTING'
  | 'MANAGE_FINANCIALS'
  | 'APPROVE_SETTLEMENT'
  | 'REOPEN_SETTLEMENT'
  | 'VIEW_AUDIT_LOGS';

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  Owner: [
    'VIEW_DASHBOARD',
    'MANAGE_FARM',
    'CREATE_BATCH',
    'EDIT_BATCH',
    'ARCHIVE_BATCH',
    'ENTER_DAILY_LOG',
    'RECORD_LIFTING',
    'MANAGE_FINANCIALS',
    'APPROVE_SETTLEMENT',
    'REOPEN_SETTLEMENT',
    'VIEW_AUDIT_LOGS',
  ],
  Administrator: [
    'VIEW_DASHBOARD',
    'MANAGE_FARM',
    'CREATE_BATCH',
    'EDIT_BATCH',
    'ARCHIVE_BATCH',
    'ENTER_DAILY_LOG',
    'RECORD_LIFTING',
    'MANAGE_FINANCIALS',
    'APPROVE_SETTLEMENT',
    'REOPEN_SETTLEMENT',
    'VIEW_AUDIT_LOGS',
  ],
  Manager: [
    'VIEW_DASHBOARD',
    'CREATE_BATCH',
    'EDIT_BATCH',
    'ENTER_DAILY_LOG',
    'RECORD_LIFTING',
    'VIEW_AUDIT_LOGS',
  ],
  Accountant: [
    'VIEW_DASHBOARD',
    'MANAGE_FINANCIALS',
    'APPROVE_SETTLEMENT',
    'VIEW_AUDIT_LOGS',
  ],
  Viewer: [
    'VIEW_DASHBOARD',
    'VIEW_AUDIT_LOGS',
  ],
};

export const PermissionsEngine = {
  hasPermission(role: UserRole, action: PermissionAction): boolean {
    const allowed = ROLE_PERMISSIONS[role];
    return allowed ? allowed.includes(action) : false;
  },

  assertPermission(role: UserRole, action: PermissionAction): void {
    if (!this.hasPermission(role, action)) {
      throw new BusinessEngineException(
        ERROR_CODES.PER_001,
        `Role '${role}' is not authorized to execute action '${action}'.`
      );
    }
  },
};
