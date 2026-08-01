'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseDataService } from '../services/supabase-service';
import {
  SEED_FARMS,
  SEED_SHEDS,
  SEED_BATCHES,
  SEED_DAILY_LOGS,
  SEED_LIFTINGS,
  SEED_FINANCIALS,
  SEED_AUDIT_LOGS,
} from '../services/seed-data';
import {
  FarmRecord,
  ShedRecord,
  BatchRecord,
  DailyLogRecord,
  LiftingRecord,
  FinancialTransactionRecord,
  AuditLogRecord,
  UserRole,
} from '../types';
import { BusinessEngine } from '../engine';

interface AppContextType {
  farms: FarmRecord[];
  sheds: ShedRecord[];
  batches: BatchRecord[];
  dailyLogs: DailyLogRecord[];
  liftings: LiftingRecord[];
  financials: FinancialTransactionRecord[];
  auditLogs: AuditLogRecord[];
  isSupabaseConnected: boolean;
  userRole: UserRole;
  userId: string;
  selectedFarmId: string;
  selectedShedId: string;
  activeBatch: BatchRecord | null;

  // Modal State for Quick Action "Enter Daily Log"
  isDailyLogModalOpen: boolean;
  modalFeedKg: number;
  modalWaterL: number;
  modalMortality: number;
  modalAvgWeight: number;
  modalError: string | null;

  // Actions
  setUserRole: (role: UserRole) => void;
  setSelectedFarmId: (id: string) => void;
  setSelectedShedId: (id: string) => void;
  setIsDailyLogModalOpen: (open: boolean) => void;
  setModalFeedKg: (val: number) => void;
  setModalWaterL: (val: number) => void;
  setModalMortality: (val: number) => void;
  setModalAvgWeight: (val: number) => void;
  setModalError: (err: string | null) => void;

  handleBatchCreated: (batch: Omit<BatchRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  handleBatchUpdated: (updated: BatchRecord) => Promise<void>;
  handleBatchArchived: (batchId: string) => Promise<void>;
  handleDailyLogSaved: (log: Omit<DailyLogRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  handleLiftingSaved: (lifting: Omit<LiftingRecord, 'id' | 'created_at' | 'updated_at' | 'avg_weight_kg'>) => Promise<void>;
  handleFinancialSaved: (tx: Omit<FinancialTransactionRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  handleFarmCreated: (farm: Omit<FarmRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  handleShedCreated: (shed: Omit<ShedRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  handleModalSaveLog: (e: React.FormEvent) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('Owner');
  const [userId] = useState<string>('usr-owner-001');

  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-001');
  const [selectedShedId, setSelectedShedId] = useState<string>('shed-001');

  // Modal State
  const [isDailyLogModalOpen, setIsDailyLogModalOpen] = useState(false);
  const [modalFeedKg, setModalFeedKg] = useState(365);
  const [modalWaterL, setModalWaterL] = useState(1250);
  const [modalMortality, setModalMortality] = useState(3);
  const [modalAvgWeight, setModalAvgWeight] = useState(480);
  const [modalError, setModalError] = useState<string | null>(null);

  // Records
  const [farms, setFarms] = useState<FarmRecord[]>(SEED_FARMS);
  const [sheds, setSheds] = useState<ShedRecord[]>(SEED_SHEDS);
  const [batches, setBatches] = useState<BatchRecord[]>(SEED_BATCHES);
  const [dailyLogs, setDailyLogs] = useState<DailyLogRecord[]>(SEED_DAILY_LOGS);
  const [liftings, setLiftings] = useState<LiftingRecord[]>(SEED_LIFTINGS);
  const [financials, setFinancials] = useState<FinancialTransactionRecord[]>(SEED_FINANCIALS);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(SEED_AUDIT_LOGS);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (SupabaseDataService.isConfigured()) {
        setIsSupabaseConnected(true);
        try {
          const loadedFarms = await SupabaseDataService.getFarms();
          if (loadedFarms.length > 0) setFarms(loadedFarms);

          const loadedSheds = await SupabaseDataService.getSheds();
          if (loadedSheds.length > 0) setSheds(loadedSheds);

          const loadedBatches = await SupabaseDataService.getBatches();
          if (loadedBatches.length > 0) setBatches(loadedBatches);

          const loadedAudits = await SupabaseDataService.getAuditLogs();
          if (loadedAudits.length > 0) setAuditLogs(loadedAudits);
        } catch (e) {
          console.error('Error loading repository data:', e);
        }
      }
    }
    loadData();
  }, []);

  const activeBatch = batches.find((b) => b.status === 'Running' || b.status === 'Ready') || batches[0] || null;

  const handleBatchCreated = async (batch: Omit<BatchRecord, 'id' | 'created_at' | 'updated_at'>) => {
    let created: BatchRecord | null = null;
    if (isSupabaseConnected) {
      created = await SupabaseDataService.createBatch(batch, userRole, userId);
    }
    if (!created) {
      created = {
        ...batch,
        id: 'batch-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    setBatches((prev) => [created!, ...prev]);
  };

  const handleBatchUpdated = async (updated: BatchRecord) => {
    setBatches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleBatchArchived = async (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: 'Archived' as const } : b))
    );
  };

  const handleDailyLogSaved = async (log: Omit<DailyLogRecord, 'id' | 'created_at' | 'updated_at'>) => {
    let created: DailyLogRecord | null = null;
    if (isSupabaseConnected && activeBatch) {
      created = await SupabaseDataService.createDailyLog(log, activeBatch.chicks_placed, userRole, userId);
    }
    if (!created) {
      created = {
        ...log,
        id: 'log-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    setDailyLogs((prev) => [...prev, created!]);
  };

  const handleModalSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!activeBatch) return;

    try {
      BusinessEngine.validateDailyLogEntry(
        userRole,
        modalFeedKg,
        modalWaterL,
        modalMortality,
        activeBatch.chicks_placed
      );

      await handleDailyLogSaved({
        batch_id: activeBatch.id,
        log_date: new Date().toISOString().split('T')[0],
        day_in_house: 18,
        status: 'Completed',
        feed_consumed_kg: modalFeedKg,
        water_consumed_liters: modalWaterL,
        mortality_count: modalMortality,
        culls_count: 0,
        avg_body_weight_grams: modalAvgWeight,
        remarks: 'Entered via Command Center Quick Action',
        created_by: userId,
        updated_by: userId,
      });

      setIsDailyLogModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setModalError(err.message);
      } else {
        setModalError('Validation failed.');
      }
    }
  };

