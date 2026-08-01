'use client';

import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Header() {
  const {
    farms,
    sheds,
    selectedFarmId,
    selectedShedId,
    setSelectedFarmId,
    setSelectedShedId,
  } = useApp();

  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Left Search Bar */}
      <div className="relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full bg-[#f4f6f8] border border-slate-200/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#3b562b] transition"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Farm Select Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Farm</span>
          <div className="relative bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-2xs hover:border-slate-300">
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="appearance-none bg-transparent pr-4 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              {farms.length > 0 ? (
                farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))
              ) : (
                <option value="farm-001">Green Valley Farm</option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5" />
          </div>
        </div>

        {/* Shed Select Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Shed</span>
          <div className="relative bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-2xs hover:border-slate-300">
            <select
              value={selectedShedId}
              onChange={(e) => setSelectedShedId(e.target.value)}
              className="appearance-none bg-transparent pr-4 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              {sheds.length > 0 ? (
                sheds.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name.replace(/\s*\(.*?\)/, '')}
                  </option>
                ))
              ) : (
                <option value="shed-001">Shed 01</option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5" />
          </div>
        </div>

        {/* Notification Bell */}
        <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center relative bg-white hover:bg-slate-50 shadow-2xs transition cursor-pointer">
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center absolute -top-1 -right-1 border-2 border-white">
            3
          </span>
        </button>

        {/* Avatar Profile Badge */}
        <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 p-1 pr-2 rounded-full border border-slate-200 cursor-pointer transition">
          <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center">
            JF
          </div>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </div>
      </div>
    </header>
  );
}
