/**
 * PoultryCockpit - Central Business Engine Boundary
 * Strictly isolates business rules, authorization, audit logging, and calculations.
 */

import { ERROR_CODES, BusinessEngineException } from './errors';
import { PermissionsEngine, PermissionAction } from './permissions';
import { AuditEngine, LogEventParams } from './audit';
import { BusinessEngineCalculations } from './calculations';
import { UserRole, BatchStatus } from '../types';

export const BusinessEngine = {
  // Business Rules & Validations
  validateBatchCreation(role: UserRole, shedHasActiveBatch: boolean, placementDate: string): void {
    PermissionsEngine.assertPermission(role, 'CREATE_BATCH');
    if (shedHasActiveBatch) {
      throw new BusinessEngineException(ERROR_CODES.BAT_001);
    }
    const placement = new Date(placementDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (placement > today) {
      throw new BusinessEngineException(ERROR_CODES.BAT_005);
    }
  },

  validateBatchUpdate(role: UserRole, batchStatus: BatchStatus): void {
    PermissionsEngine.assertPermission(role, 'EDIT_BATCH');
    if (batchStatus === 'Archived') {
      throw new BusinessEngineException(ERROR_CODES.BAT_004, 'Cannot edit an archived batch record.');
    }
  },

  validateStageTransition(role: UserRole, currentStage: number, targetStage: number): void {
    PermissionsEngine.assertPermission(role, 'EDIT_BATCH');
    if (targetStage < 1 || targetStage > 8) {
      throw new BusinessEngineException(ERROR_CODES.SYS_001, 'Invalid batch wizard stage specified.');
    }
    if (targetStage > currentStage + 1) {
      throw new BusinessEngineException(ERROR_CODES.BAT_002, 'Cannot skip batch wizard setup stages.');
    }
  },

  validateDailyLogEntry(role: UserRole, feedKg: number, waterLiters: number, mortality: number, liveBirds: number): void {
    PermissionsEngine.assertPermission(role, 'ENTER_DAILY_LOG');
    if (feedKg < 0) throw new BusinessEngineException(ERROR_CODES.DLG_003);
    if (waterLiters < 0) throw new BusinessEngineException(ERROR_CODES.DLG_004);
    if (mortality < 0) throw new BusinessEngineException(ERROR_CODES.DLG_002);
    if (mortality > liveBirds) throw new BusinessEngineException(ERROR_CODES.DLG_005);
  },

  validateBatchArchival(role: UserRole, batchStatus: BatchStatus, settlementApproved: boolean): void {
    PermissionsEngine.assertPermission(role, 'ARCHIVE_BATCH');
    if (batchStatus === 'Archived') {
      throw new BusinessEngineException(ERROR_CODES.BAT_004);
    }
    if (!settlementApproved) {
      throw new BusinessEngineException(ERROR_CODES.BAT_003);
    }
  },

  // Role Assertions
  assertPermission(role: UserRole, action: PermissionAction): void {
    PermissionsEngine.assertPermission(role, action);
  },

  // Audit Event Builder
  createAuditLog(params: LogEventParams) {
    return AuditEngine.createAuditRecord(params);
  },

  // Calculation Contracts
  calculations: BusinessEngineCalculations,
};

export { ERROR_CODES, BusinessEngineException };
