'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Clock,
  Shield,
  Layers,
  ChevronDown,
  Upload,
  Sliders,
  Check,
  Star,
  Zap,
  GraduationCap
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('cs');
  const [faqOpen, setFaqOpen] = useState(0);

  const sampleSchedules = {
    cs: {
      title: 'CS301: Advanced Data Structures & Algorithms',
      code: 'CS-301',
      credits: '4 Credits',
      hours: '45 Total Hours',
      lectures: [
        { sr: 1, unit: 'Unit 1', topic: 'Asymptotic Analysis & Recurrences', date: 'Mon, Jan 12, 2026', hours: 2, status: 'Completed' },
        { sr: 2, unit: 'Unit 1', topic: 'Master Theorem & Divide-and-Conquer', date: 'Wed, Jan 14, 2026', hours: 2, status: 'Scheduled' },
        { sr: 3, unit: 'Unit 2', topic: 'Balanced Search Trees (AVL & Red-Black)', date: 'Fri, Jan 16, 2026', hours: 3, status: 'Scheduled' },
        { sr: 4, unit: 'Unit 2', topic: 'B-Trees & Multi-way Search Trees', date: 'Mon, Jan 19, 2026', hours: 2, status: 'Holiday Skipped (MLK Day)' },
        { sr: 5, unit: 'Unit 3', topic: 'Graph Traversals: BFS, DFS & Applications', date: 'Wed, Jan 21, 2026', hours: 2, status: 'Scheduled' },
      ],
    },
    eng: {
      title: 'ME204: Applied Thermodynamics & Heat Transfer',
      code: 'ME-204',
      credits: '3 Credits',
      hours: '40 Total Hours',
      lectures: [
        { sr: 1, unit: 'Module 1', topic: 'First Law for Open & Closed Systems', date: 'Tue, Jan 13, 2026', hours: 2, status: 'Completed' },
        { sr: 2, unit: 'Module 1', topic: 'Entropy & Second Law Formulations', date: 'Thu, Jan 15, 2026', hours: 2, status: 'Scheduled' },
        { sr: 3, unit: 'Module 2', topic: 'Carnot Cycle & Rankine Vapor Power', date: 'Tue, Jan 20, 2026', hours: 3, status: 'Scheduled' },
        { sr: 4, unit: 'Module 2', topic: 'Refrigeration & Heat Pump Cycles', date: 'Thu, Jan 22, 2026', hours: 2, status: 'Scheduled' },
        { sr: 5, unit: 'Module 3', topic: 'Conduction, Convection & Radiation', date: 'Tue, Jan 27, 2026', hours: 3, status: 'Scheduled' },
      ],
    },
    mgmt: {
      title: 'MBA102: Strategic Management & Leadership',
      code: 'MBA-102',
      credits: '3 Credits',
      hours: '36 Total Hours',
      lectures: [
        { sr: 1, unit: 'Part A', topic: 'Industry Analysis & Porter Five Forces', date: 'Mon, Jan 12, 2026', hours: 2, status: 'Completed' },
        { sr: 2, unit: 'Part A', topic: 'Resource-Based View & VRIO Framework', date: 'Wed, Jan 14, 2026', hours: 2, status: 'Scheduled' },
        { sr: 3, unit: 'Part B', topic: 'Blue Ocean Strategy & Value Innovation', date: 'Mon, Jan 19, 2026', hours: 2, status: 'Holiday Skipped (MLK Day)' },
        { sr: 4, unit: 'Part B', topic: 'Corporate Diversification & M&A', date: 'Wed, Jan 21, 2026', hours: 2, status: 'Scheduled' },
        { sr: 5, unit: 'Part C', topic: 'Digital Disruption & Agile Leadership', date: 'Mon, Jan 26, 2026', hours: 3, status: 'Scheduled' },
      ],
    },
  };

  const faqs = [
    {
      q: 'What types of syllabus documents can I upload?',
      a: 'LecturePlan supports PDF syllabi, Microsoft Word (.docx) documents, plain text files, or raw text pasted directly into the input form. Our AI extracts units, chapters, contact hour requirements, and sub-topics automatically.',
    },
    {
      q: 'How does it handle university holidays and non-teaching days?',
      a: 'You can configure your semester teaching days (e.g., Mon-Fri or custom combinations like Mon/Wed/Fri), toggle Friday inclusion, and add custom university holidays or exam breaks. The scheduling engine automatically routes lectures around off-days without losing hours.',
    },
    {
      q: 'Can I customize the generated schedule?',
      a: 'Yes! The interactive schedule editor lets you edit topic descriptions, reorder lectures, adjust allocated hours per session, add instructor notes, and track lecture completion throughout the semester.',
    },
    {
      q: 'What formats can I export the finalized schedule to?',
      a: 'You can export your complete syllabus plan to Excel (.xlsx), PDF timetable document, CSV spreadsheet, or print directly with standard university accreditation formatting.',
    },
    {
      q: 'Is there a limit on how many course plans I can save?',
      a: 'Free accounts can save and manage multiple course schedules with full cloud persistence, allowing you to load and update them whenever your timetable changes.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  LecturePlan
                </span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI 3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Academic Syllabus & Schedule Generator</p>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#preview" className="hover:text-indigo-600 transition-colors">Live Demo</a>
            <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all duration-200"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-indigo-50/50 via-white to-white">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-200/40 via-purple-100/30 to-emerald-100/30 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-xs animate-in fade-in duration-500">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Next-Gen University Syllabus & Timetable Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500 font-normal">Semester 2026 Ready</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-5xl mx-auto leading-[1.12]">
            Turn Complex Syllabi into{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 bg-clip-text text-transparent">
              Perfect Semester Timetables
            </span>{' '}
            in Seconds
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Upload course documents or paste outlines. Our AI parses units, balances teaching hours, and maps each lecture to valid academic calendar dates — automatically skipping university holidays.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Start Planning Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#preview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 shadow-xs hover:border-slate-300 transition-all duration-200"
            >
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Explore Live Demo</span>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Automatic Holiday Skipping</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant PDF & Excel Export</span>
            </div>
          </div>

          {/* Interactive UI Showcase Mockup */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-2xl shadow-indigo-900/10">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate-400 ml-2">LecturePlan Workspace</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Schedule Generator Active</span>
                </div>
              </div>

              {/* Showcase Banner */}
              <div className="bg-slate-900 rounded-xl p-5 sm:p-6 text-left text-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        Course Generated
                      </span>
                      <span className="text-xs text-slate-400">CS301 &bull; Computer Science</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                      Data Structures & Algorithms
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                      4 Credits &bull; 45 Hours
                    </span>
                    <span className="text-xs bg-indigo-600/30 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/40">
                      24 Lectures Mapped
                    </span>
                  </div>
                </div>

                {/* Mini Schedule Preview Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                        <th className="py-2.5 px-3">Lecture #</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3">Topic / Learning Objective</th>
                        <th className="py-2.5 px-3">Target Date</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-indigo-400">#01</td>
                        <td className="py-2.5 px-3">Unit 1</td>
                        <td className="py-2.5 px-3 font-medium">Asymptotic Notation: Big-O, Omega, Theta</td>
                        <td className="py-2.5 px-3 text-slate-400">Mon, Jan 12, 2026</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Scheduled
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-indigo-400">#02</td>
                        <td className="py-2.5 px-3">Unit 1</td>
                        <td className="py-2.5 px-3 font-medium">Recurrence Relations & Master Theorem</td>
                        <td className="py-2.5 px-3 text-slate-400">Wed, Jan 14, 2026</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Scheduled
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-amber-950/20 text-amber-300">
                        <td className="py-2.5 px-3 font-semibold text-amber-400">—</td>
                        <td className="py-2.5 px-3">Holiday</td>
                        <td className="py-2.5 px-3 font-medium text-amber-300">Martin Luther King Jr. Day (University Closed)</td>
                        <td className="py-2.5 px-3 text-amber-400/80">Mon, Jan 19, 2026</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full">
                            Auto-Skipped
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-indigo-400">#03</td>
                        <td className="py-2.5 px-3">Unit 2</td>
                        <td className="py-2.5 px-3 font-medium">Balanced Binary Search Trees: AVL Rotations</td>
                        <td className="py-2.5 px-3 text-slate-400">Wed, Jan 21, 2026</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Scheduled
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600">98%</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700">Planning Time Saved</div>
              <p className="text-xs text-slate-500">From 5 hours to 30 seconds</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600">45k+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700">Lectures Scheduled</div>
              <p className="text-xs text-slate-500">Across STEM & Humanities</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600">100%</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700">Holiday Accuracy</div>
              <p className="text-xs text-slate-500">Zero calendar conflicts</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600">4.9/5</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700">Faculty Satisfaction</div>
              <p className="text-xs text-slate-500">Rated by university educators</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            3-Step Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How LecturePlan Works
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Effortlessly transform raw course outlines into a day-by-day semester timetable in three intuitive steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="relative bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-lg mb-6">
              1
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Upload or Paste Syllabus</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload course PDFs, Word documents, or paste your syllabus outline. The AI parses units, chapters, learning goals, and total required credit hours.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-lg mb-6">
              2
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Configure Academic Calendar</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Set semester start and end dates, active teaching days (Mon–Fri or custom), and specify university holidays or mid-term breaks to skip.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-extrabold text-lg mb-6">
              3
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900">Instant AI Plan & Export</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our AI algorithm automatically balances contact hours and assigns real calendar dates to every topic. Review, adjust live, and export to Excel or PDF.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-20 bg-slate-50/50 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              Engine Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built Specifically for University Faculty & Departments
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Every detail is engineered to satisfy accreditation requirements, department standards, and academic calendar compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Deep AI Syllabus Parsing</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Extracts hierarchical topics, subtopics, and prerequisite units directly from messy documents without manual copy-pasting.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Smart Calendar & Holiday Engine</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Intelligently routes around national holidays, university breaks, and custom non-instructional days without shifting your hours off course.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Credit-to-Hour Balancing</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Guarantees total lecture hours match your course credits (30, 40, 45, or 60 hours) so you never run out of semester slots.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Live Real-Time Schedule Customizer</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Edit topics on the fly, adjust lecture counts per module, add lab notes, or mark sessions complete as the semester progresses.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Multi-Format University Exports</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Download formatted Excel worksheets (.xlsx), PDF documents, or CSV spreadsheets ready for accreditation audit submissions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Cloud Persistence & Version History</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every generated plan is saved to your account. Return anytime to duplicate plans for upcoming semesters or tweak dates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Preview Section */}
      <section id="preview" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            Live Sample Outputs
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            See Generated Plans Across Different Disciplines
          </h2>
          <p className="text-slate-600 text-base">
            Switch between disciplines below to see how LecturePlan distributes topics and maps calendar dates.
          </p>

          {/* Discipline Selector Tabs */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('cs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Computer Science
            </button>
            <button
              onClick={() => setActiveTab('eng')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'eng'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Mechanical Engineering
            </button>
            <button
              onClick={() => setActiveTab('mgmt')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mgmt'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Management / MBA
            </button>
          </div>
        </div>

        {/* Schedule Card Preview */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden">
          <div className="bg-slate-900 px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
                {sampleSchedules[activeTab].code}
              </span>
              <h3 className="text-xl font-bold mt-1.5">{sampleSchedules[activeTab].title}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                {sampleSchedules[activeTab].credits}
              </span>
              <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                {sampleSchedules[activeTab].hours}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Lecture #</th>
                  <th className="py-3 px-4">Unit / Module</th>
                  <th className="py-3 px-4">Topic Covered</th>
                  <th className="py-3 px-4">Mapped Date</th>
                  <th className="py-3 px-4">Allocated Hours</th>
                  <th className="py-3 px-4 text-right">Schedule Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleSchedules[activeTab].lectures.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.status.includes('Holiday') ? 'bg-amber-50/60' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-700">#{item.sr}</td>
                    <td className="py-3 px-4 font-medium text-slate-600">{item.unit}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.topic}</td>
                    <td className="py-3 px-4 text-slate-600">{item.date}</td>
                    <td className="py-3 px-4 text-slate-600">{item.hours} hrs</td>
                    <td className="py-3 px-4 text-right">
                      {item.status.includes('Holiday') ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                          Auto-Skipped Holiday
                        </span>
                      ) : item.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                          <Check className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
                          Scheduled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>Want to generate this for your own course? Click here to get started for free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              Faculty Endorsements
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Loved by Professors & Academic Chairs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;Mapping 45 lecture dates across two sections used to take me an entire weekend before classes started. With LecturePlan, I had an accurate, holiday-proof schedule exported to Excel in 40 seconds.&rdquo;
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                  DR
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Dr. Rajesh Sharma</div>
                  <div className="text-[11px] text-slate-500">Associate Professor of Computer Science</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;The holiday exclusion feature alone is a lifesaver. It skipped our university spring break and regional holidays accurately without displacing my midterm review dates.&rdquo;
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                  SK
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Prof. Sarah Klein</div>
                  <div className="text-[11px] text-slate-500">Chair of Mechanical Engineering</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;Our accreditation committee requires detailed lecture timetables for every course file. Exporting directly to Excel and PDF formatted to standard university guidelines saved our department dozens of hours.&rdquo;
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                  AN
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Dr. Anthony Miller</div>
                  <div className="text-[11px] text-slate-500">Dean of Academic Affairs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            Common Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? -1 : idx)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base cursor-pointer hover:bg-slate-50/80 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                    faqOpen === idx ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>
              {faqOpen === idx && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-14 text-center text-white overflow-hidden shadow-2xl shadow-indigo-950/20">
          {/* Ambient light circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to Automate Your Semester Planning?
            </h2>
            <p className="text-indigo-200 text-sm sm:text-lg leading-relaxed">
              Join university professors and educators who create balanced, holiday-proof course schedules in minutes instead of days.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-bold text-base shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <span>Get Started Now &bull; Free</span>
                <ArrowRight className="w-5 h-5 text-indigo-600" />
              </Link>
              <Link
                href="/sign-in"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-800/80 hover:bg-indigo-700/80 text-white font-semibold text-sm border border-indigo-700/60 transition-colors"
              >
                <span>Sign In to Existing Account</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">LecturePlan AI</span>
              <p className="text-[11px] text-slate-400">Intelligent Academic Syllabus & Timetable Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600">How It Works</a>
            <a href="#preview" className="hover:text-indigo-600">Live Preview</a>
            <a href="#faq" className="hover:text-indigo-600">FAQ</a>
            <Link href="/sign-in" className="hover:text-indigo-600">Sign In</Link>
          </div>

          <div className="text-slate-400 text-center sm:text-right">
            &copy; {new Date().getFullYear()} LecturePlan. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
