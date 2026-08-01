'use client';

import React, { useState } from 'react';
import { BatchRecord, ShedRecord, DailyLogRecord, LiftingRecord, FinancialTransactionRecord, UserRole } from '../../types';
import { BatchList } from './BatchList';
import { BatchWizard } from './BatchWizard';
import { BatchDetailView } from './BatchDetailView';
import { BatchArchiveView } from './BatchArchiveView';
import { EditBatchModal } from './EditBatchModal';
import { BusinessEngine } from '../../engine';

interface BatchModuleProps {
  batches: BatchRecord[];
  sheds: ShedRecord[];
  dailyLogs?: DailyLogRecord[];
  liftings?: LiftingRecord[];
  financials?: FinancialTransactionRecord[];
  farmId: string;
  userRole: UserRole;
  userId: string;
  onBatchCreated: (batch: Omit<BatchRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onBatchUpdated?: (updated: BatchRecord) => Promise<void>;
  onBatchArchived?: (batchId: string) => Promise<void>;
  onDailyLogSaved?: (log: Omit<DailyLogRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onLiftingSaved?: (lifting: Omit<LiftingRecord, 'id' | 'created_at' | 'updated_at' | 'avg_weight_kg'>) => Promise<void>;
  onFinancialSaved?: (tx: Omit<FinancialTransactionRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function BatchModule({
  batches,
  sheds,
  dailyLogs = [],
  liftings = [],
  financials = [],
  farmId,
  userRole,
  userId,
  onBatchCreated,
  onBatchUpdated,
  onBatchArchived,
  onDailyLogSaved,
  onLiftingSaved,
  onFinancialSaved,
}: BatchModuleProps) {
  const [viewMode, setViewMode] = useState<'LIST' | 'NEW_WIZARD' | 'DETAIL' | 'ARCHIVE'>('LIST');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [editingBatch, setEditingBatch] = useState<BatchRecord | null>(null);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0] || null;

  const handleViewDetails = (batchId: string) => {
    setSelectedBatchId(batchId);
    setViewMode('DETAIL');
  };

  const handleEditBatch = (batch: BatchRecord) => {
    setEditingBatch(batch);
  };

  const handleSaveEdit = async (updated: BatchRecord) => {
    if (onBatchUpdated) {
      await onBatchUpdated(updated);
    }
    setEditingBatch(null);
  };

  const handleArchiveBatch = async (batch: BatchRecord) => {
    try {
      BusinessEngine.validateBatchArchival(userRole, batch.status, true);
      if (onBatchArchived) {
        await onBatchArchived(batch.id);
      }
      setViewMode('ARCHIVE');
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Header Bar for Batch Centre */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setViewMode('LIST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              viewMode === 'LIST'
                ? 'bg-[#3b562b] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <span>📋 All Batches</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {batches.length}
            </span>
          </button>

          <button
            onClick={() => setViewMode('NEW_WIZARD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              viewMode === 'NEW_WIZARD'
                ? 'bg-[#3b562b] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <span>➕ New Batch Setup</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              Wizard
            </span>
          </button>

          {selectedBatch && (
            <button
              onClick={() => setViewMode('DETAIL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                viewMode === 'DETAIL'
                  ? 'bg-[#3b562b] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              <span>📊 Batch Detail & Operations</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                #{selectedBatch.batch_number}
              </span>
            </button>
          )}

          <button
            onClick={() => setViewMode('ARCHIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              viewMode === 'ARCHIVE'
                ? 'bg-[#3b562b] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <span>📦 Batch Archive</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {batches.filter((b) => b.status === 'Archived').length}
            </span>
          </button>
        </div>

        {viewMode === 'DETAIL' && selectedBatch && (
          <div className="text-xs text-slate-500 font-mono flex items-center gap-2 border-l border-slate-200 pl-3">
            <span>Shed: <strong className="text-slate-800">{sheds.find(s => s.id === selectedBatch.shed_id)?.name || 'Shed 01'}</strong></span>
            <span>•</span>
            <span>Breed: <strong className="text-slate-800">{selectedBatch.breed}</strong></span>
          </div>
        )}
      </div>

      {viewMode === 'LIST' && (
        <BatchList
          batches={batches}
          sheds={sheds}
          userRole={userRole}
          onNavigateToNewBatch={() => setViewMode('NEW_WIZARD')}
          onViewBatchDetails={handleViewDetails}
          onEditBatch={handleEditBatch}
          onArchiveBatch={handleArchiveBatch}
        />
      )}

      {viewMode === 'NEW_WIZARD' && (
        <BatchWizard
          sheds={sheds}
          farmId={farmId}
          userRole={userRole}
          userId={userId}
          onSaveBatch={onBatchCreated}
          onBackToList={() => setViewMode('LIST')}
          onLiftingSaved={onLiftingSaved}
          onFinancialSaved={onFinancialSaved}
        />
      )}

      {viewMode === 'DETAIL' && selectedBatch && (
        <BatchDetailView
          batch={selectedBatch}
          sheds={sheds}
          dailyLogs={dailyLogs.filter((l) => l.batch_id === selectedBatch.id)}
          liftings={liftings.filter((l) => l.batch_id === selectedBatch.id)}
          financials={financials.filter((f) => f.batch_id === selectedBatch.id)}
          userRole={userRole}
          userId={userId}
          onBackToList={() => setViewMode('LIST')}
          onEditBatch={handleEditBatch}
          onArchiveBatch={handleArchiveBatch}
          onDailyLogSaved={onDailyLogSaved}
          onLiftingSaved={onLiftingSaved}
          onFinancialSaved={onFinancialSaved}
        />
      )}

      {viewMode === 'ARCHIVE' && (
        <BatchArchiveView
          batches={batches}
          onViewBatchDetails={handleViewDetails}
        />
      )}

      {editingBatch && (
        <EditBatchModal
          batch={editingBatch}
          sheds={sheds}
          userRole={userRole}
          onSave={handleSaveEdit}
          onClose={() => setEditingBatch(null)}
        />
      )}
    </div>
  );
}
