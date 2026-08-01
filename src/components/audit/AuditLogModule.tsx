'use client';

import React from 'react';
import { ShieldCheck, History } from 'lucide-react';
import { AuditLogRecord } from '../../types';

interface AuditLogModuleProps {
  auditLogs: AuditLogRecord[];
}

export function AuditLogModule({ auditLogs }: AuditLogModuleProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Immutable Audit Trail Logs</h2>
          </div>
          <p className="text-xs text-slate-400">
            Audit Engine events captured automatically for every business engine action.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
          Recorded Events: <strong className="text-emerald-400 font-mono">{auditLogs.length}</strong>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">System Audit Stream</h3>
          <span className="text-xs text-slate-400 font-mono">Module 1 Engine Bound</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <History className="w-6 h-6 text-slate-600" />
            <span>No audit events logged in current session. Perform an action to emit audit logs.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Event ID</th>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Action Performed</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Role / User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">{log.event_id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{log.event_type}</td>
                    <td className="px-4 py-3 text-slate-300">{log.action_performed}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {log.source_module}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">
                      {log.user_role} ({log.user_id})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
