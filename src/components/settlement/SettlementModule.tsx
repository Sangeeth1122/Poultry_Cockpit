'use client';

import React, { useState } from 'react';
import { FileCheck2, ShieldCheck, AlertCircle } from 'lucide-react';
import { BatchRecord, UserRole } from '../../types';
import { BusinessEngine } from '../../engine';

interface SettlementModuleProps {
  activeBatch: BatchRecord | null;
  userRole: UserRole;
}

export function SettlementModule({ activeBatch, userRole }: SettlementModuleProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  const handleApprove = () => {
    setErrorMsg(null);
    try {
      BusinessEngine.assertPermission(userRole, 'APPROVE_SETTLEMENT');
      setIsApproved(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Settlement approval permission check failed.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Batch Settlement Contract Boundary</h2>
          </div>
          <p className="text-xs text-slate-400">
            Final settlement approvals and contract closure boundaries. Formulative settlement calculations are deferred to Module 2.
          </p>
        </div>

        {activeBatch && (
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
            Batch: <strong className="text-emerald-400 font-mono">{activeBatch.batch_number}</strong>
          </div>
        )}
      </div>

      {!activeBatch ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
          Please select a batch contract to inspect settlement state.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Contract Settlement State</h3>
              <p className="text-xs text-slate-400 mt-0.5">Integrator Company: {activeBatch.company_name}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isApproved
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isApproved ? 'Approved Contract' : 'Pending Approval'}
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-400">
            <div className="font-semibold text-slate-200">Module 1 Business Engine Contract Note</div>
            <p>
              The Settlement Engine interface is bound via <code className="text-emerald-400">BusinessEngine.calculations.calculateSettlementSummary()</code>. Actual financial adjustments, GC rates, and net settlement calculation formulas will be introduced in Module 2.
            </p>
          </div>

          {!isApproved && (
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Assert Settlement Approval Permission</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
