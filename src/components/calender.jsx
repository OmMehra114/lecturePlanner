'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  addDays,
  subDays,
  setHours,
  startOfDay,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Upload,
  Share2,
  Trash2,
  Settings2,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  Users,
  X,
  FileCode,
  Check,
  CalendarDays,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { DEFAULT_HOLIDAYS } from '@/lib/holidays';
import { downloadIcs, downloadJsonCalendar, parseIcsContent } from '@/lib/calendarUtils';
import { useConnectionsQuery } from '@/lib/queries/useConnections';

const COLOR_MAP = {
  national: {
    bg: 'bg-rose-50 border-rose-200 text-rose-700',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    label: 'National Holiday',
  },
  cultural: {
    bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    label: 'University Event',
  },
  vacation: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    label: 'Vacation / Break',
  },
  exam: {
    bg: 'bg-amber-50 border-amber-200 text-amber-700',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'Examination Block',
  },
  custom: {
    bg: 'bg-purple-50 border-purple-200 text-purple-700',
    dot: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Academic Blackout',
  },
};

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export default function EventCalendar({ onHolidaysChange }) {
  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Default Aug 2026 (Semester Start)
  const [view, setView] = useState('month'); // 'month' | 'week' | 'day' | 'agenda'

  // Settings & Preferences (Mirroring Shadcn / ReUI Event Calendar)
  const [settings, setSettings] = useState({
    includeNationalHolidays: true,
    weekStartsOn: 1, // 0 = Sun, 1 = Mon
    weekends: true,
    weekNumbers: false,
    nowIndicator: true,
    markOffDays: true,
    timeZone: 'Asia/Kolkata (IST)',
  });

  // Settings Tab
  const [settingsTab, setSettingsTab] = useState('view'); // 'view' | 'behavior' | 'region'

  // Data & Server State
  const [customEvents, setCustomEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(null);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [selectedDayForAdd, setSelectedDayForAdd] = useState(null);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [newEventType, setNewEventType] = useState('custom');
  const [newEventDescription, setNewEventDescription] = useState('');

  // Share Modal State
  const [selectedPeerId, setSelectedPeerId] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareStatus, setShareStatus] = useState(null);

  // File import ref
  const fileInputRef = useRef(null);

  // Load connections for sharing
  const { data: connectionsData } = useConnectionsQuery();
  const connections = connectionsData?.connections || [];

  // Fetch saved calendar from database on mount
  useEffect(() => {
    let ignore = false;
    fetch('/api/calendar')
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success && Array.isArray(data.customEvents)) {
          setCustomEvents(data.customEvents);
          if (onHolidaysChange) {
            onHolidaysChange(data.customEvents);
          }
        }
      })
      .catch((err) => console.error('Failed to load database calendar:', err))
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Save to database whenever custom events change
  const saveEventsToDatabase = async (updatedList) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: updatedList }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveToast('Calendar synced to database');
        setTimeout(() => setSaveToast(null), 3000);
      }
      if (onHolidaysChange) {
        onHolidaysChange(updatedList);
      }
    } catch (err) {
      console.error('Error saving calendar events:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Combine national holidays with custom events based on settings
  const allEvents = useMemo(() => {
    const list = [...customEvents];
    if (settings.includeNationalHolidays) {
      DEFAULT_HOLIDAYS.forEach((dh) => {
        list.push({
          id: dh.id,
          title: dh.name,
          date: dh.date,
          endDate: dh.endDate,
          type: dh.type || 'national',
          isBuiltIn: true,
        });
      });
    }
    return list;
  }, [customEvents, settings.includeNationalHolidays]);

  // Calendar matrix calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: settings.weekStartsOn });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: settings.weekStartsOn });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Week view dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get events for a specific day
  const getEventsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return allEvents.filter((ev) => {
      if (ev.endDate) {
        return dayStr >= ev.date && dayStr <= ev.endDate;
      }
      return ev.date === dayStr;
    });
  };

  // Handlers for Add Event
  const handleOpenAddModal = (dateStr) => {
    const initialDate = dateStr || format(currentDate, 'yyyy-MM-dd');
    setSelectedDayForAdd(initialDate);
    setNewEventDate(initialDate);
    setNewEventEndDate('');
    setNewEventTitle('');
    setNewEventType('custom');
    setNewEventDescription('');
    setIsAddModalOpen(true);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;

    const newEvent = {
      id: `ev-${Date.now()}`,
      title: newEventTitle.trim(),
      date: newEventDate,
      endDate: newEventEndDate || undefined,
      type: newEventType,
      description: newEventDescription.trim() || undefined,
      isBuiltIn: false,
    };

    const updated = [...customEvents, newEvent];
    setCustomEvents(updated);
    saveEventsToDatabase(updated);
    setIsAddModalOpen(false);
  };

  const handleDeleteEvent = (eventId) => {
    const updated = customEvents.filter((ev) => ev.id !== eventId);
    setCustomEvents(updated);
    saveEventsToDatabase(updated);
  };

  // Import file handler (.ics or .json)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') return;

        let parsed = [];
        if (file.name.endsWith('.ics')) {
          parsed = parseIcsContent(text);
        } else if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          parsed = Array.isArray(json.events) ? json.events : Array.isArray(json) ? json : [];
        }

        if (parsed.length > 0) {
          const merged = [...customEvents, ...parsed];
          setCustomEvents(merged);
          saveEventsToDatabase(merged);
          alert(`Successfully imported ${parsed.length} calendar blackout dates!`);
        } else {
          alert('No valid events found in the uploaded file.');
        }
      } catch (err) {
        console.error('File parsing error:', err);
        alert('Could not parse the calendar file. Please ensure it is a valid .ics or .json file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Share with peer handler
  const handleShareWithPeer = async (e) => {
    e.preventDefault();
    if (!selectedPeerId) return;

    setShareStatus('sending');
    try {
      const res = await fetch('/api/calendar/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedPeerId,
          events: customEvents,
          message: shareMessage,
          calendarTitle: 'Academic Blackout Schedule',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShareStatus('success');
        setTimeout(() => {
          setIsShareModalOpen(false);
          setShareStatus(null);
          setShareMessage('');
        }, 2000);
      } else {
        alert(data.error || 'Failed to share calendar');
        setShareStatus(null);
      }
    } catch (err) {
      console.error('Share calendar error:', err);
      setShareStatus(null);
    }
  };

  // Navigation functions
  const handlePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addDays(currentDate, -7));
    else if (view === 'day') setCurrentDate(subDays(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addDays(currentDate, 7));
    else if (view === 'day') setCurrentDate(addDays(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col font-sans">
      {/* Blackout Engine Active Notice */}
      <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 border-b border-indigo-100 px-6 py-2.5 flex items-center justify-between text-xs text-indigo-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-semibold">
            Lecture Planner Clash Prevention: All {allEvents.length} blackout dates listed here are automatically excluded during course plan generation.
          </span>
        </div>
        {saveToast && (
          <span className="font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {saveToast}
          </span>
        )}
      </div>

      {/* Calendar Top Toolbar (Shadcn EventCalendarNav style) */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation & Current Period Display */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <CalendarIcon className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {view === 'day'
                ? format(currentDate, 'EEEE, MMMM d, yyyy')
                : format(currentDate, 'MMMM yyyy')}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {allEvents.length} Active Blackout Dates • {customEvents.length} Custom Exclusions
            </p>
          </div>

          <div className="flex items-center gap-1 ml-3 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-white text-slate-700 transition"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher, Actions, Settings & Add Event */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Modes (Month, Week, Day, Agenda) */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                view === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 rounded-lg transition ${
                view === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1.5 rounded-lg transition ${
                view === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView('agenda')}
              className={`px-3 py-1.5 rounded-lg transition ${
                view === 'agenda' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda
            </button>
          </div>

          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl transition shadow-xs cursor-pointer"
            title="Import .ics or .json calendar file"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".ics,.json"
            className="hidden"
          />

          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    downloadIcs(allEvents, `Academic_Holidays_${format(currentDate, 'yyyy')}.ics`);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition flex items-center gap-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Standard iCal (.ics)</span>
                </button>
                <button
                  onClick={() => {
                    downloadJsonCalendar(allEvents, `Academic_Holidays_${format(currentDate, 'yyyy')}.json`);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Platform Data (.json)</span>
                </button>
              </div>
            )}
          </div>

          {/* Share to Peer Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl transition shadow-xs cursor-pointer"
            title="Share with fellow faculty members"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Settings Popover Toggle */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isSettingsOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Calendar Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Add Holiday Button */}
          <button
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Holiday</span>
          </button>
        </div>
      </div>

      {/* Settings Popover Drawer (Tabbed: View, Behavior, Region) */}
      {isSettingsOpen && (
        <div className="bg-slate-50 border-b border-slate-200 p-5 animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Settings Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
              <button
                onClick={() => setSettingsTab('view')}
                className={`pb-2 transition ${
                  settingsTab === 'view' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                View Settings
              </button>
              <button
                onClick={() => setSettingsTab('behavior')}
                className={`pb-2 transition ${
                  settingsTab === 'behavior' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Scheduler Behavior
              </button>
              <button
                onClick={() => setSettingsTab('region')}
                className={`pb-2 transition ${
                  settingsTab === 'region' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Region & Academic System
              </button>
            </div>

            {/* Tab 1: View */}
            {settingsTab === 'view' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                  <span className="font-semibold text-slate-700">Include National Holidays</span>
                  <input
                    type="checkbox"
                    checked={settings.includeNationalHolidays}
                    onChange={(e) => setSettings((s) => ({ ...s, includeNationalHolidays: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                  <span className="font-semibold text-slate-700">Show Weekends</span>
                  <input
                    type="checkbox"
                    checked={settings.weekends}
                    onChange={(e) => setSettings((s) => ({ ...s, weekends: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                </label>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Week Starts On</span>
                  <select
                    value={settings.weekStartsOn}
                    onChange={(e) => setSettings((s) => ({ ...s, weekStartsOn: Number(e.target.value) }))}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                  >
                    <option value="1">Monday</option>
                    <option value="0">Sunday</option>
                  </select>
                </div>
              </div>
            )}

            {/* Tab 2: Behavior */}
            {settingsTab === 'behavior' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block">Lecture Planner Automatic Blackout</span>
                  <p className="text-slate-500 text-[11px]">
                    All dates entered as holidays, vacations, or exam blocks are strictly bypassed when generating semester lecture dates.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block">Connection Collaboration</span>
                  <p className="text-slate-500 text-[11px]">
                    When sharing your calendar, colleagues can review your blackout schedule and merge it into their own plan with 1-click.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Region */}
            {settingsTab === 'region' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Time Zone</span>
                  <span className="text-slate-500 font-mono text-[11px]">{settings.timeZone}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Standard Academic Year</span>
                  <span className="text-slate-500 font-semibold">2026 - 2027</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 1: MONTH MATRIX */}
      {view === 'month' && (
        <div className="flex-1 flex flex-col">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-600 py-2.5">
            {(settings.weekStartsOn === 1
              ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            ).map((dayName, idx) => (
              <div key={idx} className="uppercase tracking-wider">
                {dayName}
              </div>
            ))}
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-slate-100 min-h-[560px]">
            {days.map((day, dIdx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const dayIsToday = isToday(day);

              return (
                <div
                  key={dIdx}
                  onClick={() => handleOpenAddModal(format(day, 'yyyy-MM-dd'))}
                  className={`p-2 transition-all min-h-[105px] flex flex-col justify-between group cursor-pointer ${
                    !isCurrentMonth ? 'bg-slate-50/40 text-slate-300' : 'bg-white hover:bg-indigo-50/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        dayIsToday
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(format(day, 'yyyy-MM-dd'));
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-indigo-600 hover:bg-indigo-100 transition"
                      title="Add holiday on this date"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Events */}
                  <div className="space-y-1 mt-1 flex-1">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const color = COLOR_MAP[ev.type] || COLOR_MAP.custom;
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md truncate flex items-center justify-between gap-1 shadow-2xs group/item border ${color.bg}`}
                          title={`${ev.title} (${color.label})`}
                        >
                          <span className="truncate flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${color.dot} shrink-0`} />
                            <span>{ev.title}</span>
                          </span>
                          {!ev.isBuiltIn && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(ev.id);
                              }}
                              className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-600"
                              title="Delete"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <span className="text-[10px] font-bold text-slate-500 pl-1 block">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK VIEW */}
      {view === 'week' && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const dayIsToday = isToday(day);

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 flex flex-col justify-between min-h-[300px] ${
                    dayIsToday ? 'border-indigo-400 bg-indigo-50/20 shadow-xs' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-xs uppercase font-bold text-slate-400 block">
                          {format(day, 'EEE')}
                        </span>
                        <span className="text-lg font-black text-slate-900">
                          {format(day, 'd MMM')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenAddModal(format(day, 'yyyy-MM-dd'))}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {dayEvents.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No scheduled blackout</p>
                      ) : (
                        dayEvents.map((ev) => {
                          const color = COLOR_MAP[ev.type] || COLOR_MAP.custom;
                          return (
                            <div
                              key={ev.id}
                              className={`p-2.5 rounded-xl text-xs font-semibold space-y-1 border ${color.bg}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="block truncate font-bold">{ev.title}</span>
                                {!ev.isBuiltIn && (
                                  <button
                                    onClick={() => handleDeleteEvent(ev.id)}
                                    className="text-slate-400 hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <span className="text-[10px] opacity-80 block">{color.label}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenAddModal(format(day, 'yyyy-MM-dd'))}
                    className="mt-4 w-full py-1.5 text-center text-[11px] font-semibold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition"
                  >
                    + Add Break
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DAY VIEW (With Hourly Teaching Schedule Track) */}
      {view === 'day' && (
        <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
          {/* Day Header Banner */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                Selected Academic Day
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h3>
            </div>

            <button
              onClick={() => handleOpenAddModal(format(currentDate, 'yyyy-MM-dd'))}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Mark This Day as Blackout</span>
            </button>
          </div>

          {/* Active Blackouts on this day */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Blackouts & Holidays on this Date
            </h4>

            {getEventsForDay(currentDate).length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                No holidays or blackout dates scheduled for this day. Lectures will proceed as normal.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getEventsForDay(currentDate).map((ev) => {
                  const color = COLOR_MAP[ev.type] || COLOR_MAP.custom;
                  return (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${color.bg}`}
                    >
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{ev.title}</h5>
                        <p className="text-xs text-slate-600 font-medium">{color.label}</p>
                        {ev.endDate && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Spans {ev.date} to {ev.endDate}
                          </p>
                        )}
                      </div>

                      {!ev.isBuiltIn && (
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hourly Slots (Visual time grid preview) */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Standard Lecture Time-Grid Track
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden">
              {TIME_SLOTS.map((slot, sIdx) => {
                const hasHoliday = getEventsForDay(currentDate).length > 0;
                return (
                  <div key={sIdx} className="flex items-center px-4 py-3 hover:bg-slate-50/50 transition">
                    <span className="w-16 text-xs font-bold text-slate-400 font-mono">{slot}</span>
                    <div className="flex-1">
                      {hasHoliday ? (
                        <span className="text-xs font-semibold text-rose-600/80 bg-rose-50 px-2.5 py-1 rounded-md inline-block">
                          Blackout Active — No Lectures Permitted
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Available teaching slot</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: AGENDA VIEW */}
      {view === 'agenda' && (
        <div className="p-6 divide-y divide-slate-100">
          {allEvents.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No holidays or academic blackout dates configured.
            </div>
          ) : (
            allEvents
              .sort((a, b) => (a.date > b.date ? 1 : -1))
              .map((ev) => {
                const color = COLOR_MAP[ev.type] || COLOR_MAP.custom;
                return (
                  <div key={ev.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center shrink-0">
                        <span className="text-xs font-extrabold text-slate-900 block font-mono">
                          {ev.date.slice(5)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {ev.date.slice(0, 4)}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{ev.title}</h4>
                        <p className="text-xs text-slate-500">
                          {ev.endDate ? `Interval: ${ev.date} to ${ev.endDate}` : `Single Day: ${ev.date}`} •{' '}
                          <span className="capitalize font-medium text-slate-600">{color.label}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${color.badge}`}>
                        {ev.isBuiltIn ? 'National Holiday' : 'Custom Break'}
                      </span>

                      {!ev.isBuiltIn && (
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* MODAL 1: ADD HOLIDAY / BLACKOUT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Add Holiday / Academic Break</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Holiday / Break Title *</label>
                <input
                  type="text"
                  placeholder="e.g. University Tech Fest, Mid-Term Exam, Diwali Break"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Start Date *</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">End Date (Multi-Day)</label>
                  <input
                    type="date"
                    value={newEventEndDate}
                    onChange={(e) => setNewEventEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Category</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="custom">Academic Blackout (Institutional)</option>
                  <option value="vacation">Semester Break / Vacation</option>
                  <option value="exam">Examination Week (No Lectures)</option>
                  <option value="cultural">University Festival / Cultural Event</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Notes / Reason (Optional)</label>
                <textarea
                  rows={2}
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Official notification from dean of academics..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>The lecture scheduler will automatically skip all days within this period.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Save Blackout Day
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SHARE CALENDAR WITH CONNECTIONS */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Share Calendar with Faculty Peers</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {connections.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-800">No Connected Faculty Members</p>
                <p className="text-slate-400">
                  Connect with fellow professors in Network first to share your academic blackout calendar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleShareWithPeer} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Select Colleague</label>
                  <select
                    value={selectedPeerId}
                    onChange={(e) => setSelectedPeerId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Choose Peer --</option>
                    {connections.map((conn) => (
                      <option key={conn.id} value={conn.peer?.id}>
                        {conn.peer?.name || conn.peer?.email} ({conn.peer?.department || 'Faculty'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Optional Message</label>
                  <textarea
                    rows={2}
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    placeholder="Here is our department's approved blackout and exam calendar..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {shareStatus === 'success' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Academic calendar shared successfully!</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={shareStatus === 'sending' || !selectedPeerId}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    {shareStatus === 'sending' ? 'Sending...' : 'Send Calendar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Named alias Pattern if imported as Pattern
export { EventCalendar as Pattern };
