'use client';

import React, { useState } from 'react';
import { ClipboardList, ShieldAlert } from 'lucide-react';
import { BatchRecord, DailyLogRecord, UserRole } from '../../types';
import { BusinessEngine } from '../../engine';

interface DailyLogModuleProps {
  activeBatch: BatchRecord | null;
  dailyLogs: DailyLogRecord[];
  userRole: UserRole;
  userId: string;
  onLogSaved: (log: Omit<DailyLogRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function DailyLogModule({
  activeBatch,
  dailyLogs,
  userRole,
  userId,
  onLogSaved,
}: DailyLogModuleProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayInHouse, setDayInHouse] = useState(dailyLogs.length + 18);
  const [feedConsumedKg, setFeedConsumedKg] = useState(365);
  const [waterConsumedLiters, setWaterConsumedLiters] = useState(1250);
  const [mortalityCount, setMortalityCount] = useState(3);
  const [cullsCount, setCullsCount] = useState(0);
  const [avgBodyWeightGrams, setAvgBodyWeightGrams] = useState(480);
  const [remarks, setRemarks] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeBatch) {
      setErrorMsg('No active batch selected for log recording.');
      return;
    }

    try {
      // Execute Business Engine Boundary Validations
      BusinessEngine.validateDailyLogEntry(
        userRole,
        feedConsumedKg,
        waterConsumedLiters,
        mortalityCount,
        activeBatch.chicks_placed
      );

      await onLogSaved({
        batch_id: activeBatch.id,
        log_date: logDate,
        day_in_house: dayInHouse,
        status: 'Completed',
        feed_consumed_kg: feedConsumedKg,
        water_consumed_liters: waterConsumedLiters,
        mortality_count: mortalityCount,
        culls_count: cullsCount,
        avg_body_weight_grams: avgBodyWeightGrams,
        remarks: remarks || null,
        created_by: userId,
        updated_by: userId,
      });

      setDayInHouse((prev) => prev + 1);
      setRemarks('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Validation failed during daily log recording.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#e3ebd8] text-[#3b562b] flex items-center justify-center font-bold">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Daily Operations Log Entry</h2>
          </div>
          <p className="text-xs text-slate-500">
            Record daily mortality, feed, water, and weight observations. All log entries are validated against RBAC policies.
          </p>
        </div>

        {activeBatch && (
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
            Target Batch: <strong className="text-[#3b562b] font-mono">{activeBatch.batch_number}</strong>
          </div>
        )}
      </div>

      {!activeBatch ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-2xs">
          Please select or create an active batch to enter daily logs.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entry Form */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 lg:col-span-1 h-fit shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              New Daily Record Entry
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Log Date</label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Day in House</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={dayInHouse}
                    onChange={(e) => setDayInHouse(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Feed (kg)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={feedConsumedKg}
                    onChange={(e) => setFeedConsumedKg(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Water (Liters)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={waterConsumedLiters}
                    onChange={(e) => setWaterConsumedLiters(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mortality Count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={mortalityCount}
                    onChange={(e) => setMortalityCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Culls Count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={cullsCount}
                    onChange={(e) => setCullsCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Avg Body Weight (g)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={avgBodyWeightGrams}
                  onChange={(e) => setAvgBodyWeightGrams(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Normal feed intake, good activity"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer"
              >
                Save Daily Log
              </button>
            </form>
          </div>

          {/* Records Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden lg:col-span-2 shadow-2xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Daily Records Log</h3>
              <span className="text-xs text-slate-400 font-mono">Entries: {dailyLogs.length}</span>
            </div>

            {dailyLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No daily logs recorded yet for this batch contract.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Day</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Feed (kg)</th>
                      <th className="px-4 py-3">Water (L)</th>
                      <th className="px-4 py-3">Mortality</th>
                      <th className="px-4 py-3">Avg Wt (g)</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#3b562b]">Day {log.day_in_house}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">{log.log_date}</td>
                        <td className="px-4 py-3 font-mono text-slate-900">{log.feed_consumed_kg}</td>
                        <td className="px-4 py-3 font-mono text-slate-700">{log.water_consumed_liters}</td>
                        <td className="px-4 py-3 font-mono text-rose-600 font-bold">{log.mortality_count}</td>
                        <td className="px-4 py-3 font-mono text-slate-900">{log.avg_body_weight_grams}g</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
