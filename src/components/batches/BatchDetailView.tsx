'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Droplets,
  TrendingDown,
  TrendingUp,
  Download,
  Upload,
  Plus,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
  FileSpreadsheet,
  PieChart as PieIcon,
  ShieldAlert,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  BatchRecord,
  DailyLogRecord,
  LiftingRecord,
  FinancialTransactionRecord,
  ShedRecord,
  UserRole,
} from '../../types';
import { BusinessEngine } from '../../engine';
import { DocumentRecord, SEED_DOCUMENTS } from '../../services/seed-data';

interface BatchDetailViewProps {
  batch: BatchRecord;
  sheds: ShedRecord[];
  dailyLogs: DailyLogRecord[];
  liftings: LiftingRecord[];
  financials: FinancialTransactionRecord[];
  userRole: UserRole;
  userId: string;
  onBackToList: () => void;
  onEditBatch: (batch: BatchRecord) => void;
  onArchiveBatch: (batch: BatchRecord) => void;
  onDailyLogSaved?: (log: Omit<DailyLogRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onLiftingSaved?: (lifting: Omit<LiftingRecord, 'id' | 'created_at' | 'updated_at' | 'avg_weight_kg'>) => Promise<void>;
  onFinancialSaved?: (tx: Omit<FinancialTransactionRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function BatchDetailView({
  batch,
  sheds,
  dailyLogs,
  liftings,
  financials,
  userRole,
  userId,
  onBackToList,
  onEditBatch,
  onArchiveBatch,
  onDailyLogSaved,
  onLiftingSaved,
  onFinancialSaved,
}: BatchDetailViewProps) {
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Daily Logs' | 'Consumption' | 'Liftings' | 'Mortality' | 'Expenses' | 'Performance' | 'Documents' | 'Summary'
  >('Overview');

  // Documents state
  const [documents, setDocuments] = useState<DocumentRecord[]>(SEED_DOCUMENTS);
  const [docSearch, setDocSearch] = useState('');
  const [docCategory, setDocCategory] = useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCat, setNewDocCat] = useState<'Photo' | 'Report' | 'Invoice' | 'Other'>('Report');

  // Interactive Modals State
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [logFeed, setLogFeed] = useState(380);
  const [logWater, setLogWater] = useState(1300);
  const [logMort, setLogMort] = useState(2);
  const [logWeight, setLogWeight] = useState(520);
  const [logRemarks, setLogRemarks] = useState('');

  const [isAddLiftingOpen, setIsAddLiftingOpen] = useState(false);
  const [liftDate, setLiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [liftBirds, setLiftBirds] = useState(1200);
  const [liftWeight, setLiftWeight] = useState(2520);
  const [liftRate, setLiftRate] = useState(98);
  const [liftBuyer, setLiftBuyer] = useState('Local Processing');
  const [liftVehicle, setLiftVehicle] = useState('TN-38-BZ-1234');

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txType, setTxType] = useState<'Expense' | 'Income'>('Expense');
  const [txCategory, setTxCategory] = useState('Feed');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState(0);

  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  const shed = sheds.find((s) => s.id === batch.shed_id);
  const shedName = shed ? shed.name : 'Shed 01';

  // Calculate Business Engine Summary
  const calc = BusinessEngine.calculations.calculateBatchSummary(
    batch.chicks_placed,
    dailyLogs,
    liftings
  );

  // Consumption calculations
  const totalBags = +(calc.totalFeedConsumedKg / 50).toFixed(2);
  const stdBags = +(totalBags * 1.04).toFixed(2);
  const feedPerBirdKg = calc.daysInHouse > 0 ? +((calc.totalFeedConsumedKg / batch.chicks_placed)).toFixed(2) : 23.52;
  const waterPerBirdL = calc.daysInHouse > 0 ? +((calc.totalWaterConsumedLiters / batch.chicks_placed)).toFixed(2) : 11.49;

  // Chart data preparation
  const chartData = dailyLogs.map((l) => ({
    day: `D${l.day_in_house}`,
    actualFeed: +(l.feed_consumed_kg / 50).toFixed(1),
    stdFeed: +((l.feed_consumed_kg * 1.05) / 50).toFixed(1),
    actualWater: l.water_consumed_liters,
    stdWater: Math.round(l.water_consumed_liters * 1.03),
    weight: l.avg_body_weight_grams,
    mortality: l.mortality_count,
  }));

  // Mortality pie data
  const mortalityData = [
    { name: 'Early (0-7d)', value: 18, color: '#3b562b' },
    { name: 'Middle (8-21d)', value: 12, color: '#0ea5e9' },
    { name: 'Late (22-41d)', value: 8, color: '#f59e0b' },
  ];

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;
    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      batch_id: batch.id,
      name: newDocName,
      category: newDocCat,
      type: newDocCat === 'Photo' ? 'JPG' : 'PDF',
      uploaded_by: 'Current User',
      upload_date: new Date().toISOString().split('T')[0],
      size: '1.5 MB',
      notes: 'Uploaded via Batch Documents Module',
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setIsUploadModalOpen(false);
    setNewDocName('');
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Navigation & Header Banner (Exact Stitch UI Design) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToList}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-black text-slate-900 font-mono">
                  {batch.batch_number}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    batch.status === 'Running'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : batch.status === 'Completed'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {batch.status}
                </span>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {batch.batch_type} Batch • {shedName} • {batch.placement_date} (
                {calc.daysInHouse || batch.target_days_in_house} Days)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditBatch(batch)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Edit Batch Details
            </button>

            {batch.status === 'Completed' && (
              <button
                onClick={() => onArchiveBatch(batch)}
                className="px-4 py-2 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Batch</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Header Metric Banner Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Days In House
            </span>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
              {calc.daysInHouse || 41} <span className="text-xs font-normal text-slate-500">/ {batch.target_days_in_house}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Birds Placed
            </span>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
              {batch.chicks_placed.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Final Settlement
            </span>
            <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
              ₹ 4,68,750
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Net Profit
            </span>
            <div className="text-xl font-black text-[#3b562b] font-mono mt-0.5">
              ₹ 3,20,500
            </div>
          </div>
        </div>
      </div>

      {/* 9 Sub-Tabs Navigation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-[900px]">
          {[
            { id: 'Overview', label: '1. Overview' },
            { id: 'Daily Logs', label: '2. Daily Logs' },
            { id: 'Consumption', label: '3. Consumption' },
            { id: 'Liftings', label: '4. Liftings' },
            { id: 'Mortality', label: '5. Mortality' },
            { id: 'Expenses', label: '6. Expenses' },
            { id: 'Performance', label: '7. Performance' },
            { id: 'Documents', label: '8. Documents' },
            { id: 'Summary', label: '9. Summary' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#3b562b] text-white shadow-2xs ring-2 ring-[#3b562b]/30'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* 7 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Mortality %', value: `${calc.mortalityPct || 0.90}%`, sub: 'Target < 2.0%' },
              { label: 'Avg Body Weight', value: `${calc.avgFinalWeightKg || 2.1} kg`, sub: 'On Target' },
              { label: 'FCR (Overall)', value: calc.cumulativeFcr || '1.48', sub: 'Target 1.50' },
              { label: 'Feed / Bird', value: `${feedPerBirdKg} kg`, sub: 'Std 24.5 kg' },
              { label: 'Water / Bird', value: `${waterPerBirdL} L`, sub: 'Std 11.8 L' },
              { label: 'Prod. Cost / kg', value: '₹ 82.08', sub: 'Std ₹ 85.00' },
              { label: 'Total Profit', value: '₹ 3,20,500', sub: 'Net Earnings' },
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {kpi.label}
                </span>
                <div className="text-base font-black text-slate-900 font-mono mt-1">{kpi.value}</div>
                <span className="text-[9px] text-emerald-600 font-semibold">{kpi.sub}</span>
              </div>
            ))}
          </div>

          {/* Main Overview Charts & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-2xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Performance Trend (Body Weight & FCR)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Area type="monotone" dataKey="weight" stroke="#3b562b" fill="#e3ebd8" name="Body Weight (g)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Batch Summary Box */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-2xs space-y-3 text-xs">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Batch Metadata Summary
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Batch Type:</span>
                  <span className="font-bold text-slate-900">{batch.batch_type}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Breed:</span>
                  <span className="font-bold text-slate-900">{batch.breed}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Supplier:</span>
                  <span className="font-bold text-slate-900">{batch.supplier_name || 'Central Hatchery'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Placement Date:</span>
                  <span className="font-mono text-slate-900">{batch.placement_date}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Formula Profile:</span>
                  <span className="font-mono text-slate-900">{batch.formula_profile}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Logs */}
      {activeTab === 'Daily Logs' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Daily Operations Log History ({dailyLogs.length} Records)
              </h3>
              <button
                onClick={() => setIsAddLogOpen(true)}
                className="px-4 py-2 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Daily Log</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Feed Consumed (kg)</th>
                    <th className="px-4 py-3">Water (L)</th>
                    <th className="px-4 py-3">Mortality</th>
                    <th className="px-4 py-3">Avg Weight (g)</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#3b562b]">Day {log.day_in_house}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{log.log_date}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{log.feed_consumed_kg} kg</td>
                      <td className="px-4 py-3 font-mono text-slate-800">{log.water_consumed_liters} L</td>
                      <td className="px-4 py-3 font-mono text-rose-600 font-bold">{log.mortality_count}</td>
                      <td className="px-4 py-3 font-mono text-slate-900">{log.avg_body_weight_grams} g</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] truncate max-w-xs">{log.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Consumption */}
      {activeTab === 'Consumption' && (
        <div className="space-y-6">
          {/* 6 Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: 'Total Feed Consumed', val: `${totalBags} Bags`, sub: 'Std: 102.90 Bags' },
              { title: 'Total Water Used', val: `${calc.totalWaterConsumedLiters.toLocaleString()} L`, sub: 'Std: 49,800 L' },
              { title: 'Avg Feed / Bird', val: `${feedPerBirdKg} kg`, sub: 'Std: 24.50 kg' },
              { title: 'Avg Water / Bird', val: `${waterPerBirdL} L`, sub: 'Std: 11.86 L' },
              { title: 'Feed Cost', val: '₹ 1,23,500', sub: 'Std: ₹ 1,28,625' },
              { title: 'Feed Cost / Bird', val: '₹ 29.40', sub: 'Std: ₹ 30.63' },
            ].map((card, i) => (
              <div key={i} className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {card.title}
                </span>
                <div className="text-base font-black text-slate-900 font-mono mt-1">{card.val}</div>
                <span className="text-[9px] text-emerald-600 font-semibold">{card.sub}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-2xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Feed Consumption Trend (Bags)
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Line type="monotone" dataKey="actualFeed" stroke="#3b562b" strokeWidth={2} name="Actual Bags" />
                    <Line type="monotone" dataKey="stdFeed" stroke="#94a3b8" strokeDasharray="3 3" name="Std Bags" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-2xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Water Consumption Trend (Liters)
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Line type="monotone" dataKey="actualWater" stroke="#0ea5e9" strokeWidth={2} name="Actual Water (L)" />
                    <Line type="monotone" dataKey="stdWater" stroke="#94a3b8" strokeDasharray="3 3" name="Std Water (L)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Liftings */}
      {activeTab === 'Liftings' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Lifting Operations Summary ({liftings.length} Records)
              </h3>
              <button
                onClick={() => setIsAddLiftingOpen(true)}
                className="px-4 py-2 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Record New Lifting</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Lifting No</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Buyer / Vehicle</th>
                    <th className="px-4 py-3">Birds Lifted</th>
                    <th className="px-4 py-3">Total Weight (kg)</th>
                    <th className="px-4 py-3">Avg Wt (kg)</th>
                    <th className="px-4 py-3">Rate/kg (₹)</th>
                    <th className="px-4 py-3">Net Realization (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liftings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#3b562b]">#{l.lifting_no}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{l.lifting_date}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{l.buyer_name} ({l.vehicle_no || 'TN-38'})</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{l.birds_lifted.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-900">{l.total_weight_kg.toLocaleString()} kg</td>
                      <td className="px-4 py-3 font-mono text-slate-800">{l.avg_weight_kg || 2.1} kg</td>
                      <td className="px-4 py-3 font-mono text-slate-800">₹ {l.rate_per_kg}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">₹ {l.net_amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Mortality */}
      {activeTab === 'Mortality' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-2xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Daily Mortality Trend
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="mortality" fill="#f43f5e" name="Mortality Birds" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Expenses / Financials */}
      {activeTab === 'Expenses' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Internal Batch Ledger & Transactions ({financials.length})
              </h3>
              <button
                onClick={() => setIsAddTxOpen(true)}
                className="px-4 py-2 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Transaction</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Amount (₹)</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financials.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-600">{tx.tx_date}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.tx_type === 'Income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {tx.tx_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{tx.category}</td>
                      <td className="px-4 py-3 text-slate-600 text-[11px]">{tx.description}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">₹ {tx.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">{tx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Performance */}
      {activeTab === 'Performance' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">
              Performance Benchmark vs Company Standard
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Metric</th>
                    <th className="px-4 py-3">This Batch</th>
                    <th className="px-4 py-3">Company Standard</th>
                    <th className="px-4 py-3">Last 5 Batches Avg</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="px-4 py-3 font-bold font-sans text-slate-900">Final Weight</td>
                    <td className="px-4 py-3 text-[#3b562b] font-bold">2.10 kg</td>
                    <td className="px-4 py-3 text-slate-600">2.05 kg</td>
                    <td className="px-4 py-3 text-slate-600">2.02 kg</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">Above Standard</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold font-sans text-slate-900">FCR</td>
                    <td className="px-4 py-3 text-[#3b562b] font-bold">1.48</td>
                    <td className="px-4 py-3 text-slate-600">1.52</td>
                    <td className="px-4 py-3 text-slate-600">1.54</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">Better (Lower)</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold font-sans text-slate-900">Mortality %</td>
                    <td className="px-4 py-3 text-[#3b562b] font-bold">0.90 %</td>
                    <td className="px-4 py-3 text-slate-600">2.00 %</td>
                    <td className="px-4 py-3 text-slate-600">1.40 %</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">On Target</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Documents */}
      {activeTab === 'Documents' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Batch Documents & Attachments ({documents.length})
              </h3>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Document Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Uploaded By</th>
                    <th className="px-4 py-3">Upload Date</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#3b562b]" />
                        <span>{doc.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{doc.type}</td>
                      <td className="px-4 py-3 text-slate-700">{doc.uploaded_by}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{doc.upload_date}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{doc.size}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className="p-1.5 hover:bg-slate-100 text-[#3b562b] rounded-lg transition cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Summary */}
      {activeTab === 'Summary' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-2xs space-y-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Batch Completion & Settlement Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
              <h3 className="font-bold text-slate-900">Physical Accounting</h3>
              <div className="flex justify-between">
                <span>Total Birds Placed:</span>
                <span className="font-mono font-bold text-slate-900">{batch.chicks_placed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Mortality:</span>
                <span className="font-mono text-rose-600">{calc.totalMortality}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Lifted Birds:</span>
                <span className="font-mono font-bold text-emerald-700">{calc.totalLiftedBirds.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
              <h3 className="font-bold text-slate-900">Final Settlement Overview</h3>
              <div className="flex justify-between">
                <span>Gross GC Amount:</span>
                <span className="font-mono font-bold text-slate-900">₹ 4,75,000</span>
              </div>
              <div className="flex justify-between">
                <span>Net Settlement Payment:</span>
                <span className="font-mono font-bold text-emerald-700">₹ 4,68,750</span>
              </div>
              <div className="flex justify-between">
                <span>Settlement Status:</span>
                <span className="font-bold text-emerald-600">Settled & Approved</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setIsArchiveConfirmOpen(true)}
              className="px-6 py-2.5 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              <span>Archive This Batch</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Daily Log Modal */}
      {isAddLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-xs font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
              Record Daily Operations Log
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (onDailyLogSaved) {
                  await onDailyLogSaved({
                    batch_id: batch.id,
                    log_date: new Date().toISOString().split('T')[0],
                    day_in_house: (dailyLogs.length || 0) + 1,
                    status: 'Completed',
                    feed_consumed_kg: logFeed,
                    water_consumed_liters: logWater,
                    mortality_count: logMort,
                    culls_count: 0,
                    avg_body_weight_grams: logWeight,
                    remarks: logRemarks,
                    created_by: userId || 'user-1',
                    updated_by: userId || 'user-1',
                  });
                }
                setIsAddLogOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Feed Consumed (kg)</label>
                <input
                  type="number"
                  required
                  value={logFeed}
                  onChange={(e) => setLogFeed(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Water Consumed (Liters)</label>
                <input
                  type="number"
                  required
                  value={logWater}
                  onChange={(e) => setLogWater(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mortality Count</label>
                  <input
                    type="number"
                    required
                    value={logMort}
                    onChange={(e) => setLogMort(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avg Body Weight (g)</label>
                  <input
                    type="number"
                    required
                    value={logWeight}
                    onChange={(e) => setLogWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks / Observational Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Birds healthy, water pressure normal..."
                  value={logRemarks}
                  onChange={(e) => setLogRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLogOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3b562b] text-white font-bold rounded-xl shadow-2xs cursor-pointer"
                >
                  Save Daily Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Lifting Modal */}
      {isAddLiftingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-xs font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
              Record New Bird Lifting
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (onLiftingSaved) {
                  await onLiftingSaved({
                    batch_id: batch.id,
                    lifting_no: (liftings.length || 0) + 1,
                    lifting_date: liftDate,
                    birds_lifted: liftBirds,
                    total_weight_kg: liftWeight,
                    rate_per_kg: liftRate,
                    gross_amount: liftBirds * liftWeight,
                    buyer_name: liftBuyer,
                    vehicle_no: liftVehicle,
                    net_amount: liftWeight * liftRate,
                    status: 'Completed',
                    created_by: userId || 'user-1',
                    updated_by: userId || 'user-1',
                  });
                }
                setIsAddLiftingOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lifting Date</label>
                  <input
                    type="date"
                    required
                    value={liftDate}
                    onChange={(e) => setLiftDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Birds Lifted</label>
                  <input
                    type="number"
                    required
                    value={liftBirds}
                    onChange={(e) => setLiftBirds(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={liftWeight}
                    onChange={(e) => setLiftWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rate / kg (₹)</label>
                  <input
                    type="number"
                    required
                    value={liftRate}
                    onChange={(e) => setLiftRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Buyer / Trader</label>
                <input
                  type="text"
                  required
                  value={liftBuyer}
                  onChange={(e) => setLiftBuyer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLiftingOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3b562b] text-white font-bold rounded-xl shadow-2xs cursor-pointer"
                >
                  Save Lifting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isAddTxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-xs font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
              Add Financial Transaction
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (onFinancialSaved) {
                  await onFinancialSaved({
                    batch_id: batch.id,
                    tx_date: new Date().toISOString().split('T')[0],
                    tx_type: txType,
                    category: txCategory,
                    description: txDesc || 'Batch ledger entry',
                    payment_mode: 'Bank Transfer',
                    amount: txAmount,
                    paid_amount: txAmount,
                    pending_amount: 0,
                    status: 'Paid',
                    created_by: userId || 'user-1',
                    updated_by: userId || 'user-1',
                  });
                }
                setIsAddTxOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as 'Expense' | 'Income')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none font-bold"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                  >
                    <option value="Feed">Feed</option>
                    <option value="Chick">Chick</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Labour">Labour</option>
                    <option value="Lifting Revenue">Lifting Revenue</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starter Feed Bag Purchase..."
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={txAmount || ''}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTxOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3b562b] text-white font-bold rounded-xl shadow-2xs cursor-pointer"
                >
                  Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {isArchiveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl relative space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Archive Batch #{batch.batch_number}?
            </h3>
            <p className="text-xs text-slate-600">
              Archiving will finalize all records for this batch and move it to the read-only Batch Archive.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsArchiveConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsArchiveConfirmOpen(false);
                  onArchiveBatch(batch);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-xs font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
              Upload Batch Document
            </h3>

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Name</label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Feed_Delivery_Challan_Day20.pdf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newDocCat}
                  onChange={(e) => setNewDocCat(e.target.value as 'Photo' | 'Report' | 'Invoice' | 'Other')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                >
                  <option value="Report">Report</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Photo">Photo</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
