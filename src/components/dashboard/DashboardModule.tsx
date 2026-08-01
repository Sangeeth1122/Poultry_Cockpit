'use client';

import React, { useState } from 'react';
import {
  Activity,
  ShoppingBag,
  Droplets,
  Coins,
  Clock,
  Sliders,
  ChevronRight,
  ChevronDown,
  Calendar,
  CheckCircle2,
  FolderKanban,
  ClipboardList,
  Receipt,
  FileCheck2,
  Archive,
} from 'lucide-react';
import { BatchRecord, DailyLogRecord, FarmRecord, ShedRecord } from '../../types';

interface DashboardModuleProps {
  farms: FarmRecord[];
  sheds: ShedRecord[];
  batches: BatchRecord[];
  activeBatch: BatchRecord | null;
  dailyLogs: DailyLogRecord[];
  onNavigateTab: (tabId: string) => void;
  onOpenDailyLogModal: () => void;
}

export function DashboardModule({
  activeBatch,
  dailyLogs,
  onNavigateTab,
  onOpenDailyLogModal,
}: DashboardModuleProps) {
  const [activeChartMetric, setActiveChartMetric] = useState<'Feed' | 'Water' | 'Mortality' | 'Weight' | 'FCR' | 'Production Cost'>('Feed');

  // Chart dataset for last 7 days (12 May - 17 May)
  const chartData = [
    { label: '12 May', value: 100 },
    { label: '13 May', value: 180 },
    { label: '14 May', value: 230 },
    { label: '15 May', value: 350 },
    { label: '16 May', value: 310 },
    { label: '17 May', value: 480 },
  ];

  const maxVal = 500;

  return (
    <div className="space-y-6 pb-8">
      {/* ROW 1: Running Batch Hero Card + 6 Metric Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* HERO BATCH CARD (Left - 5 Cols) */}
        <div className="lg:col-span-5 bg-[#3b562b] rounded-2xl p-6 text-white flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#d1e6c2] uppercase">
                  RUNNING BATCH
                </span>
                <h1
                  onClick={() => onNavigateTab('batches')}
                  className="text-3xl font-extrabold text-white tracking-tight mt-0.5 hover:underline cursor-pointer"
                  title="View Running Batch Details"
                >
                  {activeBatch ? activeBatch.batch_number : 'B-24-001'}
                </h1>
                <p className="text-xs text-[#d1e6c2] mt-0.5 font-medium">
                  Day 18 • Started on 01 May 2024
                </p>
              </div>

              {/* White Chicken Photo Circle Frame */}
              <div className="w-22 h-22 rounded-full border-2 border-[#597e44] overflow-hidden shadow-md shrink-0 bg-[#2d471e]">
                <img
                  src="/chicken.jpg"
                  alt="White Broiler Chicken"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Status Pill */}
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4a6b37] text-white text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Healthy & On Track</span>
            </div>
            <p className="text-[11px] text-[#c2dcb1] mt-1 font-medium">
              All key metrics are within the target range.
            </p>
          </div>

          {/* Bottom Action Sub-Cards */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/95 text-slate-800 rounded-xl p-3 shadow-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  DASHBOARD STATUS
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900">Updated through Day 17</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Last updated: Today, 08:12 PM</div>
            </div>

            <button
              onClick={onOpenDailyLogModal}
              className="bg-white/95 hover:bg-white text-slate-800 rounded-xl p-3 shadow-xs text-left transition cursor-pointer flex flex-col justify-between"
            >
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Next Action
              </div>
              <div className="text-xs font-bold text-[#3b562b] flex items-center gap-0.5 mt-2">
                <span>Enter Day 18 Daily Log</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </div>
            </button>
          </div>
        </div>

        {/* 6 METRIC STAT CARDS (Right - 7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Card 1: Mortality % */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Mortality %</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">1.45%</span>
                <span className="text-[10px] text-slate-400 font-medium">Target: ≤ 3.0%</span>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
              <span>↓ 0.35%</span>
              <span className="text-[11px] text-slate-400 font-normal">vs Day 16</span>
            </div>
          </div>

          {/* Card 2: Feed (Latest) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Feed (Latest)</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">365 kg</span>
                <span className="text-[10px] text-slate-400 font-medium">Day 17</span>
              </div>
            </div>
            <div className="text-xs font-bold text-rose-500 mt-3 flex items-center gap-1">
              <span>↑ 5.2%</span>
              <span className="text-[11px] text-slate-400 font-normal">vs Day 16</span>
            </div>
          </div>

          {/* Card 3: Water (Latest) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Water (Latest)</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">1,250 L</span>
                <span className="text-[10px] text-slate-400 font-medium">Day 17</span>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
              <span>↓ 3.1%</span>
              <span className="text-[11px] text-slate-400 font-normal">vs Day 16</span>
            </div>
          </div>

          {/* Card 4: Production Cost */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Production Cost</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">₹ 28.45</span>
                <span className="text-[11px] text-slate-500 font-medium">/ bird</span>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
              <span>↓ 1.8%</span>
              <span className="text-[11px] text-slate-400 font-normal">vs Day 16</span>
            </div>
          </div>

          {/* Card 5: Feed (Offset) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Feed (Offset)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-slate-900">-0.5 Day</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Behind
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-3">
              vs Standard Feed
            </div>
          </div>

          {/* Card 6: FCR */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">FCR</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">1.68</span>
                <span className="text-[10px] text-slate-400 font-medium">Target: &lt; 1.80</span>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
              <span>↓ 0.04</span>
              <span className="text-[11px] text-slate-400 font-normal">vs Day 16</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Performance Overview (Chart) + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Performance Overview (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Performance Overview</h2>
              <div className="relative bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1 text-xs text-slate-700 font-medium cursor-pointer">
                <span>Last 7 Days</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Metric Selector Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(['Feed', 'Water', 'Mortality', 'Weight', 'FCR', 'Production Cost'] as const).map(
                (metric) => (
                  <button
                    key={metric}
                    onClick={() => setActiveChartMetric(metric)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeChartMetric === metric
                        ? 'bg-[#3b562b] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {metric}
                  </button>
                )
              )}
            </div>

            {/* SVG Line Chart */}
            <div className="w-full h-48 relative">
              {/* Y Axis Labels */}
              <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-slate-400 font-mono">
                <span>500</span>
                <span>400</span>
                <span>300</span>
                <span>200</span>
                <span>100</span>
                <span>0</span>
              </div>

              {/* Chart Plot Area */}
              <div className="ml-9 h-40 relative border-b border-l border-slate-200">
                {/* Horizontal Gridlines */}
                {[0, 20, 40, 60, 80].map((top) => (
                  <div
                    key={top}
                    className="absolute left-0 right-0 border-b border-slate-100"
                    style={{ top: `${top}%` }}
                  />
                ))}

                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                  <defs>
                    <linearGradient id="oliveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b562b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b562b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area under curve */}
                  <polygon
                    points="0,128 0,128 100,102.4 200,86.4 300,48 400,60.8 500,6.4 500,160 0,160"
                    fill="url(#oliveGradient)"
                  />

                  {/* Smooth Curve Line */}
                  <polyline
                    fill="none"
                    stroke="#3b562b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,128 100,102.4 200,86.4 300,48 400,60.8 500,6.4"
                  />

                  {/* Data Points Dots */}
                  {[
                    { x: 0, y: 128 },
                    { x: 100, y: 102.4 },
                    { x: 200, y: 86.4 },
                    { x: 300, y: 48 },
                    { x: 400, y: 60.8 },
                    { x: 500, y: 6.4 },
                  ].map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      className="fill-[#3b562b] stroke-white stroke-2 cursor-pointer hover:r-6 transition-all"
                    />
                  ))}
                </svg>
              </div>

              {/* X Axis Labels */}
              <div className="ml-9 flex justify-between pt-2 text-[11px] text-slate-500 font-medium">
                {chartData.map((d) => (
                  <span key={d.label}>{d.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Action 1: Add Daily Log */}
              <button
                onClick={onOpenDailyLogModal}
                className="flex items-center gap-3 p-3 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl transition text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Add Daily Log</span>
              </button>

              {/* Action 2: Open Batch Centre */}
              <button
                onClick={() => onNavigateTab('batches')}
                className="flex items-center gap-3 p-3 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl transition text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Open Batch Centre</span>
              </button>

              {/* Action 3: Today's Operations */}
              <button
                onClick={() => onNavigateTab('operations')}
                className="flex items-center gap-3 p-3 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl transition text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Today's Operations</span>
              </button>

              {/* Action 4: Record Expense */}
              <button
                onClick={() => onNavigateTab('financials')}
                className="flex items-center gap-3 p-3 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl transition text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Record Expense</span>
              </button>

              {/* Action 5: Settlement */}
              <button
                onClick={() => onNavigateTab('settlement')}
                className="flex items-center gap-3 p-3 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl transition text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Settlement</span>
              </button>

              {/* Action 6: Archive Batch */}
              <button
                onClick={() => onNavigateTab('batches')}
                className="flex items-center gap-3 p-3 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl transition text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Archive className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Archive Batch</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: 4 SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Batch Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            Current Batch Summary
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Current Birds</span>
              <span className="font-bold text-slate-900">3,856</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Initial Birds</span>
              <span className="font-bold text-slate-900">4,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Mortality (Total)</span>
              <span className="font-bold text-rose-600">144 (3.60%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Avg. Daily Gain (Latest)</span>
              <span className="font-bold text-slate-900">42.5 g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Cumulative Feed (Day 1–17)</span>
              <span className="font-bold text-slate-900">6,205 kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Cumulative Water (Day 1–17)</span>
              <span className="font-bold text-slate-900">21,250 L</span>
            </div>
          </div>
        </div>

        {/* Card 2: Standards Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">Standards Snapshot</h3>
            <span className="text-[10px] text-slate-400 font-medium">(Day 17)</span>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Avg. Body Weight</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">450 g <span className="text-slate-400 font-normal">/ bird</span></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Target: 445 – 455 g</div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">FCR</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">1.68</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Target: &lt; 1.80</div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mortality %</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">1.45%</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Target: ≤ 3.0%</div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Uniformity</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">78%</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Target: ≥ 70%</div>
            </div>
          </div>
        </div>

        {/* Card 3: Finance Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">Finance Snapshot</h3>
            <span className="text-[10px] text-slate-400 font-medium">(Day 1–17)</span>
          </div>
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Production Cost</span>
              <span className="font-bold text-slate-900">₹ 28.45 <span className="text-slate-400 font-normal">/ bird</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Spend</span>
              <span className="font-bold text-slate-900">₹ 1,09,823</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Estimated Return</span>
              <span className="font-bold text-slate-900">₹ 2,19,328</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-500">Estimated Profit</span>
              <span className="font-bold text-emerald-600 text-sm">₹ 1,09,505</span>
            </div>
          </div>
        </div>

        {/* Card 4: Last Daily Log */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Last Daily Log</h3>
              <span className="text-[10px] text-slate-400 font-medium">Day 17 • 17 May 2024</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Feed</span>
                <span className="font-bold text-slate-900">365 kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Water</span>
                <span className="font-bold text-slate-900">1,250 L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mortality</span>
                <span className="font-bold text-slate-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Avg. Weight</span>
                <span className="font-bold text-slate-900">450 g</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenDailyLogModal}
            className="w-full mt-4 py-2.5 bg-[#3b562b] hover:bg-[#324b24] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
          >
            <span>View Day 17 Log</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="pt-6 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <div>© 2024 PoultryCockpit. All rights reserved.</div>
        <div>Version 1.0.0</div>
      </footer>
    </div>
  );
}
