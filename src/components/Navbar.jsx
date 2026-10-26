'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Calendar, BookOpen, FolderOpen, Users } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useConnectionsQuery } from '@/lib/queries/useConnections';

export default function Navbar({ onReset, hasResults, onOpenSavedPlans }) {
  const pathname = usePathname();
  const { data } = useConnectionsQuery();
  const pendingCount = (data?.pending?.received || []).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  LecturePlan <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">LP</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Intelligent Academic Syllabus & Schedule Generator</p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden sm:flex items-center gap-1.5 ml-2">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                pathname === '/dashboard'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Planner
            </Link>
            <Link
              href="/connections"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                pathname === '/connections'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Connections</span>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-3">
          {onOpenSavedPlans && (
            <button
              onClick={onOpenSavedPlans}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition shadow-xs cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Saved Plans</span>
            </button>
          )}

          {hasResults && onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>New Plan</span>
            </button>
          )}

          <div className="pl-1 border-l border-slate-800 flex items-center">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  );
}
