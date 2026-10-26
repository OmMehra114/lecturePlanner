'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Printer,
  Download,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Calendar,
  Clock,
  RefreshCw,
  X,
  Building2,
  PenTool,
  ZoomIn,
  ZoomOut,
  Upload,
  SlidersHorizontal,
  Columns3,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Auto-growing Textarea that expands to fit 100% of text with ZERO scrollbars or overflow hiding
 */
function AutoExpandingTextarea({
  value,
  onChange,
  placeholder,
  className = '',
  style = {},
  minRows = 1,
}) {
  const textareaRef = useRef(null);

  const resize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={minRows}
      value={value ?? ''}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      placeholder={placeholder}
      className={`overflow-hidden resize-none w-full bg-transparent border-transparent focus:outline-none transition-all ${className}`}
      style={style}
    />
  );
}

const DEFAULT_TABLE_COLUMNS = [
  { id: 'srNo', label: '#', widthClass: 'w-8 text-center', canDelete: false },
  { id: 'topic', label: 'Topic / Module Title', widthClass: 'w-56', canDelete: false },
  { id: 'dateRange', label: 'Scheduled Date(s)', widthClass: 'min-w-[130px]', canDelete: true },
  { id: 'lectures', label: 'Hrs', widthClass: 'w-12 text-center', canDelete: true },
  { id: 'subTopics', label: 'Sub-Topics & Methodologies', widthClass: '', canDelete: true },
];

