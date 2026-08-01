'use client';

import React from 'react';
import { BatchModule } from '../../components/batches/BatchModule';
import { useApp } from '../../context/AppContext';

export default function BatchCentrePage() {
  const {
    batches,
    sheds,
    dailyLogs,
    liftings,
    financials,
    selectedFarmId,
    userRole,
    userId,
    handleBatchCreated,
    handleBatchUpdated,
    handleBatchArchived,
    handleDailyLogSaved,
    handleLiftingSaved,
    handleFinancialSaved,
  } = useApp();

  return (
    <BatchModule
      batches={batches}
      sheds={sheds}
      dailyLogs={dailyLogs}
      liftings={liftings}
      financials={financials}
      farmId={selectedFarmId}
      userRole={userRole}
      userId={userId}
      onBatchCreated={handleBatchCreated}
      onBatchUpdated={handleBatchUpdated}
      onBatchArchived={handleBatchArchived}
      onDailyLogSaved={handleDailyLogSaved}
      onLiftingSaved={handleLiftingSaved}
      onFinancialSaved={handleFinancialSaved}
    />
  );
}
