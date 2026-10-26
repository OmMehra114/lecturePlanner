'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Award,
  Layers,
  Upload,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  X,
  Building2,
  PenTool,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function EditorX({ plan, onSave, onClose }) {
  // Extract initial meta and topics from plan
  const meta = plan?.meta || {};
  const initialTopics = Array.isArray(plan?.topics) ? plan.topics : [];

  // Editable Document State
  const [doc, setDoc] = useState({
    institution: 'DEPARTMENT OF COMPUTER SCIENCE & ACADEMIC STUDIES',
    subInstitution: 'National Institute of Engineering & Research',
    title: 'OFFICIAL COURSE SYLLABUS & LECTURE DELIVERY SCHEDULE',
    academicYear: 'Academic Session 2026 - 2027 (Odd Semester)',
    subjectName: meta.subjectName || 'Course Curriculum',
    subjectCode: meta.subjectCode || 'CS-401',
    department: meta.department || 'Computer Science & Engineering',
    credits: meta.credits || 4,
    totalHours: meta.totalHours || 40,
    startDate: meta.startDate || '2026-08-03',
    endDate: meta.endDate || '2026-11-27',
    instructorName: 'Faculty In-Charge / Course Coordinator',
    overview:
      meta.syllabusText?.slice(0, 320) ||
      'This course delivers an in-depth pedagogical exploration of core foundational concepts, structured methodologies, and hands-on competencies scheduled sequentially over the academic semester.',
    topics: initialTopics.length > 0
      ? initialTopics.map((t, idx) => ({
          srNo: t.srNo || idx + 1,
          topic: t.topic || `Module ${idx + 1}`,
          lectures: t.lectures || 1,
          dateRange: t.dateRange || 'Pending Dates',
          subTopics: Array.isArray(t.subTopics) ? t.subTopics.join(', ') : t.subTopics || '',
        }))
      : [
          {
            srNo: 1,
            topic: 'Module 1: Introduction to Architecture & Principles',
            lectures: 4,
            dateRange: '03 Aug 2026 to 07 Aug 2026',
            subTopics: 'Core definitions, historical context, lifecycle model, foundational setup',
          },
          {
            srNo: 2,
            topic: 'Module 2: Advanced Design & Algorithmic Execution',
            lectures: 6,
            dateRange: '10 Aug 2026 to 19 Aug 2026',
            subTopics: 'System breakdown, state management, edge conditions, complexity analysis',
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
    logoUrl: null,
    signatureUrl: null,
  });

  // UI State
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Refs
  const documentRef = useRef(null);
  const logoInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  // Handlers for Document Text Fields
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
            topic: `Module ${newIndex}: New Topic Outline`,
            lectures: 2,
            dateRange: 'Scheduled Week',
            subTopics: 'Detailed topics, concepts, and learning targets',
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
          title: 'Additional Section / Policy',
          content: 'Add course policy, lab instructions, attendance requirements, or notes here...',
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

  // Handlers for Image Uploads
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDoc((prev) => ({ ...prev, logoUrl: ev.target?.result }));
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

  // PDF Generation with jsPDF + html2canvas
  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    setIsExporting(true);

    try {
      const element = documentRef.current;

      // Temporarily ensure high quality capture
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
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

      // Additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const filename = `${(doc.subjectCode || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_')}_Syllabus_Plan.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Could not export PDF automatically. You can also click "Print / Native PDF" to save as PDF via your browser.');
    } finally {
      setIsExporting(false);
    }
  };

  // Native High-Quality Browser Print Dialog
  const handlePrint = () => {
    window.print();
  };

  // Save Plan to Database
  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedPlanPayload = {
        meta: {
          ...meta,
          subjectName: doc.subjectName,
          subjectCode: doc.subjectCode,
          department: doc.department,
          credits: doc.credits,
          totalHours: doc.totalHours,
          startDate: doc.startDate,
          endDate: doc.endDate,
        },
        topics: doc.topics.map((t) => ({
          srNo: t.srNo,
          topic: t.topic,
          lectures: t.lectures,
          dateRange: t.dateRange,
          subTopics: t.subTopics.split(',').map((s) => s.trim()).filter(Boolean),
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
      console.error('Error saving updated plan:', err);
      alert('Failed to save changes to the database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-100 min-h-screen">
      {/* Top Floating Control Bar (Hidden during printing) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Return to Table View"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Table View</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Editor-X: Syllabus & PDF Studio</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">
                  A4 Live Document
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Click any text or cell to edit inline • Add custom sections & images • Print or export PDF
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1.5 hover:bg-white rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-1.5 hover:bg-white rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Image / Logo */}
          <button
            onClick={() => logoInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl transition shadow-xs cursor-pointer"
            title="Upload institution logo or header banner"
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Add Logo</span>
          </button>
          <input
            type="file"
            ref={logoInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Add Custom Section */}
          <button
            onClick={handleAddSection}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl transition shadow-xs cursor-pointer"
            title="Add a custom curriculum section"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Add Section</span>
          </button>

          {/* Save to DB */}
          <button
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl transition shadow-xs cursor-pointer"
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl transition shadow-xs cursor-pointer"
            title="Open browser print dialog for vector-sharp PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print</span>
          </button>

          {/* Export Downloadable PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF...</span>
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
          ref={documentRef}
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : 'none',
            transformOrigin: 'top center',
          }}
          className="w-full max-w-[850px] bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-sm p-8 sm:p-14 space-y-8 font-sans print:border-none print:shadow-none print:p-0 print:max-w-none print:transform-none"
        >
          {/* 1. Header / Institution Banner */}
          <div className="border-b-2 border-slate-900 pb-5 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={doc.institution}
                  onChange={(e) => handleFieldChange('institution', e.target.value)}
                  className="w-full text-base sm:text-lg font-black uppercase text-slate-900 tracking-wider bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition"
                  placeholder="INSTITUTION / UNIVERSITY NAME"
                />
                <input
                  type="text"
                  value={doc.subInstitution}
                  onChange={(e) => handleFieldChange('subInstitution', e.target.value)}
                  className="w-full text-xs font-semibold text-slate-600 uppercase tracking-wide bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition"
                  placeholder="Department / Faculty / College Unit"
                />
              </div>

              {/* Uploaded Logo or Placeholder */}
              <div className="relative group shrink-0">
                {doc.logoUrl ? (
                  <div className="relative">
                    <img
                      src={doc.logoUrl}
                      alt="Institution Logo"
                      className="h-16 w-16 object-contain rounded-md"
                    />
                    <button
                      onClick={() => setDoc((prev) => ({ ...prev, logoUrl: null }))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition print:hidden"
                      title="Remove Logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="h-16 w-16 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition print:hidden cursor-pointer"
                    title="Upload Logo"
                  >
                    <Building2 className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-bold">Logo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Document Title & Session */}
            <div className="pt-2 text-center">
              <input
                type="text"
                value={doc.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full text-center text-sm sm:text-base font-extrabold uppercase text-slate-900 tracking-tight bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition"
              />
              <input
                type="text"
                value={doc.academicYear}
                onChange={(e) => handleFieldChange('academicYear', e.target.value)}
                className="w-full text-center text-xs font-medium text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition"
              />
            </div>
          </div>

          {/* 2. Course Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Course Name</span>
              <input
                type="text"
                value={doc.subjectName}
                onChange={(e) => handleFieldChange('subjectName', e.target.value)}
                className="font-bold text-slate-900 w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition"
              />
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Course Code</span>
              <input
                type="text"
                value={doc.subjectCode}
                onChange={(e) => handleFieldChange('subjectCode', e.target.value)}
                className="font-bold text-slate-900 w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition"
              />
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Credits / Hours</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={doc.credits}
                  onChange={(e) => handleFieldChange('credits', Number(e.target.value))}
                  className="font-bold text-slate-900 w-12 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition"
                />
                <span className="text-slate-400">/</span>
                <input
                  type="number"
                  value={doc.totalHours}
                  onChange={(e) => handleFieldChange('totalHours', Number(e.target.value))}
                  className="font-bold text-slate-900 w-12 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition"
                />
                <span className="text-slate-500 text-[10px]">hrs</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Semester Span</span>
              <div className="flex items-center gap-1 font-medium text-slate-800">
                <span>{doc.startDate}</span>
                <span className="text-slate-400">to</span>
                <span>{doc.endDate}</span>
              </div>
            </div>
          </div>

          {/* 3. Course Overview / Abstract */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Course Description & Curricular Overview</span>
            </h3>
            <textarea
              rows={3}
              value={doc.overview}
              onChange={(e) => handleFieldChange('overview', e.target.value)}
              className="w-full text-xs text-slate-700 leading-relaxed bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 p-2 rounded-lg focus:outline-none transition resize-none"
              placeholder="Provide a brief course description..."
            />
          </div>

          {/* 4. Structured Timetable Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Lecture Delivery Schedule & Module Breakdown</span>
              </h3>
              <button
                type="button"
                onClick={handleAddTopic}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition print:hidden cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Module</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 w-56">Topic / Module Title</th>
                    <th className="py-2.5 px-3 w-32">Scheduled Date(s)</th>
                    <th className="py-2.5 px-3 w-16 text-center">Hrs</th>
                    <th className="py-2.5 px-3">Sub-Topics & Methodologies</th>
                    <th className="py-2.5 px-2 w-8 text-center print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {doc.topics.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 group">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500 align-top">
                        {item.srNo}
                      </td>

                      <td className="py-2.5 px-3 align-top">
                        <textarea
                          rows={2}
                          value={item.topic}
                          onChange={(e) => handleTopicChange(index, 'topic', e.target.value)}
                          className="w-full font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition resize-none"
                        />
                      </td>

                      <td className="py-2.5 px-3 align-top">
                        <input
                          type="text"
                          value={item.dateRange}
                          onChange={(e) => handleTopicChange(index, 'dateRange', e.target.value)}
                          className="w-full font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center align-top">
                        <input
                          type="number"
                          value={item.lectures}
                          onChange={(e) => handleTopicChange(index, 'lectures', Number(e.target.value))}
                          className="w-full text-center font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition"
                        />
                      </td>

                      <td className="py-2.5 px-3 align-top">
                        <textarea
                          rows={2}
                          value={item.subTopics}
                          onChange={(e) => handleTopicChange(index, 'subTopics', e.target.value)}
                          className="w-full text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition resize-none"
                          placeholder="Key concepts, lab exercises..."
                        />
                      </td>

                      <td className="py-2.5 px-2 text-center align-top print:hidden">
                        <button
                          type="button"
                          onClick={() => handleDeleteTopic(index)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition p-1"
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

          {/* 5. Custom Sections (CLOs, Textbooks, Evaluation) */}
          <div className="space-y-6 pt-2">
            {doc.sections.map((section) => (
              <div key={section.id} className="space-y-1.5 relative group">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                    className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition flex-1"
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

                <textarea
                  rows={3}
                  value={section.content}
                  onChange={(e) => handleSectionChange(section.id, 'content', e.target.value)}
                  className="w-full text-xs text-slate-700 leading-relaxed bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 p-2 rounded-lg focus:outline-none transition resize-none font-sans whitespace-pre-wrap"
                />
              </div>
            ))}
          </div>

          {/* 6. Institutional Blackout Exclusions Statement */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-[10px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 uppercase block">Academic Calendar Compliance</span>
            <p>
              This lecture schedule strictly adheres to approved institutional blackout dates, gazetted public holidays, and examination intervals. Scheduled lecture hours accommodate semester contingencies.
            </p>
          </div>

          {/* 7. Signatures & Official Approvals */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-6">
              <div className="h-12 flex items-center justify-center">
                {doc.signatureUrl ? (
                  <img
                    src={doc.signatureUrl}
                    alt="Instructor Signature"
                    className="max-h-12 object-contain"
                  />
                ) : (
                  <button
                    onClick={() => signatureInputRef.current?.click()}
                    className="text-[10px] text-slate-400 hover:text-indigo-600 transition print:hidden"
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

            <div className="space-y-6">
              <div className="h-12" />
              <div className="border-t border-slate-400 pt-1">
                <span className="font-bold text-slate-900 block text-[11px]">Head of Department</span>
                <span className="text-[10px] text-slate-500 block">Academic Committee Approval</span>
              </div>
            </div>

            <div className="space-y-6">
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

      {/* Global Print Stylesheet for Pure Vector / Pixel-Perfect Printing */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          nav, header, aside, .print\\:hidden {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
