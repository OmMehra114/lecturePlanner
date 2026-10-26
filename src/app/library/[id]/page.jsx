'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ScheduleTable from '@/components/ScheduleTable';
import EditorX from '@/components/editor-x';
import { usePlanQuery } from '@/lib/queries/usePlans';
import { ArrowLeft, AlertCircle, FolderOpen, Calendar, Clock, BookOpen, ShieldCheck, PenTool } from 'lucide-react';

export default function PlanDetailPage({ params }) {
  const unwrappedParams = use(params);
  const planId = unwrappedParams.id;

  const { data, isLoading, isError, error, refetch } = usePlanQuery(planId);

  const plan = data?.plan;
  const isOwner = data?.isOwner;
  const [viewMode, setViewMode] = useState('table');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Breadcrumb & Back Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>/</span>
              <span className="font-mono text-slate-600 font-bold">
                {plan?.meta?.subjectCode || 'PLAN'}
              </span>
              <span>/</span>
              <span className="text-slate-800 font-semibold truncate max-w-xs">
                {plan?.meta?.subjectName || 'Schedule'}
              </span>
            </div>
          </div>

          {plan && (
            <div className="flex items-center gap-2">
              {isOwner ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Personal Database Plan</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <span>Shared Course (Peer Access)</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading course lecture schedule...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-white rounded-3xl border border-red-200 p-10 max-w-lg mx-auto text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Lecture Plan Not Accessible</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {error?.message || 'This plan could not be found or you do not have permission to view it.'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/library"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Course Library</span>
              </Link>
            </div>
          </div>
        )}

        {/* Render Interactive Plan Table or Editor-X */}
        {!isLoading && !isError && plan && (
          <div className="space-y-6">
            {/* View Switcher Bar */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs print:hidden">
              <span className="text-xs font-bold text-slate-700">
                Course Plan View & Export Mode:
              </span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'editor'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Document & PDF Studio</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Grid Table</span>
                </button>
              </div>
            </div>

            {viewMode === 'editor' ? (
              <EditorX
                plan={plan}
                onSave={() => refetch()}
                onClose={() => setViewMode('table')}
              />
            ) : (
              <ScheduleTable
                initialData={plan}
                onOpenEditor={() => setViewMode('editor')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
