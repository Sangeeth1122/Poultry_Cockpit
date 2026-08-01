/**
 * PoultryCockpit - Chapter 22 Business Error Catalogue
 * Standardized Business Error Engine
 */

export interface BusinessErrorSpec {
  code: string;
  message: string;
  module: string;
}

export const ERROR_CODES: Record<string, BusinessErrorSpec> = {
  // Batch Centre (BAT)
  BAT_001: { code: 'BAT-001', message: 'Active batch already exists for this shed.', module: 'Batch Centre' },
  BAT_002: { code: 'BAT-002', message: 'Batch number already exists.', module: 'Batch Centre' },
  BAT_003: { code: 'BAT-003', message: 'Batch cannot be archived before settlement approval.', module: 'Batch Centre' },
  BAT_004: { code: 'BAT-004', message: 'Batch is already archived.', module: 'Batch Centre' },
  BAT_005: { code: 'BAT-005', message: 'Batch placement date cannot be in the future.', module: 'Batch Centre' },

  // Daily Log (DLG)
  DLG_001: { code: 'DLG-001', message: 'Daily Log already exists for this date.', module: 'Daily Log' },
  DLG_002: { code: 'DLG-002', message: 'Invalid mortality value.', module: 'Daily Log' },
  DLG_003: { code: 'DLG-003', message: 'Feed quantity cannot be negative.', module: 'Daily Log' },
  DLG_004: { code: 'DLG-004', message: 'Water quantity cannot be negative.', module: 'Daily Log' },
  DLG_005: { code: 'DLG-005', message: 'Mortality and culls cannot exceed current live birds in house.', module: 'Daily Log' },

  // Liftings (LFT)
  LFT_001: { code: 'LFT-001', message: 'Lifting date is invalid.', module: 'Liftings' },
  LFT_002: { code: 'LFT-002', message: 'Lifted bird count exceeds live birds in house.', module: 'Liftings' },
  LFT_003: { code: 'LFT-003', message: 'Total weight is invalid.', module: 'Liftings' },

  // Financial Ledger (FIN)
  FIN_001: { code: 'FIN-001', message: 'Invalid transaction amount.', module: 'Financial Ledger' },
  FIN_002: { code: 'FIN-002', message: 'Transaction category is required.', module: 'Financial Ledger' },

  // Settlement (SET)
  SET_001: { code: 'SET-001', message: 'Settlement cannot be generated until all birds are lifted.', module: 'Settlement' },
  SET_002: { code: 'SET-002', message: 'Settlement is already approved.', module: 'Settlement' },

  // Permissions (PER)
  PER_001: { code: 'PER-001', message: 'You do not have permission to perform this action.', module: 'Permissions' },

  // Business Engine (ENG)
  ENG_001: { code: 'ENG-001', message: 'Calculation interface execution error.', module: 'Business Engine' },

  // System (SYS)
  SYS_001: { code: 'SYS-001', message: 'Unexpected system error occurred.', module: 'System' },
};

export class BusinessEngineException extends Error {
  public readonly code: string;
  public readonly module: string;
  public readonly details?: string;

  constructor(errorSpec: BusinessErrorSpec, details?: string) {
    super(errorSpec.message);
    this.name = 'BusinessEngineException';
    this.code = errorSpec.code;
    this.module = errorSpec.module;
    this.details = details;
  }
}
