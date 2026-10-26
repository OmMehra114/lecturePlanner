'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar as CalendarIcon, 
  FileText, 
  UploadCloud, 
  Sparkles, 
  Settings2, 
  Layers, 
  Clock, 
  Check, 
  X,
  FileCode2,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_SYLLABI } from './SamplePresets';
import HolidayModal from './HolidayModal';
import { CourseFormSchema } from '../lib/schema';

const DAYS_OF_WEEK = [
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' },
];

export default function CourseForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    department: '',
    credits: 3,
    totalHours: 40,
    startDate: '2026-08-03',
    endDate: '2026-11-27',
    teachingDays: [1, 2, 3, 4, 5], // Mon to Fri
    includeFridays: true,
    syllabusText: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [customHolidays, setCustomHolidays] = useState([]);
  const [includeDefaultHolidays, setIncludeDefaultHolidays] = useState(true);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Auto-sync custom blackout dates & holidays configured in the Academic Calendar
  useEffect(() => {
    fetch('/api/calendar')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.customEvents) && data.customEvents.length > 0) {
          setCustomHolidays((prev) => {
            const existingIds = new Set(prev.map((h) => h.id));
            const newEvents = data.customEvents.filter((ev) => !existingIds.has(ev.id));
            return [...prev, ...newEvents];
          });
        }
      })
      .catch((err) => console.error('Failed to load custom calendar holidays:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const toggleTeachingDay = (dayId) => {
    setFormData((prev) => {
      const exists = prev.teachingDays.includes(dayId);
      const updated = exists
        ? prev.teachingDays.filter((d) => d !== dayId)
        : [...prev.teachingDays, dayId].sort();
      return { ...prev, teachingDays: updated };
    });
    if (fieldErrors.teachingDays) {
      setFieldErrors((prev) => ({ ...prev, teachingDays: undefined }));
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (fieldErrors.syllabusText) {
        setFieldErrors((prev) => ({ ...prev, syllabusText: undefined }));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (fieldErrors.syllabusText) {
        setFieldErrors((prev) => ({ ...prev, syllabusText: undefined }));
      }
    }
  };

  const handleLoadPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      subjectName: preset.subjectName,
      subjectCode: preset.subjectCode,
      credits: preset.credits,
      totalHours: preset.totalHours,
      startDate: preset.startDate,
      endDate: preset.endDate,
      syllabusText: preset.syllabusText,
    }));
    setFile(null);
    setFieldErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFieldErrors({});

    // Normalize holidays to ensure clean object structure
    const normalizedHolidays = customHolidays.map((h) => ({
      ...h,
      name: h.name || h.title || 'Academic Blackout',
      title: h.title || h.name || 'Academic Blackout',
      date: h.date,
      endDate: h.endDate,
      type: h.type || 'custom',
    }));

    // Zod validation with CourseFormSchema
    const result = CourseFormSchema.safeParse({
      ...formData,
      customHolidays: normalizedHolidays,
    });

    const newErrors = {};

    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      Object.keys(flattened).forEach((key) => {
        newErrors[key] = flattened[key][0];
      });
    }

    // Custom check: either syllabus file or syllabus text must be provided
    if (!file && !formData.syllabusText.trim()) {
      newErrors.syllabusText = 'Please provide syllabus text or upload a syllabus document';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      console.warn('CourseForm validation errors:', newErrors);
      return;
    }

    onSubmit({
      ...formData,
      file,
      customHolidays: normalizedHolidays,
      includeDefaultHolidays,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Presets Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 p-4 rounded-2xl border border-slate-800 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Quick Demo Presets</h2>
            <p className="text-xs text-slate-400">Load sample syllabi to test the scheduling AI instantly</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {SAMPLE_SYLLABI.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadPreset(preset)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-indigo-600/80 hover:text-white text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <span>{preset.subjectCode}</span>
              <span className="text-slate-400">({preset.totalHours}h)</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Course & Calendar Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Course Information Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Course Metadata</h3>
                    <p className="text-xs text-slate-500">Subject identification and academic weight</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Subject / Course Name *
                  </label>
                  <input
                    type="text"
                    name="subjectName"
                    value={formData.subjectName}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineering & Architecture"
                    className={`w-full text-sm px-3.5 py-2.5 bg-slate-50/50 border rounded-xl focus:ring-2 focus:bg-white text-slate-900 transition ${
                      fieldErrors.subjectName
                        ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                        : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                    }`}
                  />
                  {fieldErrors.subjectName && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{fieldErrors.subjectName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleChange}
                    placeholder="e.g. CS-301"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white text-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Academic Credits
                  </label>
                  <input
                    type="number"
                    name="credits"
                    min="1"
                    max="10"
                    value={formData.credits}
                    onChange={handleChange}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white text-slate-900 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
                    <span>Target Allocated Hours (Total Lectures) *</span>
                    <span className="text-indigo-600 font-semibold text-xs">{formData.totalHours} Lectures</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      name="totalHours"
                      min="10"
                      max="90"
                      step="1"
                      value={formData.totalHours}
                      onChange={handleChange}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <input
                      type="number"
                      name="totalHours"
                      min="1"
                      max="150"
                      value={formData.totalHours}
                      onChange={handleChange}
                      className="w-20 text-center font-bold text-sm px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Calendar Constraints Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Semester Calendar Constraints</h3>
                    <p className="text-xs text-slate-500">Date boundaries & weekly teaching pattern</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/calendar"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition"
                    title="Open full interactive academic calendar"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Academic Calendar ({customHolidays.length} Blackouts)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsHolidayModalOpen(true)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Holidays ({customHolidays.length + (includeDefaultHolidays ? 14 : 0)})</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Semester Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full text-sm px-3.5 py-2.5 bg-slate-50/50 border rounded-xl focus:ring-2 focus:border-indigo-600 text-slate-900 transition ${
                      fieldErrors.startDate ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
                    }`}
                  />
                  {fieldErrors.startDate && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{fieldErrors.startDate}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Semester End Date (Target Limit)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 transition"
                  />
                </div>
              </div>

              {/* Teaching Days Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Active Weekly Lecture Days
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = formData.teachingDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleTeachingDay(day.id)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{day.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-indigo-200" />}
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.teachingDays && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{fieldErrors.teachingDays}</span>
                  </p>
                )}
              </div>

              {/* Friday Option */}
              <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-700">
                  <span className="font-semibold block">Include Fridays in Schedule</span>
                  <span className="text-slate-500">Uncheck if Friday is reserved for lab/seminar days only</span>
                </div>
                <input
                  type="checkbox"
                  id="includeFridays"
                  name="includeFridays"
                  checked={formData.includeFridays}
                  onChange={handleChange}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Syllabus Content & File Dropzone (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col h-full">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Syllabus Material</h3>
                  <p className="text-xs text-slate-500">Upload document or paste text directly</p>
                </div>
              </div>

              {/* File Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer relative ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : file
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.json"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-left truncate">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                        <FileCode2 className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-1">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Drag & Drop Syllabus File or <span className="text-indigo-600 underline">Browse</span>
                    </p>
                    <p className="text-[11px] text-slate-400">Supports PDF, DOCX, TXT, JSON (up to 15MB)</p>
                  </div>
                )}
              </div>

              {/* Paste Text Area */}
              <div className="flex-1 flex flex-col space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Or Paste Syllabus Text
                  </label>
                  {formData.syllabusText && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, syllabusText: '' })}
                      className="text-[11px] text-slate-400 hover:text-slate-600 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
                  <textarea
                    name="syllabusText"
                    rows={6}
                    value={formData.syllabusText}
                    onChange={handleChange}
                    placeholder="Paste chapter outlines, module topics, or curriculum breakdown..."
                    className={`w-full flex-1 text-xs px-3.5 py-2.5 bg-slate-50/50 border rounded-xl focus:ring-2 focus:bg-white text-slate-900 transition font-mono ${
                      fieldErrors.syllabusText
                        ? 'border-red-400 focus:ring-red-500/20'
                        : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                    }`}
                  />
                  {fieldErrors.syllabusText && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{fieldErrors.syllabusText}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Validation Errors Notice */}
          {Object.keys(fieldErrors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Please complete the required fields:</span>
                <ul className="list-disc list-inside space-y-0.5 text-red-700">
                  {Object.entries(fieldErrors).map(([field, msg]) => (
                    <li key={field}>
                      <span className="capitalize font-semibold">{field.replace(/([A-Z])/g, ' $1')}:</span> {msg}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Generate Button Bar */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-3 text-sm cursor-pointer"
            >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Parsing Syllabus & Calculating Schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Generate Intelligent Lecture Plan</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Holiday Manager Modal */}
      <HolidayModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        customHolidays={customHolidays}
        setCustomHolidays={setCustomHolidays}
        includeDefaultHolidays={includeDefaultHolidays}
        setIncludeDefaultHolidays={setIncludeDefaultHolidays}
      />
    </div>
  );
}