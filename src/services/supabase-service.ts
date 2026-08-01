/**
 * PoultryCockpit - Supabase Data Repository Service
 * Real PostgreSQL Database Binding via Supabase Client
 */

import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase/client';
import {
  FarmRecord,
  ShedRecord,
  BatchRecord,
  DailyLogRecord,
  LiftingRecord,
  FinancialTransactionRecord,
  SettlementRecord,
  AuditLogRecord,
  UserRole,
} from '../types';
import { BusinessEngine } from '../engine';

export const SupabaseDataService = {
  // Check if Supabase env credentials are provided
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  // FARMS
  async getFarms(): Promise<FarmRecord[]> {
    if (!this.isConfigured()) return [];
    const client = getSupabaseClient();
    const { data, error } = await client.from('farms').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching farms:', error.message);
      return [];
    }
    return (data as FarmRecord[]) || [];
  },

  async createFarm(farm: Omit<FarmRecord, 'id' | 'created_at' | 'updated_at'>, userRole: UserRole, userId: string): Promise<FarmRecord | null> {
    BusinessEngine.assertPermission(userRole, 'MANAGE_FARM');
    if (!this.isConfigured()) return null;

    const client = getSupabaseClient();
    const { data, error } = await client.from('farms').insert([farm]).select().single();
    if (error) throw new Error(`Failed to create farm: ${error.message}`);

    const newFarm = data as FarmRecord;
    // Log audit
    const auditRecord = BusinessEngine.createAuditLog({
      eventId: 'AUD-101',
      eventType: 'FARM_CREATED',
      entity: 'Farm',
      entityId: newFarm.id,
      actionPerformed: `Farm '${newFarm.name}' created.`,
      userId,
      userRole,
      sourceModule: 'Farm Settings',
    });
    await this.saveAuditLog(auditRecord);

    return newFarm;
  },

  // SHEDS
  async getSheds(farmId?: string): Promise<ShedRecord[]> {
    if (!this.isConfigured()) return [];
    const client = getSupabaseClient();
    let query = client.from('sheds').select('*').order('name', { ascending: true });
    if (farmId) query = query.eq('farm_id', farmId);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching sheds:', error.message);
      return [];
    }
    return (data as ShedRecord[]) || [];
  },

  async createShed(shed: Omit<ShedRecord, 'id' | 'created_at' | 'updated_at'>, userRole: UserRole, userId: string): Promise<ShedRecord | null> {
    BusinessEngine.assertPermission(userRole, 'MANAGE_FARM');
    if (!this.isConfigured()) return null;

    const client = getSupabaseClient();
    const { data, error } = await client.from('sheds').insert([shed]).select().single();
    if (error) throw new Error(`Failed to create shed: ${error.message}`);

    const newShed = data as ShedRecord;
    const auditRecord = BusinessEngine.createAuditLog({
      eventId: 'AUD-102',
      eventType: 'SHED_CREATED',
      entity: 'Shed',
      entityId: newShed.id,
      actionPerformed: `Shed '${newShed.name}' created with capacity ${newShed.capacity}.`,
      userId,
      userRole,
      sourceModule: 'Farm Settings',
    });
    await this.saveAuditLog(auditRecord);

    return newShed;
  },

  // BATCHES
  async getBatches(farmId?: string): Promise<BatchRecord[]> {
    if (!this.isConfigured()) return [];
    const client = getSupabaseClient();
    let query = client.from('batches').select('*').order('created_at', { ascending: false });
    if (farmId) query = query.eq('farm_id', farmId);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching batches:', error.message);
      return [];
    }
    return (data as BatchRecord[]) || [];
  },

  async createBatch(
    batch: Omit<BatchRecord, 'id' | 'created_at' | 'updated_at'>,
    userRole: UserRole,
    userId: string
  ): Promise<BatchRecord | null> {
    const existingBatches = await this.getBatches(batch.farm_id);
    const activeInShed = existingBatches.some(
      (b) => b.shed_id === batch.shed_id && (b.status === 'Running' || b.status === 'Ready')
    );

    BusinessEngine.validateBatchCreation(userRole, activeInShed, batch.placement_date);

    if (!this.isConfigured()) return null;

    const client = getSupabaseClient();
    const { data, error } = await client.from('batches').insert([batch]).select().single();
    if (error) throw new Error(`Failed to create batch: ${error.message}`);

    const newBatch = data as BatchRecord;

    // Update Shed Status
    await client.from('sheds').update({ status: 'In Use' }).eq('id', batch.shed_id);

    const auditRecord = BusinessEngine.createAuditLog({
      eventId: 'AUD-103',
      eventType: 'BATCH_CREATED',
      entity: 'Batch',
      entityId: newBatch.id,
      actionPerformed: `Batch '${newBatch.batch_number}' placed with ${newBatch.chicks_placed} chicks.`,
      userId,
      userRole,
      sourceModule: 'Batch Centre',
    });
    await this.saveAuditLog(auditRecord);

    return newBatch;
  },

  // DAILY LOGS
  async getDailyLogs(batchId: string): Promise<DailyLogRecord[]> {
    if (!this.isConfigured()) return [];
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('daily_logs')
      .select('*')
      .eq('batch_id', batchId)
      .order('day_in_house', { ascending: true });

    if (error) {
      console.error('Error fetching daily logs:', error.message);
      return [];
    }
    return (data as DailyLogRecord[]) || [];
  },

  async createDailyLog(
    log: Omit<DailyLogRecord, 'id' | 'created_at' | 'updated_at'>,
    liveBirdsInHouse: number,
    userRole: UserRole,
    userId: string
  ): Promise<DailyLogRecord | null> {
    BusinessEngine.validateDailyLogEntry(
      userRole,
      log.feed_consumed_kg,
      log.water_consumed_liters,
      log.mortality_count,
      liveBirdsInHouse
    );

    if (!this.isConfigured()) return null;

    const client = getSupabaseClient();
    const { data, error } = await client.from('daily_logs').insert([log]).select().single();
    if (error) throw new Error(`Failed to save daily log: ${error.message}`);

    const newLog = data as DailyLogRecord;
    const auditRecord = BusinessEngine.createAuditLog({
      eventId: 'AUD-104',
      eventType: 'DAILY_LOG_SAVED',
      entity: 'DailyLog',
      entityId: newLog.id,
      actionPerformed: `Daily Log Day ${newLog.day_in_house} saved: Feed ${newLog.feed_consumed_kg}kg, Mortality ${newLog.mortality_count}.`,
      userId,
      userRole,
      sourceModule: 'Operations',
    });
    await this.saveAuditLog(auditRecord);

    return newLog;
  },

  // LIFTINGS
  async getLiftings(batchId: string): Promise<LiftingRecord[]> {
    if (!this.isConfigured()) return [];
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('liftings')
      .select('*')
      .eq('batch_id', batchId)
      .order('lifting_no', { ascending: true });

    if (error) {
      console.error('Error fetching liftings:', error.message);
      return [];
    }
    return (data as LiftingRecord[]) || [];
  },

  async createLifting(
    lifting: Omit<LiftingRecord, 'id' | 'created_at' | 'updated_at' | 'avg_weight_kg'>,
    userRole: UserRole,
    userId: string
  ): Promise<LiftingRecord | null> {
    BusinessEngine.assertPermission(userRole, 'RECORD_LIFTING');
    if (!this.isConfigured()) return null;

    const client = getSupabaseClient();
    const { data, error } = await client.from('liftings').insert([lifting]).select().single();
    if (error) throw new Error(`Failed to record lifting: ${error.message}`);

    const newLifting = data as LiftingRecord;
    const auditRecord = BusinessEngine.createAuditLog({
      eventId: 'AUD-105',
      eventType: 'LIFTING_RECORDED',
      entity: 'Lifting',
      entityId: newLifting.id,
      actionPerformed: `Lifting #${newLifting.lifting_no} recorded: ${newLifting.birds_lifted} birds (${newLifting.total_weight_kg}kg).`,
      userId,
      userRole,
      sourceModule: 'Liftings',
    });
    await this.saveAuditLog(auditRecord);

    return newLifting;
  },

  // FINANCIALS
  async getFinancials(batchId: string): Promise<FinancialTransactionRecord[]> {
    if (!this.isConfigured()) return [];
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('financial_transactions')
      .select('*')
      .eq('batch_id', batchId)
      .order('tx_date', { ascending: false });

    if (error) {
      console.error('Error fetching financials:', error.message);
      return [];
    }
    return (data as FinancialTransactionRecord[]) || [];
  },

  async createFinancialTransaction(
    tx: Omit<FinancialTransactionRecord, 'id' | 'created_at' | 'updated_at'>,
    userRole: UserRole,
    userId: string
  ): Promise<FinancialTransactionRecord | null> {
    BusinessEngine.assertPermission(userRole, 'MANAGE_FINANCIALS');
    if (!this.isConfigured()) return null;

    const client = getSupabaseClient();
    const { data, error } = await client.from('financial_transactions').insert([tx]).select().single();
    if (error) throw new Error(`Failed to record transaction: ${error.message}`);

    const newTx = data as FinancialTransactionRecord;
    const auditRecord = BusinessEngine.createAuditLog({
      eventId: 'AUD-106',
      eventType: 'FINANCIAL_TRANSACTION_RECORDED',
      entity: 'FinancialTransaction',
      entityId: newTx.id,
      actionPerformed: `${newTx.tx_type} transaction recorded: ₹${newTx.amount} [${newTx.category}].`,
      userId,
      userRole,
      sourceModule: 'Financial Ledger',
    });
    await this.saveAuditLog(auditRecord);

    return newTx;
  },

  // AUDIT LOGS
  async getAuditLogs(): Promise<AuditLogRecord[]> {
    if (!this.isConfigured()) return [];
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching audit logs:', error.message);
      return [];
    }
    return (data as AuditLogRecord[]) || [];
  },

  async saveAuditLog(audit: AuditLogRecord): Promise<void> {
    if (!this.isConfigured()) return;
    const client = getSupabaseClient();
    const { error } = await client.from('audit_logs').insert([audit]);
    if (error) {
      console.error('Error saving audit log to Supabase:', error.message);
    }
  },
};
