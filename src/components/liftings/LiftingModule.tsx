'use client';

import React, { useState } from 'react';
import { Truck, Plus, ShieldAlert } from 'lucide-react';
import { BatchRecord, LiftingRecord, UserRole } from '../../types';
import { BusinessEngine } from '../../engine';

interface LiftingModuleProps {
  activeBatch: BatchRecord | null;
  liftings: LiftingRecord[];
  userRole: UserRole;
  userId: string;
  onLiftingSaved: (lifting: Omit<LiftingRecord, 'id' | 'created_at' | 'updated_at' | 'avg_weight_kg'>) => Promise<void>;
}

export function LiftingModule({
  activeBatch,
  liftings,
  userRole,
  userId,
  onLiftingSaved,
}: LiftingModuleProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [liftingNo, setLiftingNo] = useState(liftings.length + 1);
  const [liftingDate, setLiftingDate] = useState(new Date().toISOString().split('T')[0]);
  const [birdsLifted, setBirdsLifted] = useState(2500);
  const [totalWeightKg, setTotalWeightKg] = useState(5500);
  const [buyerName, setBuyerName] = useState('Coastal Poultry Traders');
  const [vehicleNo, setVehicleNo] = useState('KA-04-ME-9821');
  const [ratePerKg, setRatePerKg] = useState(115);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeBatch) {
      setErrorMsg('No active batch selected for lifting recording.');
      return;
    }

    try {
      // Assert RBAC Permission
      BusinessEngine.assertPermission(userRole, 'RECORD_LIFTING');

      const grossAmount = totalWeightKg * ratePerKg;
      const netAmount = grossAmount; // Raw contract default

      await onLiftingSaved({
        batch_id: activeBatch.id,
        lifting_no: liftingNo,
        lifting_date: liftingDate,
        birds_lifted: birdsLifted,
        total_weight_kg: totalWeightKg,
        vehicle_no: vehicleNo || null,
        buyer_name: buyerName,
        rate_per_kg: ratePerKg,
        gross_amount: grossAmount,
        net_amount: netAmount,
        status: 'Completed',
        created_by: userId,
        updated_by: userId,
      });

      setLiftingNo((prev) => prev + 1);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Validation failed during lifting record creation.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Harvesting & Bird Liftings</h2>
          </div>
          <p className="text-xs text-slate-400">
            Record buyer sales, vehicle weights, and bird counts. Enforces role-based permission policies.
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
          Please select an active batch to manage harvesting liftings.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 h-fit">
            <h3 className="text-sm font-bold text-slate-100 mb-4 pb-3 border-b border-slate-800">
              Record Bird Lifting
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Lifting No</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={liftingNo}
                    onChange={(e) => setLiftingNo(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Lifting Date</label>
                  <input
                    type="date"
                    required
                    value={liftingDate}
                    onChange={(e) => setLiftingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Birds Lifted</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={birdsLifted}
                    onChange={(e) => setBirdsLifted(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Total Weight (kg)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalWeightKg}
                    onChange={(e) => setTotalWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Buyer Name</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Rate / kg (₹)</label>
                  <input
                    type="number"
                    required
                    value={ratePerKg}
                    onChange={(e) => setRatePerKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Vehicle No</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                Record Lifting
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden lg:col-span-2">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Lifting Transactions Log</h3>
              <span className="text-xs text-slate-400 font-mono">Count: {liftings.length}</span>
            </div>

            {liftings.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No lifting records logged for this batch contract.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Lifting #</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Buyer</th>
                      <th className="px-4 py-3">Birds</th>
                      <th className="px-4 py-3">Weight (kg)</th>
                      <th className="px-4 py-3">Rate (₹)</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {liftings.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">#{l.lifting_no}</td>
                        <td className="px-4 py-3 text-slate-400 font-mono">{l.lifting_date}</td>
                        <td className="px-4 py-3 text-slate-200 font-semibold">{l.buyer_name}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">{l.birds_lifted.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">{l.total_weight_kg.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-emerald-400">₹{l.rate_per_kg}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {l.status}
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
