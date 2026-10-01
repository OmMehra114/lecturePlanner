'use client';





//hi this is change
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import CourseForm from '@/components/CourseForm';
import ScheduleTable from '@/components/ScheduleTable';
import SavedPlansModal from '@/components/SavedPlansModal';
import { Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [savedModalOpen, setSavedModalOpen] = useState(false);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const body = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'file' && formData[key]) {
          body.append('file', formData[key]);
        } else if (key === 'customHolidays' || key === 'teachingDays') {
          body.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null && formData[key] !== undefined) {
          body.append(key, formData[key]);
        }
      });

      const res = await fetch('/api/generate', {
        method: 'POST',
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate lecture plan. Please check your inputs.');
      }

      setResult(data);
    } catch (err) {
      console.error('Schedule generation error:', err);
      setError(err.message || 'Something went wrong while connecting to the AI scheduling service.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const handleLoadSavedPlan = (plan) => {
    setResult(plan);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar
        onReset={handleReset}
        hasResults={!!result}
        onOpenSavedPlans={() => setSavedModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!result ? (
          <div className="space-y-8">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Next-Gen Academic Syllabus Scheduler
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Plan Your Entire Semester in <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">Seconds</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Upload your course syllabus document or paste chapter outlines. Our AI parses units, balances teaching hours, and maps each lecture to valid teaching days automatically skipping holidays.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="max-w-4xl mx-auto p-4 bg-red-50/90 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm flex items-start gap-3 shadow-sm animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Generation Error</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Course Configuration Form */}
            <CourseForm onSubmit={handleFormSubmit} isLoading={loading} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back to Edit Button */}
            <div className="flex items-center justify-between print:hidden">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs hover:bg-slate-50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Adjust Course Inputs / Generate Another</span>
              </button>

              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                All changes made below recalculate dates in real-time.
              </span>
            </div>

            {/* Render Full Schedule Table */}
            <ScheduleTable initialData={result} onUpdate={(updated) => setResult(updated)} />
          </div>
        )}
      </main>

      {/* Saved Plans Modal */}
      <SavedPlansModal
        isOpen={savedModalOpen}
        onClose={() => setSavedModalOpen(false)}
        onLoadPlan={handleLoadSavedPlan}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 print:hidden mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Lecture Planner & Syllabus Scheduler &bull; Built for Universities & Educators</span>
          <span className="text-slate-400">Next.js 16 App Router &bull; AI Powered</span>
        </div>
      </footer>
    </div>
  );
}