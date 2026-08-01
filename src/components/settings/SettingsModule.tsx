'use client';

import React, { useState } from 'react';
import { Settings, Building2, Warehouse, Plus, ShieldAlert } from 'lucide-react';
import { FarmRecord, ShedRecord, UserRole } from '../../types';
import { BusinessEngine } from '../../engine';

interface SettingsModuleProps {
  farms: FarmRecord[];
  sheds: ShedRecord[];
  userRole: UserRole;
  userId: string;
  onFarmCreated: (farm: Omit<FarmRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onShedCreated: (shed: Omit<ShedRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function SettingsModule({
  farms,
  sheds,
  userRole,
  userId,
  onFarmCreated,
  onShedCreated,
}: SettingsModuleProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Shed Form
  const [shedName, setShedName] = useState('');
  const [shedCapacity, setShedCapacity] = useState(12000);
  const [shedArea, setShedArea] = useState(15000);

  const handleShedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (farms.length === 0) {
      setErrorMsg('No active farm entity available.');
      return;
    }

    try {
      BusinessEngine.assertPermission(userRole, 'MANAGE_FARM');

      await onShedCreated({
        farm_id: farms[0].id,
        name: shedName || `Shed #${sheds.length + 1}`,
        capacity: shedCapacity,
        area_sqft: shedArea,
        status: 'Available',
      });

      setShedName('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Permission denied or failure during shed creation.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Farm & Shed Infrastructure Settings</h2>
          </div>
          <p className="text-xs text-slate-400">
            Configure physical farm profiles, shed capacities, and site specifications.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farm Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Farm Entity Details</h3>
          </div>

          {farms.map((f) => (
            <div key={f.id} className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Farm Name</span>
                <span className="font-semibold text-slate-200">{f.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Owner</span>
                <span className="font-semibold text-slate-200">{f.owner_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">District / State</span>
                <span className="font-semibold text-slate-200">{f.district}, {f.state}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Land Area</span>
                <span className="font-semibold text-slate-200">{f.total_land_area_acres} Acres</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Total Sheds</span>
                <span className="font-semibold text-emerald-400">{sheds.length} Configured</span>
              </div>
            </div>
          ))}
        </div>

        {/* Shed Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Add Shed Infrastructure</h3>
            </div>
          </div>

          <form onSubmit={handleShedSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Shed Identifier</label>
              <input
                type="text"
                required
                placeholder="e.g. Shed 3 (High-Density)"
                value={shedName}
                onChange={(e) => setShedName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Bird Capacity</label>
                <input
                  type="number"
                  required
                  value={shedCapacity}
                  onChange={(e) => setShedCapacity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Area (sq.ft)</label>
                <input
                  type="number"
                  required
                  value={shedArea}
                  onChange={(e) => setShedArea(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              Add Shed Record
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Registered Sheds</h4>
            {sheds.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                <span className="font-semibold text-slate-200">{s.name}</span>
                <span className="text-slate-400 font-mono">{s.capacity.toLocaleString()} birds</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