  const handleLiftingSaved = async (lifting: Omit<LiftingRecord, 'id' | 'created_at' | 'updated_at' | 'avg_weight_kg'>) => {
    let created: LiftingRecord | null = null;
    if (isSupabaseConnected) {
      created = await SupabaseDataService.createLifting(lifting, userRole, userId);
    }
    if (!created) {
      created = {
        ...lifting,
        avg_weight_kg: lifting.birds_lifted > 0 ? lifting.total_weight_kg / lifting.birds_lifted : 0,
        id: 'lift-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    setLiftings((prev) => [...prev, created!]);
  };

  const handleFinancialSaved = async (tx: Omit<FinancialTransactionRecord, 'id' | 'created_at' | 'updated_at'>) => {
    let created: FinancialTransactionRecord | null = null;
    if (isSupabaseConnected) {
      created = await SupabaseDataService.createFinancialTransaction(tx, userRole, userId);
    }
    if (!created) {
      created = {
        ...tx,
        id: 'tx-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    setFinancials((prev) => [created!, ...prev]);
  };

  const handleFarmCreated = async (farm: Omit<FarmRecord, 'id' | 'created_at' | 'updated_at'>) => {
    let created: FarmRecord | null = null;
    if (isSupabaseConnected) {
      created = await SupabaseDataService.createFarm(farm, userRole, userId);
    }
    if (!created) {
      created = {
        ...farm,
        id: 'farm-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    setFarms((prev) => [...prev, created!]);
  };

  const handleShedCreated = async (shed: Omit<ShedRecord, 'id' | 'created_at' | 'updated_at'>) => {
    let created: ShedRecord | null = null;
    if (isSupabaseConnected) {
      created = await SupabaseDataService.createShed(shed, userRole, userId);
    }
    if (!created) {
      created = {
        ...shed,
        id: 'shed-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    setSheds((prev) => [...prev, created!]);
  };

  return (
    <AppContext.Provider
      value={{
        farms,
        sheds,
        batches,
        dailyLogs,
        liftings,
        financials,
        auditLogs,
        isSupabaseConnected,
        userRole,
        userId,
        selectedFarmId,
        selectedShedId,
        activeBatch,
        isDailyLogModalOpen,
        modalFeedKg,
        modalWaterL,
        modalMortality,
        modalAvgWeight,
        modalError,
        setUserRole,
        setSelectedFarmId,
        setSelectedShedId,
        setIsDailyLogModalOpen,
        setModalFeedKg,
        setModalWaterL,
        setModalMortality,
        setModalAvgWeight,
        setModalError,
        handleBatchCreated,
        handleBatchUpdated,
        handleBatchArchived,
        handleDailyLogSaved,
        handleLiftingSaved,
        handleFinancialSaved,
        handleFarmCreated,
        handleShedCreated,
        handleModalSaveLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
