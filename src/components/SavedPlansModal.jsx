'use client';

import { useState, useEffect } from 'react';
import { X, FolderOpen, Trash2, Calendar, Clock, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

export default function SavedPlansModal({ isOpen, onClose, onLoadPlan }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;

    queueMicrotask(() => {
      if (!ignore) setLoading(true);
    });

    fetch('/api/schedules')
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setPlans(data.schedules || []);
        }
      })
      .catch((err) => console.error('Failed to load saved plans:', err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPlans(plans.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Saved Lecture Plans</h3>
              <p className="text-xs text-slate-500">Access and manage your previously generated course plans</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
              <span>Loading saved schedules...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
              <FolderOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No Saved Plans Found</p>
              <p className="text-[11px] text-slate-400">Generate a lecture plan and click &quot;Save Plan&quot; to view it here anytime.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onLoadPlan(p);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 transition cursor-pointer shadow-xs group flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {p.meta?.subjectCode || 'COURSE'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">
                        {p.meta?.subjectName || 'Untitled Plan'}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {p.meta?.totalHours || p.topics?.length} Hours
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {p.meta?.startDate} {p.meta?.endDate ? `to ${p.meta?.endDate}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      title="Delete Plan"
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 transition">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
