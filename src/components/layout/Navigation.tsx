'use client';

import React from 'react';
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  Truck,
  Receipt,
  FileCheck2,
  ShieldCheck,
  Settings,
} from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'batches', label: 'Batch Centre', icon: Layers },
  { id: 'daily-log', label: 'Daily Log', icon: ClipboardList },
  { id: 'liftings', label: 'Harvesting & Liftings', icon: Truck },
  { id: 'financials', label: 'Financial Ledger', icon: Receipt },
  { id: 'settlement', label: 'Settlement', icon: FileCheck2 },
  { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
  { id: 'settings', label: 'Farm Settings', icon: Settings },
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-slate-900/80 border-b border-slate-800 px-6 backdrop-blur sticky top-0 z-30 overflow-x-auto">
      <div className="flex gap-2 min-w-max py-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
