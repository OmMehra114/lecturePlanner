'use client';

import { Sparkles, Calendar, BookOpen, FolderOpen } from 'lucide-react';

export default function Navbar({ onReset, hasResults, onOpenSavedPlans }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
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
        </div>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSavedPlans}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition shadow-xs"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Saved Plans</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Scheduling Engine</span>
          </div>

          {hasResults && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>New Plan</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
