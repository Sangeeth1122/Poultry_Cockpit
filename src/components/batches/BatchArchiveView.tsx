'use client';

import React, { useState } from 'react';
import {
  Archive,
  Search,
  Download,
  Filter,
  Eye,
  MoreVertical,
  Info,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { BatchRecord } from '../../types';

interface BatchArchiveViewProps {
  batches: BatchRecord[];
  onViewBatchDetails: (batchId: string) => void;
}

export function BatchArchiveView({ batches, onViewBatchDetails }: BatchArchiveViewProps) {
  const [activeFilterTab, setActiveFilterTab] = useState<'All' | 'Completed' | 'Closed'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [flockTypeFilter, setFlockTypeFilter] = useState('All');

  const archivedBatches = batches.filter((b) => b.status === 'Archived' || b.status === 'Completed');

  const filtered = archivedBatches.filter((b) => {
    const matchesSearch =
      b.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.notes && b.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCompany = companyFilter === 'All' || b.company_name === companyFilter;
    const matchesFlock = flockTypeFilter === 'All' || b.breed === flockTypeFilter;

    if (activeFilterTab === 'Completed') return matchesSearch && matchesCompany && matchesFlock && b.status === 'Completed';
    if (activeFilterTab === 'Closed') return matchesSearch && matchesCompany && matchesFlock && b.status === 'Archived';
    return matchesSearch && matchesCompany && matchesFlock;
  });

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Banner (Exact Stitch UI Design) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Archive className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">8. Archive</h1>
          </div>
          <p className="text-xs text-slate-500">
            View and manage completed batches. Archived batches are read-only and historical records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Export Archive</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="bg-white border border-slate-200/80 p-2 rounded-2xl shadow-2xs flex items-center gap-2">
        {(['All', 'Completed', 'Closed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilterTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeFilterTab === tab
                ? 'bg-[#3b562b] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'All'
              ? 'All Archived Batches'
              : tab === 'Completed'
              ? 'Completed'
              : 'Closed (With Outstanding)'}
          </button>
        ))}
      </div>

      {/* Main Grid: Table Left + Summary Sidebar Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Container (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter row */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by batch ID or notes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b562b]"
              />
            </div>

            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="All">All Companies</option>
              <option value="Suguna Foods Ltd">Suguna Foods Ltd</option>
              <option value="Venky's India">Venky's India</option>
            </select>
          </div>

          {/* Archived Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Batch Details</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Flock Type</th>
                    <th className="px-4 py-3">Placed Date</th>
                    <th className="px-4 py-3 text-right">Days In House</th>
                    <th className="px-4 py-3 text-right">Lifted Weight</th>
                    <th className="px-4 py-3 text-right">GC (₹/kg)</th>
                    <th className="px-4 py-3 text-right">Settlement (₹)</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div
                          onClick={() => onViewBatchDetails(b.id)}
                          className="font-mono font-bold text-[#3b562b] hover:underline cursor-pointer"
                        >
                          {b.batch_number}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {b.notes || 'Good uniformity'}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900">{b.company_name}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{b.breed}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{b.placement_date}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">{b.target_days_in_house || 42}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-900 font-bold">
                        {(b.total_weight_lifted || 8302).toLocaleString()} kg
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-800">₹ {b.gc_rate || 9.25}</td>
                      <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-700">
                        ₹ {(b.settlement_amount || 468750).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase">
                          Settled
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onViewBatchDetails(b.id)}
                          className="p-1.5 hover:bg-slate-100 text-[#3b562b] rounded-lg transition cursor-pointer"
                          title="View Archive"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Panel */}
        <div className="space-y-6">
          {/* Archive Summary Box */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Info className="w-4 h-4 text-[#3b562b]" />
              <span>Archive Summary</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Archived Batches:</span>
                <span className="font-mono font-bold text-slate-900">{archivedBatches.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Settled:</span>
                <span className="font-mono font-bold text-emerald-700">{archivedBatches.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Weight Lifted:</span>
                <span className="font-mono font-bold text-slate-900">43,620 kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Settlement Amount:</span>
                <span className="font-mono font-extrabold text-[#3b562b]">₹ 4,44,940.00</span>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <TrendingUp className="w-4 h-4 text-[#3b562b]" />
              <span>Performance Insights</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Avg Final PC (Our):</span>
                <span className="font-mono font-bold text-slate-900">₹ 94.01 /kg</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Avg GC (Our):</span>
                <span className="font-mono font-bold text-slate-900">₹ 8.78 /kg</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Best PC (Our):</span>
                <span className="font-mono font-bold text-emerald-700">₹ 92.10 /kg (GVF-S01-24003)</span>
              </div>
            </div>
          </div>

          {/* About Archive Rules */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900">About Archive</h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
              <li>Archived batches are strictly read-only historical records.</li>
              <li>Financials and settlements cannot be modified once archived.</li>
              <li>Batch Intelligence relies on archive data for long-term trends.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Info Banner */}
      <div className="bg-[#e3ebd8]/50 border border-[#3b562b]/20 rounded-2xl p-4 text-xs text-[#3b562b] flex items-center gap-2">
        <Info className="w-4 h-4 shrink-0" />
        <span>
          Batches are automatically moved to Archive after they are Closed and all liftings and settlements are completed.
        </span>
      </div>
    </div>
  );
}
