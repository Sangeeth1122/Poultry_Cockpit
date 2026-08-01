'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';
import { X, ClipboardList, ShieldAlert } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    isDailyLogModalOpen,
    setIsDailyLogModalOpen,
    modalFeedKg,
    setModalFeedKg,
    modalWaterL,
    setModalWaterL,
    modalMortality,
    setModalMortality,
    modalAvgWeight,
    setModalAvgWeight,
    modalError,
    handleModalSaveLog,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#f7f9f6] text-slate-800 flex font-sans selection:bg-[#3b562b] selection:text-white">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <Header />

        {/* Page Content */}
        <main className="p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Daily Log Quick Action Modal */}
      {isDailyLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#3b562b]" />
                <span>Enter Day 18 Daily Log</span>
              </h3>
              <button
                onClick={() => setIsDailyLogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleModalSaveLog} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Feed (kg)</label>
                  <input
                    type="number"
                    required
                    value={modalFeedKg}
                    onChange={(e) => setModalFeedKg(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Water (L)</label>
                  <input
                    type="number"
                    required
                    value={modalWaterL}
                    onChange={(e) => setModalWaterL(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mortality Count</label>
                  <input
                    type="number"
                    required
                    value={modalMortality}
                    onChange={(e) => setModalMortality(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Avg Body Wt (g)</label>
                  <input
                    type="number"
                    required
                    value={modalAvgWeight}
                    onChange={(e) => setModalAvgWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDailyLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer"
                >
                  Submit Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
