'use client';

import React, { useState } from 'react';
import { DailyLogModule } from '../../components/daily-log/DailyLogModule';
import { LiftingModule } from '../../components/liftings/LiftingModule';
import { useApp } from '../../context/AppContext';
import { ClipboardList, Truck } from 'lucide-react';

export default function OperationsPage() {
  const [activeSubTab, setActiveSubTab] = useState<'daily-log' | 'liftings'>('daily-log');
  const {
    activeBatch,
    dailyLogs,
    liftings,
    userRole,
    userId,
    handleDailyLogSaved,
    handleLiftingSaved,
  } = useApp();

  return (
    <div className="space-y-6">
      {/* Sub Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('daily-log')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'daily-log'
              ? 'bg-[#3b562b] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Daily Log Operations</span>
        </button>

        <button
          onClick={() => setActiveSubTab('liftings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'liftings'
              ? 'bg-[#3b562b] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Bird Liftings & Sales</span>
        </button>
      </div>

      {/* Module Content */}
      {activeSubTab === 'daily-log' ? (
        <DailyLogModule
          activeBatch={activeBatch}
          dailyLogs={dailyLogs}
          userRole={userRole}
          userId={userId}
          onLogSaved={handleDailyLogSaved}
        />
      ) : (
        <LiftingModule
          activeBatch={activeBatch}
          liftings={liftings}
          userRole={userRole}
          userId={userId}
          onLiftingSaved={handleLiftingSaved}
        />
      )}
    </div>
  );
}
