'use client';

import { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  Calendar,
  Clock,
  FileSpreadsheet,
  FileCode,
  Search,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Check,
  Save,
  BookmarkCheck,
  ChevronDown
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToJSON } from '../lib/exportUtils';
import { scheduleLectures } from '../lib/scheduler';

export default function ScheduleTable({ initialData, onUpdate }) {
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'overflow', 'completed'
  const [editingId, setEditingId] = useState(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { meta = {}, topics = [], stats = {} } = data || {};

  // Recalculate schedule whenever topics change
  const triggerRecalculation = (updatedTopics) => {
    const schedulingResult = scheduleLectures(updatedTopics, {
      startDate: meta.startDate,
      endDate: meta.endDate,
      teachingDays: meta.teachingDays || [1, 2, 3, 4, 5],
      includeFridays: meta.includeFridays !== false,
      customHolidays: meta.customHolidays || [],
      includeDefaultHolidays: meta.includeDefaultHolidays !== false,
    });

    const newData = {
      ...data,
      topics: schedulingResult.topics,
      stats: schedulingResult.stats,
    };

    setData(newData);
    if (onUpdate) onUpdate(newData);
  };

  // Save plan to backend
  const handleSavePlan = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Reordering handlers
  const handleMove = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topics.length) return;

    const newTopics = [...topics];
    const [moved] = newTopics.splice(index, 1);
    newTopics.splice(targetIndex, 0, moved);

    const reindexed = newTopics.map((t, idx) => ({ ...t, srNo: idx + 1 }));
    triggerRecalculation(reindexed);
  };

  // Edit topic field
  const handleTopicChange = (index, field, value) => {
    const newTopics = [...topics];
    newTopics[index] = {
      ...newTopics[index],
      [field]: field === 'lectures' ? Math.max(1, parseInt(value, 10) || 1) : value,
    };
    triggerRecalculation(newTopics);
  };

  // Delete topic
  const handleDeleteTopic = (index) => {
    if (topics.length <= 1) return;
    const newTopics = topics.filter((_, idx) => idx !== index).map((t, idx) => ({ ...t, srNo: idx + 1 }));
    triggerRecalculation(newTopics);
  };

  // Add new topic row
  const handleAddTopic = () => {
    const newTopic = {
      srNo: topics.length + 1,
      unit: 'Custom Module',
      topic: 'New Lecture Topic / Discussion',
      subTopics: [],
      lectures: 1,
      targetDates: [],
      dateRange: '',
      isOverflow: false,
      completed: false,
    };
    triggerRecalculation([...topics, newTopic]);
  };

  // Toggle completion
  const handleToggleCompleted = (index) => {
    const newTopics = [...topics];
    newTopics[index] = {
      ...newTopics[index],
      completed: !newTopics[index].completed,
    };
    setData({ ...data, topics: newTopics });
  };

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return topics.filter((item) => {
      const matchesSearch =
        (item.topic || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.unit || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'overflow') return item.isOverflow;
      if (statusFilter === 'completed') return item.completed;
      return true;
    });
  }, [topics, searchQuery, statusFilter]);

  const scheduledHours = topics.reduce((acc, t) => acc + (parseInt(t.lectures, 10) || 1), 0);
  const targetHours = meta.totalHours || 40;
  const isBalanced = scheduledHours === targetHours;

  return (
    <div className="mt-8 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-ink-dark rounded-2xl p-6 sm:p-8 text-ink-base shadow-xl border border-ink-light">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-ink-accent/20 text-ink-accent border border-ink-accent/30 text-xs font-bold font-mono">
                {meta.subjectCode || 'ACADEMIC PLAN'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-ink-light/20 text-ink-light border border-ink-light/30 text-xs font-medium">
                {meta.credits || 3} Credits
              </span>
              {stats?.semesterExceeded && (
                <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Semester End Exceeded
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-base">
              {meta.subjectName || 'Course'} Lecture Schedule
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-light">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-ink-accent" />
                Semester: <strong className="text-white">{meta.startDate}</strong> to <strong className="text-white">{meta.endDate || 'TBD'}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ink-accent" />
                Est. Finish: <strong className="text-white">{stats?.completionEstimatedDate || 'Calculated'}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            {/* Save Button */}
            <button
              onClick={handleSavePlan}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md transition ${savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
            >
              {savedSuccess ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-300" />
                  <span>Plan Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-indigo-400" />
                  <span>{isSaving ? 'Saving...' : 'Save Plan'}</span>
                </>
              )}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs shadow-lg shadow-indigo-600/30 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export Plan</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {exportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => { exportToExcel(data); setExportDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-100 flex items-center gap-2.5 text-slate-700"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => { exportToCSV(data); setExportDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-100 flex items-center gap-2.5 text-slate-700"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Export CSV (.csv)
                  </button>
                  <button
                    onClick={() => { exportToJSON(data); setExportDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-100 flex items-center gap-2.5 text-slate-700"
                  >
                    <FileCode className="w-4 h-4 text-amber-600" /> Export JSON Schema
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition"
            >
              <Printer className="w-4 h-4 text-slate-400" /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* 2. Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block mb-1">Target Hours</span>
            <span className="text-base font-bold text-white">{targetHours} hrs</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block mb-1">Scheduled Hours</span>
            <span className={`text-base font-bold ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
              {scheduledHours} hrs {isBalanced ? '✓ Balanced' : `(${scheduledHours - targetHours > 0 ? '+' : ''}${scheduledHours - targetHours})`}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block mb-1">Total Modules/Topics</span>
            <span className="text-base font-bold text-white">{topics.length} Sections</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block mb-1">Teaching Days Required</span>
            <span className="text-base font-bold text-indigo-300">{stats?.totalDays || scheduledHours} Days</span>
          </div>
        </div>
      </div>

      {/* 3. Table Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topics or units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white text-slate-800 transition"
          />
        </div>

        {/* Filter & Add Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All ({topics.length})
            </button>
            <button
              onClick={() => setStatusFilter('overflow')}
              className={`px-3 py-1 rounded-lg transition ${statusFilter === 'overflow' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Overflow ({topics.filter((t) => t.isOverflow).length})
            </button>
          </div>

          <button
            onClick={handleAddTopic}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-200 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Topic Row
          </button>
        </div>
      </div>

      {/* 4. Main Lecture Plan Table */}
      <div className="bg-ink-base rounded-lg border-2 border-ink-dark overflow-hidden print:border-none print:shadow-none shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print-table">
            <thead>
              <tr className="bg-ink-light/20 text-ink-dark text-sm font-bold border-b-2 border-ink-dark">
                <th className="py-3 px-3 w-16 text-center border-r-2 border-ink-dark">Sr. No.</th>
                <th className="py-3 px-4 border-r-2 border-ink-dark">Topics Covered</th>
                <th className="py-3 px-3 w-32 text-center border-r-2 border-ink-dark">No. of Lectures</th>
                <th className="py-3 px-4 w-48 border-r-2 border-ink-dark print:hidden">Dates</th>
                <th className="py-3 px-3 w-24 text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-ink-dark text-sm text-ink-dark font-medium">
              {filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No matching lecture topics found.
                  </td>
                </tr>
              ) : (
                filteredTopics.map((item) => {
                  const originalIndex = topics.findIndex((t) => t.srNo === item.srNo);
                  const isEditing = editingId === item.srNo;

                  return (
                    <tr
                      key={item.srNo}
                      className={`hover:bg-slate-50/70 transition-colors ${item.isOverflow ? 'bg-amber-50/40' : item.completed ? 'bg-emerald-50/30' : ''
                        }`}
                    >
                      {/* Sr No */}
                      <td className="py-3 px-3 text-center border-r-2 border-ink-dark">
                        {item.srNo}
                      </td>

                      {/* Topics Covered */}
                      <td className="py-3 px-4 border-r-2 border-ink-dark">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={item.topic}
                            onChange={(e) => handleTopicChange(originalIndex, 'topic', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-ink-light rounded text-xs"
                          />
                        ) : (
                          <div className="space-y-1">
                            <p className={`${item.completed ? 'line-through text-ink-light' : ''}`}>
                              {item.topic}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* No. of Lectures */}
                      <td className="py-3 px-3 text-center border-r-2 border-ink-dark">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={item.lectures}
                            onChange={(e) => handleTopicChange(originalIndex, 'lectures', e.target.value)}
                            className="w-14 text-center font-bold px-1 py-1 bg-white border border-ink-light rounded-lg text-ink-dark text-xs"
                          />
                        ) : (
                          <span className="font-bold">{item.lectures}</span>
                        )}
                      </td>

                      {/* Target Scheduled Dates */}
                      <td className="py-3 px-4 border-r-2 border-ink-dark print:hidden text-xs">
                        {item.targetDates && item.targetDates.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {item.targetDates.map((dateStr, dIdx) => (
                                <span
                                  key={dIdx}
                                  className="inline-block px-1.5 py-0.5 rounded bg-ink-light/30"
                                >
                                  {dateStr}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-light font-medium italic">{item.dateRange || 'Pending'}</span>
                        )}
                      </td>

                      {/* Actions: Reorder, Edit, Delete */}
                      <td className="py-3 px-3 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMove(originalIndex, 'up')}
                            disabled={originalIndex === 0}
                            title="Move Topic Up"
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMove(originalIndex, 'down')}
                            disabled={originalIndex === topics.length - 1}
                            title="Move Topic Down"
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingId(isEditing ? null : item.srNo)}
                            title={isEditing ? 'Save' : 'Edit'}
                            className={`p-1 rounded transition ${isEditing ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                          >
                            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTopic(originalIndex)}
                            title="Delete Row"
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



// 'use client';

// import { useState, useMemo } from 'react';
// import {
//   Download,
//   Printer,
//   Calendar,
//   Clock,
//   FileSpreadsheet,
//   FileCode,
//   Search,
//   Plus,
//   Trash2,
//   ArrowUp,
//   ArrowDown,
//   AlertTriangle,
//   Check,
//   Save,
//   ChevronDown,
//   BookOpen
// } from 'lucide-react';
// import { exportToCSV, exportToExcel, exportToJSON } from '@/lib/exportUtils';
// import { scheduleLectures } from '@/lib/scheduler';

// export default function ScheduleTable({ initialData, onUpdate }) {
//   const [data, setData] = useState(initialData);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'overflow', 'completed'
//   const [editingId, setEditingId] = useState(null);
//   const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [savedSuccess, setSavedSuccess] = useState(false);

//   const { meta = {}, topics = [], stats = {} } = data || {};

//   // Recalculate schedule whenever topics change
//   const triggerRecalculation = (updatedTopics) => {
//     const schedulingResult = scheduleLectures(updatedTopics, {
//       startDate: meta.startDate,
//       endDate: meta.endDate,
//       teachingDays: meta.teachingDays || [1, 2, 3, 4, 5],
//       includeFridays: meta.includeFridays !== false,
//       customHolidays: meta.customHolidays || [],
//       includeDefaultHolidays: meta.includeDefaultHolidays !== false,
//     });

//     const newData = {
//       ...data,
//       topics: schedulingResult.topics,
//       stats: schedulingResult.stats,
//     };

//     setData(newData);
//     if (onUpdate) onUpdate(newData);
//   };

//   // Save plan to backend
//   const handleSavePlan = async () => {
//     setIsSaving(true);
//     setSavedSuccess(false);
//     try {
//       const res = await fetch('/api/schedules', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });
//       const resData = await res.json();
//       if (resData.success) {
//         setSavedSuccess(true);
//         setTimeout(() => setSavedSuccess(false), 3000);
//       }
//     } catch (err) {
//       console.error('Error saving schedule:', err);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Reordering handlers
//   const handleMove = (index, direction) => {
//     const targetIndex = direction === 'up' ? index - 1 : index + 1;
//     if (targetIndex < 0 || targetIndex >= topics.length) return;

//     const newTopics = [...topics];
//     const [moved] = newTopics.splice(index, 1);
//     newTopics.splice(targetIndex, 0, moved);

//     const reindexed = newTopics.map((t, idx) => ({ ...t, srNo: idx + 1 }));
//     triggerRecalculation(reindexed);
//   };

//   // Edit topic field
//   const handleTopicChange = (index, field, value) => {
//     const newTopics = [...topics];
//     newTopics[index] = {
//       ...newTopics[index],
//       [field]: field === 'lectures' ? Math.max(1, parseInt(value, 10) || 1) : value,
//     };
//     triggerRecalculation(newTopics);
//   };

//   // Delete topic
//   const handleDeleteTopic = (index) => {
//     if (topics.length <= 1) return;
//     const newTopics = topics.filter((_, idx) => idx !== index).map((t, idx) => ({ ...t, srNo: idx + 1 }));
//     triggerRecalculation(newTopics);
//   };

//   // Add new topic row
//   const handleAddTopic = () => {
//     const newTopic = {
//       srNo: topics.length + 1,
//       unit: 'Module ' + (Math.floor(topics.length / 4) + 1),
//       topic: 'New Lecture Topic / Discussion',
//       subTopics: [],
//       lectures: 1,
//       targetDates: [],
//       dateRange: '',
//       isOverflow: false,
//       completed: false,
//     };
//     triggerRecalculation([...topics, newTopic]);
//   };

//   // Toggle completion
//   const handleToggleCompleted = (index) => {
//     const newTopics = [...topics];
//     newTopics[index] = {
//       ...newTopics[index],
//       completed: !newTopics[index].completed,
//     };
//     setData({ ...data, topics: newTopics });
//   };

//   // Filtered topics
//   const filteredTopics = useMemo(() => {
//     return topics.filter((item) => {
//       const matchesSearch =
//         (item.topic || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (item.unit || '').toLowerCase().includes(searchQuery.toLowerCase());

//       if (!matchesSearch) return false;

//       if (statusFilter === 'overflow') return item.isOverflow;
//       if (statusFilter === 'completed') return item.completed;
//       return true;
//     });
//   }, [topics, searchQuery, statusFilter]);

//   const scheduledHours = topics.reduce((acc, t) => acc + (parseInt(t.lectures, 10) || 1), 0);
//   const targetHours = meta.totalHours || 40;
//   const isBalanced = scheduledHours === targetHours;

//   return (
//     <div className="max-w-6xl mx-auto my-8 space-y-6 text-slate-800 font-sans px-4 sm:px-6">
//       {/* 1. Header & Summary Section */}
//       <header className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
//         <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-slate-100">
//           <div className="space-y-1.5">
//             <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
//               <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
//                 {meta.subjectCode || 'ACADEMIC PLAN'}
//               </span>
//               <span>•</span>
//               <span>{meta.credits || 3} Credits</span>
//               {stats?.semesterExceeded && (
//                 <>
//                   <span>•</span>
//                   <span className="text-amber-700 font-medium flex items-center gap-1">
//                     <AlertTriangle className="w-3.5 h-3.5" /> Exceeds Semester Limit
//                   </span>
//                 </>
//               )}
//             </div>

//             <h1 className="text-2xl font-bold tracking-tight text-slate-900">
//               {meta.subjectName || 'Course'} Syllabus & Lecture Schedule
//             </h1>

//             <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
//               <span className="flex items-center gap-1.5">
//                 <Calendar className="w-3.5 h-3.5 text-slate-400" />
//                 Semester: <strong className="font-semibold text-slate-800">{meta.startDate}</strong> — <strong className="font-semibold text-slate-800">{meta.endDate || 'TBD'}</strong>
//               </span>
//               <span className="flex items-center gap-1.5">
//                 <Clock className="w-3.5 h-3.5 text-slate-400" />
//                 Est. Completion: <strong className="font-semibold text-slate-800">{stats?.completionEstimatedDate || 'Calculated'}</strong>
//               </span>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-wrap items-center gap-2.5 print:hidden">
//             <button
//               onClick={handleSavePlan}
//               disabled={isSaving}
//               className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-50"
//             >
//               <Save className="w-3.5 h-3.5" />
//               <span>{savedSuccess ? 'Saved' : isSaving ? 'Saving...' : 'Save Schedule'}</span>
//             </button>

//             {/* Export Dropdown */}
//             <div className="relative">
//               <button
//                 type="button"
//                 onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
//                 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
//               >
//                 <Download className="w-3.5 h-3.5 text-slate-500" />
//                 <span>Export</span>
//                 <ChevronDown className="w-3 h-3 text-slate-400" />
//               </button>

//               {exportDropdownOpen && (
//                 <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-md shadow-md py-1 z-50 text-xs">
//                   <button
//                     onClick={() => { exportToExcel(data); setExportDropdownOpen(false); }}
//                     className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
//                   >
//                     <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" /> Excel (.xlsx)
//                   </button>
//                   <button
//                     onClick={() => { exportToCSV(data); setExportDropdownOpen(false); }}
//                     className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
//                   >
//                     <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" /> CSV (.csv)
//                   </button>
//                   <button
//                     onClick={() => { exportToJSON(data); setExportDropdownOpen(false); }}
//                     className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
//                   >
//                     <FileCode className="w-3.5 h-3.5 text-slate-400" /> JSON
//                   </button>
//                 </div>
//               )}
//             </div>

//             <button
//               onClick={() => window.print()}
//               className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
//             >
//               <Printer className="w-3.5 h-3.5 text-slate-500" /> Print
//             </button>
//           </div>
//         </div>

//         {/* Key Metrics Bar */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
//           <div>
//             <span className="text-slate-500 block mb-0.5">Target Hours</span>
//             <span className="text-sm font-semibold text-slate-900">{targetHours} hrs</span>
//           </div>

//           <div>
//             <span className="text-slate-500 block mb-0.5">Scheduled Hours</span>
//             <span className="text-sm font-semibold text-slate-900">
//               {scheduledHours} hrs {isBalanced ? <span className="text-slate-500 font-normal">(Balanced)</span> : <span className="text-amber-700 font-normal">({scheduledHours - targetHours > 0 ? '+' : ''}{scheduledHours - targetHours})</span>}
//             </span>
//           </div>

//           <div>
//             <span className="text-slate-500 block mb-0.5">Modules / Sections</span>
//             <span className="text-sm font-semibold text-slate-900">{topics.length}</span>
//           </div>

//           <div>
//             <span className="text-slate-500 block mb-0.5">Teaching Days</span>
//             <span className="text-sm font-semibold text-slate-900">{stats?.totalDays || scheduledHours} Days</span>
//           </div>
//         </div>
//       </header>

//       {/* 2. Controls & Table Bar */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
//         {/* Search Input */}
//         <div className="relative w-full sm:w-64">
//           <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//           <input
//             type="text"
//             placeholder="Filter topics or modules..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-500 text-slate-800 transition"
//           />
//         </div>

//         {/* Filter & Add Actions */}
//         <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
//           <div className="flex border border-slate-300 rounded-md bg-white p-0.5 text-xs">
//             <button
//               onClick={() => setStatusFilter('all')}
//               className={`px-2.5 py-1 rounded transition ${statusFilter === 'all' ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
//             >
//               All ({topics.length})
//             </button>
//             <button
//               onClick={() => setStatusFilter('overflow')}
//               className={`px-2.5 py-1 rounded transition ${statusFilter === 'overflow' ? 'bg-slate-100 font-medium text-amber-800' : 'text-slate-600 hover:text-slate-900'}`}
//             >
//               Overflow ({topics.filter((t) => t.isOverflow).length})
//             </button>
//           </div>

//           <button
//             onClick={handleAddTopic}
//             className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-medium text-xs rounded-md hover:bg-slate-50 transition"
//           >
//             <Plus className="w-3.5 h-3.5 text-slate-500" /> Add Row
//           </button>
//         </div>
//       </div>

//       {/* 3. Main Schedule Table */}
//       <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs print:border-none print:shadow-none">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse text-xs">
//             <thead>
//               <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
//                 <th className="py-2.5 px-3 w-12 text-center">#</th>
//                 <th className="py-2.5 px-4 w-36">Module</th>
//                 <th className="py-2.5 px-4">Topic & Key Concepts</th>
//                 <th className="py-2.5 px-3 w-20 text-center">Hours</th>
//                 <th className="py-2.5 px-4 w-60">Scheduled Dates</th>
//                 <th className="py-2.5 px-3 w-20 text-center print:hidden">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-slate-700">
//               {filteredTopics.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="py-8 text-center text-slate-400">
//                     No matching lecture topics found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredTopics.map((item) => {
//                   const originalIndex = topics.findIndex((t) => t.srNo === item.srNo);
//                   const isEditing = editingId === item.srNo;

//                   return (
//                     <tr
//                       key={item.srNo}
//                       className={`hover:bg-slate-50/50 transition-colors ${item.isOverflow ? 'bg-amber-50/30' : item.completed ? 'bg-slate-50/70' : ''
//                         }`}
//                     >
//                       {/* Sr No & Completion Toggle */}
//                       <td className="py-2.5 px-3 text-center">
//                         <div className="flex items-center justify-center gap-1.5">
//                           <input
//                             type="checkbox"
//                             checked={item.completed || false}
//                             onChange={() => handleToggleCompleted(originalIndex)}
//                             className="w-3.5 h-3.5 rounded border-slate-300 text-slate-800 focus:ring-0 cursor-pointer print:hidden"
//                             title="Mark as completed"
//                           />
//                           <span className={`font-mono ${item.completed ? 'line-through text-slate-400' : 'text-slate-500'}`}>
//                             {item.srNo}
//                           </span>
//                         </div>
//                       </td>

//                       {/* Unit Name */}
//                       <td className="py-2.5 px-4 font-medium text-slate-800">
//                         {isEditing ? (
//                           <input
//                             type="text"
//                             value={item.unit || ''}
//                             onChange={(e) => handleTopicChange(originalIndex, 'unit', e.target.value)}
//                             className="w-full px-2 py-0.5 bg-white border border-slate-300 rounded text-xs focus:outline-none"
//                           />
//                         ) : (
//                           <span>{item.unit || `Module ${Math.ceil(item.srNo / 4)}`}</span>
//                         )}
//                       </td>

//                       {/* Topic Title & SubTopics */}
//                       <td className="py-2.5 px-4">
//                         {isEditing ? (
//                           <textarea
//                             rows={2}
//                             value={item.topic}
//                             onChange={(e) => handleTopicChange(originalIndex, 'topic', e.target.value)}
//                             className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none"
//                           />
//                         ) : (
//                           <div className="space-y-1">
//                             <p className={`font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
//                               {item.topic}
//                             </p>
//                             {item.subTopics && item.subTopics.length > 0 && (
//                               <div className="flex flex-wrap gap-1">
//                                 {item.subTopics.map((sub, sIdx) => (
//                                   <span
//                                     key={sIdx}
//                                     className="inline-block px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]"
//                                   >
//                                     • {sub}
//                                   </span>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </td>

//                       {/* Hours / Lectures */}
//                       <td className="py-2.5 px-3 text-center">
//                         <div className="flex items-center justify-center gap-1">
//                           <input
//                             type="number"
//                             min="1"
//                             max="20"
//                             value={item.lectures}
//                             onChange={(e) => handleTopicChange(originalIndex, 'lectures', e.target.value)}
//                             className="w-12 text-center px-1 py-0.5 border border-slate-200 rounded text-xs focus:border-slate-400 focus:outline-none"
//                           />
//                           <span className="text-[11px] text-slate-400">hr</span>
//                         </div>
//                       </td>

//                       {/* Target Scheduled Dates */}
//                       <td className="py-2.5 px-4">
//                         {item.targetDates && item.targetDates.length > 0 ? (
//                           <div className="space-y-1">
//                             <div className="flex flex-wrap gap-1">
//                               {item.targetDates.map((dateStr, dIdx) => (
//                                 <span
//                                   key={dIdx}
//                                   className={`inline-block px-1.5 py-0.5 text-[11px] font-mono rounded ${item.isOverflow
//                                       ? 'bg-amber-100/60 text-amber-900 border border-amber-200'
//                                       : 'bg-slate-100 text-slate-700'
//                                     }`}
//                                 >
//                                   {dateStr}
//                                 </span>
//                               ))}
//                             </div>
//                             {item.isOverflow && (
//                               <p className="text-[10px] text-amber-800 font-medium flex items-center gap-1">
//                                 <AlertTriangle className="w-3 h-3" /> Exceeds Semester End
//                               </p>
//                             )}
//                           </div>
//                         ) : (
//                           <span className="text-slate-400 italic">{item.dateRange || 'Pending'}</span>
//                         )}
//                       </td>

//                       {/* Actions: Reorder, Edit, Delete */}
//                       <td className="py-2.5 px-3 text-center print:hidden">
//                         <div className="flex items-center justify-center gap-1">
//                           <button
//                             type="button"
//                             onClick={() => handleMove(originalIndex, 'up')}
//                             disabled={originalIndex === 0}
//                             title="Move Topic Up"
//                             className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
//                           >
//                             <ArrowUp className="w-3.5 h-3.5" />
//                           </button>

//                           <button
//                             type="button"
//                             onClick={() => handleMove(originalIndex, 'down')}
//                             disabled={originalIndex === topics.length - 1}
//                             title="Move Topic Down"
//                             className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
//                           >
//                             <ArrowDown className="w-3.5 h-3.5" />
//                           </button>

//                           <button
//                             type="button"
//                             onClick={() => setEditingId(isEditing ? null : item.srNo)}
//                             title={isEditing ? 'Save' : 'Edit'}
//                             className={`p-1 rounded transition ${isEditing ? 'text-slate-900 bg-slate-100' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
//                           >
//                             {isEditing ? <Check className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
//                           </button>

//                           <button
//                             type="button"
//                             onClick={() => handleDeleteTopic(originalIndex)}
//                             title="Delete Row"
//                             className="p-1 rounded text-slate-400 hover:text-red-700 hover:bg-slate-100"
//                           >
//                             <Trash2 className="w-3.5 h-3.5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }