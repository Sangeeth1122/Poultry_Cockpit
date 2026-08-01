'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardModule } from '../../components/dashboard/DashboardModule';
import { useApp } from '../../context/AppContext';

export default function DashboardPage() {
  const router = useRouter();
  const { farms, sheds, batches, activeBatch, dailyLogs, setIsDailyLogModalOpen } = useApp();

  const handleNavigateTab = (tabId: string) => {
    if (tabId === 'batches') router.push('/batch-centre');
    else if (tabId === 'operations' || tabId === 'daily-log') router.push('/operations');
    else if (tabId === 'financials') router.push('/intelligence?tab=financials');
    else if (tabId === 'settlement') router.push('/intelligence?tab=settlement');
    else if (tabId === 'settings') router.push('/settings');
    else router.push('/dashboard');
  };

  return (
    <DashboardModule
      farms={farms}
      sheds={sheds}
      batches={batches}
      activeBatch={activeBatch}
      dailyLogs={dailyLogs}
      onNavigateTab={handleNavigateTab}
      onOpenDailyLogModal={() => setIsDailyLogModalOpen(true)}
    />
  );
}
