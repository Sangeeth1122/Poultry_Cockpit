'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FinancialModule } from '../../components/financials/FinancialModule';
import { SettlementModule } from '../../components/settlement/SettlementModule';
import { AuditLogModule } from '../../components/audit/AuditLogModule';
import { useApp } from '../../context/AppContext';
import { DollarSign, FileCheck, ShieldAlert } from 'lucide-react';

function IntelligenceContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeSubTab, setActiveSubTab] = useState<'financials' | 'settlement' | 'audit'>('financials');

  useEffect(() => {
    if (tabParam === 'settlement') setActiveSubTab('settlement');
    else if (tabParam === 'audit') setActiveSubTab('audit');
    else if (tabParam === 'financials') setActiveSubTab('financials');
  }, [tabParam]);

  const {
    activeBatch,
    financials,
    auditLogs,
    userRole,
    userId,
    handleFinancialSaved,
  } = useApp();

  return (
    <div className="space-y-6">
      {/* Sub Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('financials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'financials'
              ? 'bg-[#3b562b] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Financial Ledger</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settlement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'settlement'
              ? 'bg-[#3b562b] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Batch Settlement</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'audit'
              ? 'bg-[#3b562b] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Governance & Audit Logs</span>
        </button>
      </div>

      {/* Module Content */}
      {activeSubTab === 'financials' && (
        <FinancialModule
          activeBatch={activeBatch}
          financials={financials}
          userRole={userRole}
          userId={userId}
          onFinancialSaved={handleFinancialSaved}
        />
      )}

      {activeSubTab === 'settlement' && (
        <SettlementModule activeBatch={activeBatch} userRole={userRole} />
      )}

      {activeSubTab === 'audit' && (
        <AuditLogModule auditLogs={auditLogs} />
      )}
    </div>
  );
}

export default function IntelligencePage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs font-medium text-slate-500">Loading intelligence modules...</div>}>
      <IntelligenceContent />
    </Suspense>
  );
}