export default function EditorX({ plan, onSave, onClose }) {
  const meta = plan?.meta || {};
  const savedDoc = meta.documentData || null;
  const initialTopics = Array.isArray(plan?.topics) ? plan.topics : [];

  // Editable Document State (Restores saved format from database if available)
  const [doc, setDoc] = useState(() => {
    if (savedDoc) {
      return {
        ...savedDoc,
        // Ensure left and right logos are available
        leftLogoUrl: savedDoc.leftLogoUrl || savedDoc.logoUrl || null,
        rightLogoUrl: savedDoc.rightLogoUrl || null,
        columns: savedDoc.columns && Array.isArray(savedDoc.columns) && savedDoc.columns.length > 0
          ? savedDoc.columns
          : DEFAULT_TABLE_COLUMNS,
      };
    }

    return {
      institution: meta.institution || 'DEPARTMENT OF COMPUTER SCIENCE & ACADEMIC STUDIES',
      subInstitution: meta.subInstitution || 'SGSITS Indore — Shri G. S. Institute of Technology & Science',
      title: 'OFFICIAL COURSE SYLLABUS & LECTURE DELIVERY SCHEDULE',
      academicYear: 'Academic Session 2026 - 2027 (Odd Semester)',
      subjectName: meta.subjectName || 'Course Curriculum',
      subjectCode: meta.subjectCode || 'CS-401',
      department: meta.department || 'Computer Science & Engineering',
      credits: meta.credits || 4,
      totalHours: meta.totalHours || 40,
      startDate: meta.startDate || '2026-08-03',
      endDate: meta.endDate || '2026-11-27',
      instructorName: meta.instructorName || 'Faculty In-Charge / Course Coordinator',
      overview:
        meta.syllabusText ||
        'This course delivers an in-depth pedagogical exploration of core foundational concepts, structured methodologies, and hands-on competencies scheduled sequentially over the academic semester.',
      columns: DEFAULT_TABLE_COLUMNS,
      topics: initialTopics.length > 0
        ? initialTopics.map((t, idx) => ({
            srNo: t.srNo || idx + 1,
            topic: t.topic || `Module ${idx + 1}`,
            lectures: t.lectures || 1,
            dateRange: t.dateRange || 'Scheduled Week',
            subTopics: Array.isArray(t.subTopics) ? t.subTopics.join(', ') : t.subTopics || '',
            customFields: t.customFields || {},
          }))
        : [
            {
              srNo: 1,
              topic: 'Module 1: Introduction to Architecture & Principles',
              lectures: 4,
              dateRange: '03 Aug 2026 to 07 Aug 2026',
              subTopics: 'Core definitions, historical context, lifecycle model, foundational setup',
              customFields: {},
            },
            {
              srNo: 2,
              topic: 'Module 2: Advanced Design & Algorithmic Execution',
              lectures: 6,
              dateRange: '10 Aug 2026 to 19 Aug 2026',
              subTopics: 'System breakdown, state management, edge conditions, complexity analysis',
              customFields: {},
            },
          ],
      sections: [
        {
          id: 'sec-1',
          title: 'Course Learning Outcomes (CLOs)',
          content:
            '1. Understand and articulate foundational principles.\n2. Formulate practical implementations through analytical problem solving.\n3. Integrate course concepts into comprehensive capstone assessments.',
        },
        {
          id: 'sec-2',
          title: 'Recommended Textbooks & References',
          content:
            '• Primary Text: Fundamentals of Modern System Design, 4th Edition (Prentice Hall)\n• Reference: Standard Academic Curricula Guidelines & Lecture Compendium',
        },
        {
          id: 'sec-3',
          title: 'Grading & Continuous Evaluation Matrix',
          content:
            '• Continuous Internal Evaluation (CIE): 40%\n• Mid-Semester Examination: 20%\n• Practical / Project Submissions: 20%\n• Final Semester Examination: 20%',
        },
      ],
      leftLogoUrl: null,
      rightLogoUrl: null,
      signatureUrl: null,
    };
  });

  // UI State
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Refs for Logo, Signature, and Column Menu
  const documentRef = useRef(null);
  const leftLogoInputRef = useRef(null);
  const rightLogoInputRef = useRef(null);
  const signatureInputRef = useRef(null);
  const columnMenuRef = useRef(null);

  // Close column menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target)) {
        setShowColumnMenu(false);
      }
    };
    if (showColumnMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnMenu]);

  // Field change handler
  const handleFieldChange = (field, value) => {
    setDoc((prev) => ({ ...prev, [field]: value }));
  };

  // Handlers for Topics Table
  const handleTopicChange = (index, field, value) => {
    setDoc((prev) => {
      const updated = [...prev.topics];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, topics: updated };
    });
  };

  const handleAddTopic = () => {
    setDoc((prev) => {
      const newIndex = prev.topics.length + 1;
      return {
        ...prev,
        topics: [
          ...prev.topics,
          {
            srNo: newIndex,
            topic: `Module ${newIndex}: Topic Outline & Concepts`,
            lectures: 2,
            dateRange: 'Scheduled Week',
            subTopics: 'Core principles, laboratory practices, and learning outcomes',
          },
        ],
      };
    });
  };

  const handleDeleteTopic = (index) => {
    setDoc((prev) => {
      const updated = prev.topics.filter((_, i) => i !== index);
      return {
        ...prev,
        topics: updated.map((t, idx) => ({ ...t, srNo: idx + 1 })),
      };
    });
  };

  // Handlers for Custom Sections
  const handleSectionChange = (id, field, value) => {
    setDoc((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  const handleAddSection = () => {
    setDoc((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `sec-${Date.now()}`,
          title: 'New Academic Policy / Section',
          content: 'Add textbook guidelines, laboratory rules, grading metrics, or attendance criteria here...',
        },
      ],
    }));
  };

  const handleDeleteSection = (id) => {
    setDoc((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  };

  // Handlers for Left and Right Logos
  const handleLeftLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDoc((prev) => ({ ...prev, leftLogoUrl: ev.target?.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRightLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDoc((prev) => ({ ...prev, rightLogoUrl: ev.target?.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDoc((prev) => ({ ...prev, signatureUrl: ev.target?.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Current active columns
  const currentColumns = doc.columns || DEFAULT_TABLE_COLUMNS;

  // Handlers for Column Management (Delete / Toggle / Add Custom Column)
  const handleDeleteColumn = (colId) => {
    setDoc((prev) => {
      const current = prev.columns || DEFAULT_TABLE_COLUMNS;
      return {
        ...prev,
        columns: current.filter((c) => c.id !== colId),
      };
    });
  };

  const handleToggleColumn = (colMeta) => {
    setDoc((prev) => {
      const current = prev.columns || DEFAULT_TABLE_COLUMNS;
      const exists = current.some((c) => c.id === colMeta.id);
      if (exists) {
        return {
          ...prev,
          columns: current.filter((c) => c.id !== colMeta.id),
        };
      } else {
        // Insert back maintaining natural logical order
        const orderMap = { srNo: 0, topic: 1, dateRange: 2, lectures: 3, subTopics: 4 };
        const newCols = [...current, colMeta].sort((a, b) => {
          const orderA = orderMap[a.id] ?? 99;
          const orderB = orderMap[b.id] ?? 99;
          return orderA - orderB;
        });
        return {
          ...prev,
          columns: newCols,
        };
      }
    });
  };

  const handleAddCustomColumn = (label) => {
    if (!label || !label.trim()) return;
    const id = `col_${Date.now()}`;
    const newCol = {
      id,
      label: label.trim(),
      widthClass: '',
      canDelete: true,
      isCustom: true,
    };
    setDoc((prev) => ({
      ...prev,
      columns: [...(prev.columns || DEFAULT_TABLE_COLUMNS), newCol],
    }));
  };

  const handleCustomFieldChange = (rowIndex, colId, value) => {
    setDoc((prev) => {
      const updatedTopics = [...prev.topics];
      const customFields = { ...(updatedTopics[rowIndex].customFields || {}), [colId]: value };
      updatedTopics[rowIndex] = { ...updatedTopics[rowIndex], customFields };
      return { ...prev, topics: updatedTopics };
    });
  };

  // PDF Generation with html2canvas & jsPDF (Clean vector-like multi-page render without HTML buttons)
  const handleDownloadPdf = async () => {
    const element = documentRef.current;
    if (!element) return;
    setIsExporting(true);

    try {
      // Capture element ignoring all action controls and toolbars
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        ignoreElements: (el) =>
          el.classList.contains('print:hidden') ||
          el.classList.contains('no-print') ||
          el.tagName === 'BUTTON',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Subsequent pages if document height exceeds single A4
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeSubjectCode = (doc.subjectCode || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`${safeSubjectCode}_Syllabus_Plan.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Could not generate PDF. Please click "Print Document" to save as high-fidelity PDF via your browser.');
    } finally {
      setIsExporting(false);
    }
  };

  // Native High-Quality Browser Print Dialog
  const handlePrint = () => {
    window.print();
  };

  // Save Plan to Database (Preserves all document formatting, left/right logos, sections in PostgreSQL)
  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedMeta = {
        ...meta,
        subjectName: doc.subjectName,
        subjectCode: doc.subjectCode,
        department: doc.department,
        credits: doc.credits,
        totalHours: doc.totalHours,
        startDate: doc.startDate,
        endDate: doc.endDate,
        documentData: doc, // <--- SAVES COMPLETE FORMAT IN DATABASE
      };

      const updatedPlanPayload = {
        meta: updatedMeta,
        topics: doc.topics.map((t) => ({
          srNo: t.srNo,
          topic: t.topic,
          lectures: t.lectures,
          dateRange: t.dateRange,
          subTopics: typeof t.subTopics === 'string'
            ? t.subTopics.split(',').map((s) => s.trim()).filter(Boolean)
            : t.subTopics,
          customFields: t.customFields || {},
        })),
        stats: {
          totalLectures: doc.topics.reduce((acc, t) => acc + (Number(t.lectures) || 0), 0),
          totalTopics: doc.topics.length,
        },
      };

      if (plan?.id) {
        await fetch(`/api/plans/${plan.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPlanPayload),
        });
      } else {
        await fetch('/api/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPlanPayload),
        });
      }

      if (onSave) {
        onSave(updatedPlanPayload);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving updated plan to database:', err);
      alert('Failed to save changes to the database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-100 min-h-screen">
      {/* Top Floating Control Bar (Strictly hidden during printing) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Table View"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Table View</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Editor-X Syllabus Studio</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase border border-emerald-200">
                  Auto-Expanded A4
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* Action Controls & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1 hover:bg-white rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-1 hover:bg-white rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Left Logo */}
          <button
            onClick={() => leftLogoInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
            title="Upload Left Logo (University Crest)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Left Logo</span>
          </button>
          <input
            type="file"
            ref={leftLogoInputRef}
            onChange={handleLeftLogoUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Add Right Logo */}
          <button
            onClick={() => rightLogoInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
            title="Upload Right Logo (Accreditation / Department Emblem)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Right Logo</span>
          </button>
          <input
            type="file"
            ref={rightLogoInputRef}
            onChange={handleRightLogoUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Add Section */}
          <button
            onClick={handleAddSection}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
            title="Add a custom curriculum section"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Add Section</span>
          </button>

          {/* Save to DB */}
          <button
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Save className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>{saveSuccess ? 'Saved!' : 'Save Plan'}</span>
          </button>

          {/* Print / Native PDF */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
            title="Print clean document without any UI buttons"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print</span>
          </button>

          {/* Export Downloadable PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Document Workspace */}
      <main className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center">
        {/* The Printable A4 Sheet Container */}
        <div
          id="printable-syllabus-sheet"
          ref={documentRef}
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : 'none',
            transformOrigin: 'top center',
          }}
          className="w-full max-w-[850px] bg-white text-slate-900 border border-slate-200 shadow-xl rounded-sm p-8 sm:p-12 space-y-6 font-sans print:border-none print:shadow-none print:p-0 print:max-w-none print:transform-none"
        >
          {/* 1. Official Header with LEFT LOGO, CENTER TEXT, and RIGHT LOGO */}
          <div className="border-b-2 border-slate-900 pb-4 space-y-3">
            <div className="grid grid-cols-12 items-center gap-4">
              {/* LEFT LOGO */}
              <div className="col-span-2 flex justify-start">
                {doc.leftLogoUrl ? (
                  <div className="relative group">
                    <img
                      src={doc.leftLogoUrl}
                      alt="Left Institution Logo"
                      className="h-16 w-16 object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setDoc((prev) => ({ ...prev, leftLogoUrl: null }))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition print:hidden"
                      title="Remove Left Logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => leftLogoInputRef.current?.click()}
                    className="h-16 w-16 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition print:hidden cursor-pointer"
                    title="Upload Left Logo"
                  >
                    <Building2 className="w-5 h-5 mb-0.5" />
                    <span className="text-[8px] font-bold">Left Logo</span>
                  </button>
                )}
              </div>

              {/* CENTER INSTITUTION & TITLES */}
              <div className="col-span-8 text-center space-y-1">
                <AutoExpandingTextarea
                  value={doc.institution}
                  onChange={(val) => handleFieldChange('institution', val)}
                  placeholder="INSTITUTION / UNIVERSITY NAME"
                  className="text-center text-sm sm:text-base font-black uppercase text-slate-900 tracking-wider hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-indigo-300 rounded px-1"
                />
                <AutoExpandingTextarea
                  value={doc.subInstitution}
                  onChange={(val) => handleFieldChange('subInstitution', val)}
                  placeholder="Department / College / Center Unit"
                  className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wide hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-indigo-300 rounded px-1"
                />
                <AutoExpandingTextarea
                  value={doc.title}
                  onChange={(val) => handleFieldChange('title', val)}
                  placeholder="DOCUMENT TITLE"
                  className="text-center text-xs sm:text-sm font-extrabold uppercase text-slate-900 tracking-tight hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-indigo-300 rounded px-1 pt-1"
                />
                <AutoExpandingTextarea
                  value={doc.academicYear}
                  onChange={(val) => handleFieldChange('academicYear', val)}
                  placeholder="Academic Session"
                  className="text-center text-xs font-medium text-slate-500 hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-indigo-300 rounded px-1"
                />
              </div>

              {/* RIGHT LOGO */}
              <div className="col-span-2 flex justify-end">
                {doc.rightLogoUrl ? (
                  <div className="relative group">
                    <img
                      src={doc.rightLogoUrl}
                      alt="Right Accreditation Emblem"
                      className="h-16 w-16 object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setDoc((prev) => ({ ...prev, rightLogoUrl: null }))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition print:hidden"
                      title="Remove Right Logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => rightLogoInputRef.current?.click()}
                    className="h-16 w-16 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition print:hidden cursor-pointer"
                    title="Upload Right Logo"
                  >
                    <Building2 className="w-5 h-5 mb-0.5" />
                    <span className="text-[8px] font-bold">Right Logo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Course Metadata Table / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase text-[9px] block">Course Name</span>
              <AutoExpandingTextarea
                value={doc.subjectName}
                onChange={(val) => handleFieldChange('subjectName', val)}
                className="font-bold text-slate-900 text-xs"
              />
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase text-[9px] block">Course Code</span>
              <AutoExpandingTextarea
                value={doc.subjectCode}
                onChange={(val) => handleFieldChange('subjectCode', val)}
                className="font-bold text-slate-900 text-xs"
              />
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase text-[9px] block">Credits / Hours</span>
              <div className="flex items-center gap-1 font-bold text-slate-900">
                <input
                  type="number"
                  value={doc.credits}
                  onChange={(e) => handleFieldChange('credits', Number(e.target.value))}
                  className="w-10 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                />
                <span className="text-slate-400">/</span>
                <input
                  type="number"
                  value={doc.totalHours}
                  onChange={(e) => handleFieldChange('totalHours', Number(e.target.value))}
                  className="w-10 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                />
                <span className="text-slate-500 text-[10px]">hrs</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase text-[9px] block">Semester Span</span>
              <div className="flex items-center gap-1 font-medium text-slate-800 text-xs flex-wrap">
                <span>{doc.startDate}</span>
                <span className="text-slate-400">to</span>
                <span>{doc.endDate}</span>
              </div>
            </div>
          </div>

          {/* 3. Course Description & Curricular Overview (Auto-Expanding with zero hidden overflow) */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 print:text-black" />
              <span>Course Description & Curricular Overview</span>
            </h3>
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
              <AutoExpandingTextarea
                value={doc.overview}
                onChange={(val) => handleFieldChange('overview', val)}
                placeholder="Course syllabus description..."
                className="text-xs text-slate-700 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* 4. Structured Timetable Grid (With Dynamic Column Deletion & Custom Columns) */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 print:text-black" />
                <span>Lecture Delivery Schedule & Module Breakdown</span>
              </h3>

              <div className="flex items-center gap-2 print:hidden">
                {/* Column Manager Dropdown */}
                <div className="relative" ref={columnMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowColumnMenu(!showColumnMenu)}
                    className="text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition shadow-2xs hover:bg-slate-50 cursor-pointer"
                    title="Customize & manage table columns"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Columns ({currentColumns.length})</span>
                  </button>

                  {showColumnMenu && (
                    <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-slate-200 shadow-xl p-3 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Columns3 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Customize Columns</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Click to toggle</span>
                      </div>

                      {/* Standard Columns Toggle List */}
                      <div className="space-y-1">
                        {DEFAULT_TABLE_COLUMNS.map((defaultCol) => {
                          const isVisible = currentColumns.some((c) => c.id === defaultCol.id);
                          const isRequired = defaultCol.canDelete === false;
                          return (
                            <div
                              key={defaultCol.id}
                              className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition ${
                                isRequired
                                  ? 'text-slate-400 bg-slate-50'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isVisible}
                                  disabled={isRequired}
                                  onChange={() => handleToggleColumn(defaultCol)}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <span className="font-medium">{defaultCol.label}</span>
                              </label>

                              {isRequired ? (
                                <span className="text-[10px] text-slate-400 font-semibold uppercase">Required</span>
                              ) : isVisible ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteColumn(defaultCol.id)}
                                  className="text-[11px] text-red-500 hover:text-red-700 font-medium cursor-pointer"
                                  title={`Delete ${defaultCol.label} column`}
                                >
                                  Delete
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleColumn(defaultCol)}
                                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                                >
                                  + Restore
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Columns (if any) */}
                      {currentColumns.filter((c) => c.isCustom).length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custom Columns</span>
                          {currentColumns.filter((c) => c.isCustom).map((customCol) => (
                            <div
                              key={customCol.id}
                              className="flex items-center justify-between p-1.5 rounded-lg text-xs bg-indigo-50/50 text-indigo-900 border border-indigo-100"
                            >
                              <span className="font-medium truncate">{customCol.label}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteColumn(customCol.id)}
                                className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                                title="Delete Custom Column"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Custom Column input */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Custom Column</span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomColumn(newColumnName);
                                setNewColumnName('');
                              }
                            }}
                            placeholder="e.g., Remarks, Lab, CO-PO..."
                            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleAddCustomColumn(newColumnName);
                              setNewColumnName('');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Module Button */}
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition print:hidden cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Module</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase text-[9px]">
                    {currentColumns.map((col) => {
                      const isDeletable = col.canDelete !== false;
                      return (
                        <th
                          key={col.id}
                          className={`py-2 px-3 font-bold uppercase text-[9px] relative group/col select-none ${
                            col.widthClass || ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">{col.label}</span>
                            {isDeletable && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteColumn(col.id);
                                }}
                                className="opacity-0 group-hover/col:opacity-100 hover:text-red-600 hover:bg-red-50 text-slate-400 p-0.5 rounded transition print:hidden cursor-pointer shrink-0 ml-1"
                                title={`Delete "${col.label}" column`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </th>
                      );
                    })}
                    <th className="py-2 px-1 w-6 text-center print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {doc.topics.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 group">
                      {currentColumns.map((col) => {
                        if (col.id === 'srNo') {
                          return (
                            <td key={col.id} className="py-2 px-2.5 text-center font-bold text-slate-500 align-top text-xs">
                              {item.srNo}
                            </td>
                          );
                        }
                        if (col.id === 'topic') {
                          return (
                            <td key={col.id} className="py-2 px-3 align-top">
                              <AutoExpandingTextarea
                                value={item.topic}
                                onChange={(val) => handleTopicChange(index, 'topic', val)}
                                placeholder="Topic outline..."
                                className="font-bold text-slate-900 text-xs leading-snug"
                              />
                            </td>
                          );
                        }
                        if (col.id === 'dateRange') {
                          return (
                            <td key={col.id} className="py-2 px-3 align-top">
                              <AutoExpandingTextarea
                                value={item.dateRange}
                                onChange={(val) => handleTopicChange(index, 'dateRange', val)}
                                placeholder="Date range..."
                                className="font-medium text-slate-700 text-xs leading-snug"
                              />
                            </td>
                          );
                        }
                        if (col.id === 'lectures') {
                          return (
                            <td key={col.id} className="py-2 px-2 text-center align-top">
                              <input
                                type="number"
                                value={item.lectures}
                                onChange={(e) => handleTopicChange(index, 'lectures', Number(e.target.value))}
                                className="w-full text-center font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none text-xs"
                              />
                            </td>
                          );
                        }
                        if (col.id === 'subTopics') {
                          return (
                            <td key={col.id} className="py-2 px-3 align-top">
                              <AutoExpandingTextarea
                                value={item.subTopics}
                                onChange={(val) => handleTopicChange(index, 'subTopics', val)}
                                placeholder="Key concepts, lab exercises, pedagogical methods..."
                                className="text-slate-600 text-xs leading-relaxed"
                              />
                            </td>
                          );
                        }
                        // Dynamic Custom Column cell
                        return (
                          <td key={col.id} className="py-2 px-3 align-top">
                            <AutoExpandingTextarea
                              value={item.customFields?.[col.id] || ''}
                              onChange={(val) => handleCustomFieldChange(index, col.id, val)}
                              placeholder={`${col.label}...`}
                              className="text-slate-700 text-xs leading-relaxed"
                            />
                          </td>
                        );
                      })}

                      <td className="py-2 px-1 text-center align-top print:hidden">
                        <button
                          type="button"
                          onClick={() => handleDeleteTopic(index)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Custom Sections (Auto-Expanding) */}
          <div className="space-y-4 pt-1">
            {doc.sections.map((section) => (
              <div key={section.id} className="space-y-1 relative group">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                    className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(section.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition p-1 print:hidden"
                    title="Remove Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <AutoExpandingTextarea
                    value={section.content}
                    onChange={(val) => handleSectionChange(section.id, 'content', val)}
                    placeholder="Add section content..."
                    className="text-xs text-slate-700 leading-relaxed font-sans"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 6. Institutional Blackout Exclusions Statement */}
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[10px] text-slate-600 space-y-0.5">
            <span className="font-bold text-slate-800 uppercase block">Academic Calendar Compliance</span>
            <p className="leading-relaxed">
              This lecture schedule strictly adheres to approved institutional blackout dates, gazetted public holidays, and examination intervals. Scheduled lecture hours accommodate semester contingencies.
            </p>
          </div>

          {/* 7. Signatures & Official Approvals */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-4">
              <div className="h-12 flex items-center justify-center">
                {doc.signatureUrl ? (
                  <img
                    src={doc.signatureUrl}
                    alt="Instructor Signature"
                    className="max-h-12 object-contain"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => signatureInputRef.current?.click()}
                    className="text-[10px] text-slate-400 hover:text-indigo-600 transition print:hidden cursor-pointer"
                  >
                    + Add Signature
                  </button>
                )}
              </div>
              <div className="border-t border-slate-400 pt-1">
                <input
                  type="text"
                  value={doc.instructorName}
                  onChange={(e) => handleFieldChange('instructorName', e.target.value)}
                  className="w-full text-center font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none text-[11px]"
                />
                <span className="text-[10px] text-slate-500 block">Course Instructor</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-12" />
              <div className="border-t border-slate-400 pt-1">
                <span className="font-bold text-slate-900 block text-[11px]">Head of Department</span>
                <span className="text-[10px] text-slate-500 block">Academic Committee Approval</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-12" />
              <div className="border-t border-slate-400 pt-1">
                <span className="font-bold text-slate-900 block text-[11px]">Dean of Academics</span>
                <span className="text-[10px] text-slate-500 block">Institutional Record</span>
              </div>
            </div>
          </div>
          <input
            type="file"
            ref={signatureInputRef}
            onChange={handleSignatureUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </main>

      {/* Global Print Stylesheet: ONLY the Document Prints; All Navbar/Controls Hidden */}
      <style jsx global>{`
        @media print {
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }

          /* Hide ALL other HTML components (navbar, headers, toolbars, buttons, alerts, sidebars) */
          nav, header, footer, aside, .print\\:hidden, button, input[type="file"], [data-no-print="true"] {
            display: none !important;
          }

          /* Hide everything by default, show only the syllabus sheet */
          body * {
            visibility: hidden;
          }

          #printable-syllabus-sheet,
          #printable-syllabus-sheet * {
            visibility: visible;
          }

          /* Reset ancestors so they don't clip multi-page printing */
          div, main {
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
          }

          #printable-syllabus-sheet {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            transform: none !important;
          }

          /* Remove input borders and backgrounds during print */
          input, textarea {
            border: none !important;
            background: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            resize: none !important;
            overflow: visible !important;
          }

          table {
            width: 100% !important;
            page-break-inside: auto;
            break-inside: auto;
          }

          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: auto;
          }

          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
        }
      `}</style>
    </div>
  );
}
