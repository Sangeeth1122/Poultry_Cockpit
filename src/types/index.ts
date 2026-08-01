/**
 * PoultryCockpit - Strict TypeScript Domain Specifications
 * Functional Specification v1.0 & Architecture Specification Compliant
 */

export type UserRole = 'Owner' | 'Administrator' | 'Manager' | 'Accountant' | 'Viewer';

export interface UserContext {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  farmId?: string;
}

export interface FarmRecord {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2?: string | null;
  village?: string | null;
  taluk?: string | null;
  district: string;
  state: string;
  pin_code: string;
  total_land_area_acres: number;
  total_shed_area_sqft: number;
  no_of_sheds: number;
  default_shed_capacity: number;
  default_batch_duration_days: number;
  created_at: string;
  updated_at: string;
}

export type ShedStatus = 'Available' | 'In Use' | 'Maintenance';

export interface ShedRecord {
  id: string;
  farm_id: string;
  name: string;
  capacity: number;
  area_sqft: number;
  status: ShedStatus;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfileRecord {
  id: string;
  company_name: string;
  company_code: string;
  company_type: string;
  contact_person?: string | null;
  phone_number?: string | null;
  email_address?: string | null;
  office_address?: string | null;
  contract_type: string;
  settlement_days_after_lifting: number;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}

export type BatchStatus = 'Draft' | 'Ready' | 'Running' | 'Completed' | 'Archived';

export interface BatchRecord {
  id: string;
  batch_number: string;
  farm_id: string;
  shed_id: string;
  company_id?: string | null;
  company_name: string;
  batch_type: 'Broiler' | 'Breeder' | 'Layer';
  breed: string;
  placement_date: string;
  expected_lifting_date?: string | null;
  target_days_in_house: number;
  chicks_placed: number;
  chick_cost_per_bird: number;
  supplier_name?: string | null;
  formula_profile: string;
  status: BatchStatus;
  current_stage?: number;
  notes?: string | null;
  flock_type?: string | null;
  total_weight_lifted?: number | null;
  final_pc?: number | null;
  gc_rate?: number | null;
  settlement_amount?: number | null;
  settlement_status?: 'Settled' | 'Outstanding' | 'Pending' | null;
  archived_by?: string | null;
  archived_at?: string | null;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

export interface DailyLogRecord {
  id: string;
  batch_id: string;
  log_date: string;
  day_in_house: number;
  status: 'Draft' | 'Saved' | 'Completed';
  feed_consumed_kg: number;
  water_consumed_liters: number;
  mortality_count: number;
  culls_count: number;
  avg_body_weight_grams: number;
  avg_temperature_c?: number | null;
  humidity_pct?: number | null;
  remarks?: string | null;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

export interface LiftingRecord {
  id: string;
  batch_id: string;
  lifting_no: number;
  lifting_date: string;
  birds_lifted: number;
  total_weight_kg: number;
  avg_weight_kg?: number | null;
  vehicle_no?: string | null;
  buyer_name: string;
  rate_per_kg: number;
  gross_amount: number;
  net_amount: number;
  status: 'Draft' | 'Saved' | 'Completed';
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

export type FinancialType = 'Expense' | 'Income' | 'Pre-Batch Expense';

export interface FinancialTransactionRecord {
  id: string;
  batch_id: string;
  tx_date: string;
  tx_type: FinancialType;
  category: string;
  description: string;
  party_name?: string | null;
  payment_mode: 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque' | 'Credit';
  amount: number;
  paid_amount: number;
  pending_amount: number;
  status: 'Paid' | 'Received' | 'Partially Paid' | 'Pending';
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

export type SettlementStatus = 'Draft' | 'Generated' | 'Approved' | 'Reopened';

export interface SettlementRecord {
  id: string;
  batch_id: string;
  status: SettlementStatus;
  settlement_date: string;
  company_feed_rate_per_kg: number;
  company_total_feed_kg: number;
  company_total_feed_cost: number;
  company_chick_rate_per_bird: number;
  company_chicks_placed: number;
  company_total_chick_cost: number;
  company_medicine_cost: number;
  company_total_production_cost: number;
  company_production_cost_per_kg: number;
  company_gc_rate_per_kg: number;
  company_total_weight_lifted_kg: number;
  company_total_gc_amount: number;
  company_grade: string;
  total_additions: number;
  total_deductions: number;
  net_settlement_amount: number;
  approved_by?: string | null;
  approved_at?: string | null;
  reopened_by?: string | null;
  reopened_at?: string | null;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

export interface AuditLogRecord {
  id: string;
  event_id: string;
  event_type: string;
  entity: string;
  entity_id: string;
  action_performed: string;
  previous_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  user_id: string;
  user_role: UserRole;
  ip_address: string;
  source_module: string;
  timestamp: string;
}
