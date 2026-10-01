'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Calendar, ShieldCheck, Tag } from 'lucide-react';
import { DEFAULT_HOLIDAYS } from '@/lib/holidays';

export default function HolidayModal({ isOpen, onClose, customHolidays, setCustomHolidays, includeDefaultHolidays, setIncludeDefaultHolidays }) {
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    endDate: '',
    type: 'holiday',
  });

  if (!isOpen) return null;

  const handleAddHoliday = (e) => {
    e.preventDefault();
    if (!newHoliday.name || !newHoliday.date) return;

    const entry = {
      id: `custom-${Date.now()}`,
      name: newHoliday.name.trim(),
      date: newHoliday.date,
      endDate: newHoliday.endDate || undefined,
      type: newHoliday.type,
    };

    setCustomHolidays([...customHolidays, entry]);
    setNewHoliday({ name: '', date: '', endDate: '', type: 'holiday' });
  };

  const handleRemoveCustom = (id) => {
    setCustomHolidays(customHolidays.filter((h) => h.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Holidays & Academic Blackout Days</h3>
              <p className="text-xs text-slate-500">Configure public holidays and custom university breaks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Default Holidays Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <div>
              <span className="font-semibold text-sm text-indigo-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Include National & Academic Calendar Holidays
              </span>
              <p className="text-xs text-indigo-700/80 mt-0.5">
                Auto-skips Republic Day, Independence Day, Gandhi Jayanti, Diwali/Holi breaks, etc.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeDefaultHolidays}
                onChange={(e) => setIncludeDefaultHolidays(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Add New Custom Holiday Form */}
          <form onSubmit={handleAddHoliday} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Custom Holiday / Vacation Break
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Occasion / Event Name</label>
                <input
                  type="text"
                  placeholder="e.g. Annual College Tech Fest"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                <select
                  value={newHoliday.type}
                  onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                >
                  <option value="holiday">Single Day Holiday</option>
                  <option value="vacation">Vacation / Semester Break</option>
                  <option value="exam">Exam Blackout Week</option>
                  <option value="cultural">College Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (Optional Range)</label>
                <input
                  type="date"
                  value={newHoliday.endDate}
                  onChange={(e) => setNewHoliday({ ...newHoliday, endDate: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Rule
            </button>
          </form>

          {/* Custom Holidays List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Custom Defined Rules ({customHolidays.length})
            </h4>

            {customHolidays.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded-lg">
                No custom holidays added yet.
              </p>
            ) : (
              <div className="space-y-2">
                {customHolidays.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium capitalize">
                        {h.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{h.name}</span>
                      <span className="text-xs text-slate-500">
                        ({h.date}{h.endDate ? ` to ${h.endDate}` : ''})
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveCustom(h.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Default Holidays Reference preview */}
          {includeDefaultHolidays && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Active Built-in Holidays ({DEFAULT_HOLIDAYS.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {DEFAULT_HOLIDAYS.map((dh) => (
                  <div key={dh.id} className="p-2 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="font-medium text-slate-700 truncate">{dh.name}</span>
                    <span className="text-slate-500 font-mono text-[11px] shrink-0 ml-2">{dh.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
