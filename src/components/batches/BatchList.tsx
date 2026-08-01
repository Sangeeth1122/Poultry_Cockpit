'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  RotateCcw,
  SlidersHorizontal,
  Eye,
  Edit,
  Archive,
  MoreVertical,
  CheckCircle2,
  Clock,
  ArchiveX,
  FileText,
} from 'lucide-react';
import { BatchRecord, ShedRecord, UserRole } from '../../types';

interface BatchListProps {
  batches: BatchRecord[];
  sheds: ShedRecord[];
  userRole: UserRole;
  onNavigateToNewBatch: () => void;
  onViewBatchDetails: (batchId: string) => void;
  onEditBatch: (batch: BatchRecord) => void;
  onArchiveBatch: (batch: BatchRecord) => void;
}

export function BatchList({
  batches,
  sheds,
  userRole,
  onNavigateToNewBatch,
  onViewBatchDetails,
  onEditBatch,
  onArchiveBatch,
}: BatchListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedShed, setSelectedShed] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [activeMenuBatchId, setActiveMenuBatchId] = useState<string | null>(null);

  // Compute 4 Summary Stat Cards
  const totalBatches = batches.length;
  const runningBatches = batches.filter((b) => b.status === 'Running' || b.status === 'Ready').length;
  const completedBatches = batches.filter((b) => b.status === 'Completed').length;
  const archivedBatches = batches.filter((b) => b.status === 'Archived').length;

  // Filter batches
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.notes && b.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'All'
        ? true
        : selectedStatus === 'Running'
        ? b.status === 'Running' || b.status === 'Ready'
        : b.status === selectedStatus;

    const matchesShed = selectedShed === 'All' || b.shed_id === selectedShed;
    const matchesType = selectedType === 'All' || b.batch_type === selectedType;

    return matchesSearch && matchesStatus && matchesShed && matchesType;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedShed('All');
    setSelectedType('All');
  };

  const getShedName = (shedId: string) => {
    const s = sheds.find((sh) => sh.id === shedId);
    return s ? s.name : 'Shed 01';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#e3ebd8] text-[#3b562b] flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Batch Centre</h1>
          </div>
          <p className="text-xs text-slate-500">
            Manage all your poultry batch lifecycle contracts, placement setups, daily tracking, and settlement records.
          </p>
        </div>

        <button
          onClick={onNavigateToNewBatch}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Batch</span>
        </button>
      </div>

      {/* 4 Summary Cards (Exact Stitch UI Design) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Batches */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total Batches
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono">{totalBatches}</div>
            <span className="text-[10px] text-slate-400 font-medium">All time records</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Running Batches */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Running Batches
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono">{runningBatches}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Active now in shed</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Batches */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block mb-1">
              Completed Batches
            </span>
            <div className="text-2xl font-black text-sky-700 font-mono">{completedBatches}</div>
            <span className="text-[10px] text-sky-600 font-medium">Lifting done</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Archived Batches */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Archived Batches
            </span>
            <div className="text-2xl font-black text-slate-700 font-mono">{archivedBatches}</div>
            <span className="text-[10px] text-slate-400 font-medium">Settled & Inactive</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <ArchiveX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Batch ID, company, breed or notes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b562b]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold outline-none cursor-pointer focus:border-[#3b562b]"
          >
            <option value="All">All Status</option>
            <option value="Running">Running / Active</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
            <option value="Ready">Ready</option>
          </select>

          {/* Shed Dropdown */}
          <select
            value={selectedShed}
            onChange={(e) => setSelectedShed(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold outline-none cursor-pointer focus:border-[#3b562b]"
          >
            <option value="All">All Sheds</option>
            {sheds.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Batch Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold outline-none cursor-pointer focus:border-[#3b562b]"
          >
            <option value="All">All Types</option>
            <option value="Broiler">Broiler</option>
            <option value="Breeder">Breeder</option>
            <option value="Layer">Layer</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Batch Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Batches List ({filteredBatches.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredBatches.length} of {batches.length}
          </span>
        </div>

        {filteredBatches.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No matching batches found. Try adjusting your search query or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Batch ID & Subtitle</th>
                  <th className="px-6 py-3.5">Shed</th>
                  <th className="px-6 py-3.5">Batch Type</th>
                  <th className="px-6 py-3.5">Start Date</th>
                  <th className="px-6 py-3.5 text-right">Birds (Placed)</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Days In House</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredBatches.map((batch) => {
                  const days = batch.target_days_in_house || 42;
                  return (
                    <tr
                      key={batch.id}
                      onClick={() => onViewBatchDetails(batch.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-[#3b562b] group-hover:underline text-xs flex items-center gap-2">
                          <span>{batch.batch_number}</span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded border border-emerald-200">
                            9 Sub-Pages
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {batch.company_name} • {batch.breed}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-800">
                        {getShedName(batch.shed_id)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                          {batch.batch_type}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600 font-mono">
                        {batch.placement_date}
                      </td>

                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                        {batch.chicks_placed.toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase inline-flex items-center gap-1 ${
                            batch.status === 'Running'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : batch.status === 'Completed'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : batch.status === 'Ready'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              batch.status === 'Running'
                                ? 'bg-emerald-500 animate-pulse'
                                : batch.status === 'Completed'
                                ? 'bg-sky-500'
                                : 'bg-slate-400'
                            }`}
                          ></span>
                          {batch.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right font-mono font-semibold text-slate-700">
                        {days} Days
                      </td>

                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewBatchDetails(batch.id)}
                            className="px-3 py-1.5 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1"
                            title="Open Batch (All 9 Sub-Pages)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Open 9 Pages</span>
                          </button>

                          {batch.status !== 'Archived' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditBatch(batch);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-amber-700 rounded-lg transition cursor-pointer"
                              title="Edit Batch"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {batch.status === 'Completed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onArchiveBatch(batch);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-sky-700 rounded-lg transition cursor-pointer"
                              title="Archive Batch"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
