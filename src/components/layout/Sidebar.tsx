'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CheckSquare,
  FolderKanban,
  LineChart,
  Settings,
  ChevronRight,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

export function Sidebar() {
  const pathname = usePathname();
  const { userRole, setUserRole } = useApp();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: Home, href: '/dashboard' },
    { id: 'operations', label: 'Operations', icon: CheckSquare, href: '/operations' },
    { id: 'batches', label: 'Batch Centre', icon: FolderKanban, href: '/batch-centre' },
    { id: 'intelligence', label: 'Intelligence', icon: LineChart, href: '/intelligence' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const roles: UserRole[] = ['Owner', 'Administrator', 'Manager', 'Accountant', 'Viewer'];

  return (
    <>
      <aside className="w-64 bg-[#f2f5f0] border-r border-slate-200/80 flex flex-col justify-between p-5 min-h-screen shrink-0">
        <div>
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#3b562b] text-white flex items-center justify-center shadow-xs">
              {/* Rooster SVG Silhouette */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C10.5 2 9.5 3.2 9.5 4.5C9.5 5.2 9.8 5.8 10.3 6.3C9.1 6.8 8.2 7.9 8.2 9.2C8.2 9.6 8.3 10 8.5 10.4C7.3 10.7 6.5 11.8 6.5 13C6.5 14.7 7.8 16 9.5 16H11V20H9C8.4 20 8 20.4 8 21C8 21.6 8.4 22 9 22H15C15.6 22 16 21.6 16 21C16 20.4 15.6 20 15 20H13V16H14.5C16.2 16 17.5 14.7 17.5 13C17.5 11.8 16.7 10.7 15.5 10.4C15.7 10 15.8 9.6 15.8 9.2C15.8 7.9 14.9 6.8 13.7 6.3C14.2 5.8 14.5 5.2 14.5 4.5C14.5 3.2 13.5 2 12 2Z" />
              </svg>
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 font-sans">
              PoultryCockpit
            </span>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                (item.id === 'dashboard' && (pathname === '/dashboard' || pathname === '/')) ||
                (item.id === 'operations' && pathname.startsWith('/operations')) ||
                (item.id === 'batches' && pathname.startsWith('/batch-centre')) ||
                (item.id === 'intelligence' && pathname.startsWith('/intelligence')) ||
                (item.id === 'settings' && pathname.startsWith('/settings'));

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#e3ebd8] text-[#2d471e] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2d471e]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Pill */}
        <div className="pt-4 border-t border-slate-200/80">
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                JF
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">John Farmer</div>
                <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                  <span>Farm {userRole}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          </button>
        </div>
      </aside>

      {/* Role Switcher Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3b562b]" />
                <span>Simulate Governance Role</span>
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
              Switch roles to test system RBAC validation, override permissions, and audit trail tagging across operations.
            </p>

            <div className="mt-4 space-y-2">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setUserRole(r);
                    setIsRoleModalOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    userRole === r
                      ? 'bg-[#e3ebd8] border-[#3b562b] text-[#2d471e]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>{r}</span>
                  </div>
                  {userRole === r && (
                    <span className="text-[10px] font-bold bg-[#3b562b] text-white px-2 py-0.5 rounded-md">
                      ACTIVE
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
