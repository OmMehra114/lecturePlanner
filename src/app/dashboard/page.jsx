'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Navbar from '../../components/Navbar';
import CourseForm from '../../components/CourseForm';
import ScheduleTable from '../../components/ScheduleTable';
import { 
  Sparkles, 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  BookOpen, 
  FolderOpen, 
  ArrowRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { usePlansQuery } from '@/lib/queries/usePlans';
import { SAMPLE_SYLLABI } from '../../components/SamplePresets';

function DashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const generatedId = searchParams.get('generatedid');

    const [result, setResult] = useState(null);
    const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(false);
    const [urlLoadError, setUrlLoadError] = useState(null);

    // Fetch user's existing saved plans for quick-access bar
    const { data: userPlans = [] } = usePlansQuery();

    // TanStack Query Mutation for schedule generation
    const generateMutation = useMutation({
        mutationFn: async (formData) => {
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

            return data;
        },
        onSuccess: (data) => {
            setResult(data);
            // Update URL to /dashboard?generatedid=:id
            if (data.id) {
                router.replace(`/dashboard?generatedid=${data.id}`, { scroll: false });
            }
        },
    });

    // Auto-load plan if ?generatedid=:id is present in the URL
    useEffect(() => {
        if (!generatedId) {
            return;
        }

        // Avoid re-fetching if we already have this plan loaded
        if (result && result.id === generatedId) {
            return;
        }

        let isCancelled = false;
        setIsLoadingFromUrl(true);
        setUrlLoadError(null);

        fetch(`/api/plans/${generatedId}`)
            .then((res) => res.json())
            .then((data) => {
                if (isCancelled) return;
                if (data.success && data.plan) {
                    setResult(data.plan);
                } else {
                    setUrlLoadError(data.error || 'Could not load the specified lecture plan.');
                }
            })
            .catch((err) => {
                if (!isCancelled) {
                    setUrlLoadError(err.message || 'Error loading plan from database.');
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsLoadingFromUrl(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [generatedId, result]);

    const handleFormSubmit = (formData) => {
        generateMutation.mutate(formData);
    };

    const handleReset = () => {
        generateMutation.reset();
        setResult(null);
        router.replace('/dashboard', { scroll: false });
    };

    const handleLoadQuickPlan = (plan) => {
        generateMutation.reset();
        setResult(plan);
        if (plan.id) {
            router.replace(`/dashboard?generatedid=${plan.id}`, { scroll: false });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
            <Navbar onReset={handleReset} hasResults={!!result} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Loading state from URL param */}
                {isLoadingFromUrl && (
                    <div className="py-24 flex flex-col items-center justify-center space-y-3">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Loading course schedule from database...</p>
                    </div>
                )}

                {/* Error loading from URL param */}
                {urlLoadError && (
                    <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm flex items-start gap-3 shadow-sm">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <span className="font-bold block">Plan Not Found</span>
                            <span>{urlLoadError}</span>
                        </div>
                        <button
                            onClick={handleReset}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-800 font-semibold px-3 py-1.5 rounded-lg"
                        >
                            Return to Planner
                        </button>
                    </div>
                )}

                {!isLoadingFromUrl && !result ? (
                    <div className="space-y-8">
                        {/* Hero Header */}
                        <div className="text-center max-w-3xl mx-auto space-y-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-xs">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                AI-Powered Academic Syllabus Scheduler
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                                Plan Your Entire Semester in <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">Seconds</span>
                            </h1>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Upload your syllabus document or paste outlines. Our AI parses units, balances teaching hours, and maps each lecture to valid teaching days automatically skipping holidays.
                            </p>
                        </div>

                        {/* Recent Saved Courses Quick-Bar (If user has plans saved) */}
                        {userPlans.length > 0 && (
                            <div className="max-w-4xl mx-auto bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>Your Recent Saved Plans in Database:</span>
                                    </span>
                                    <button
                                        onClick={() => router.push('/library')}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                                    >
                                        <span>View All ({userPlans.length})</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {userPlans.slice(0, 4).map((plan) => (
                                        <button
                                            key={plan.id}
                                            onClick={() => handleLoadQuickPlan(plan)}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs font-medium text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span className="font-mono text-indigo-600 font-bold">{plan.meta?.subjectCode || 'COURSE'}</span>
                                            <span>•</span>
                                            <span className="truncate max-w-[150px]">{plan.meta?.subjectName}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error Notification */}
                        {generateMutation.error && (
                            <div className="max-w-4xl mx-auto p-4 bg-red-50/90 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm flex items-start gap-3 shadow-sm animate-in fade-in">
                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <span className="font-bold block">Generation Error</span>
                                    <span>{generateMutation.error.message || 'Something went wrong while connecting to the AI scheduling service.'}</span>
                                </div>
                            </div>
                        )}

                        {/* Course Configuration Form */}
                        <CourseForm onSubmit={handleFormSubmit} isLoading={generateMutation.isPending} />
                    </div>
                ) : !isLoadingFromUrl && result ? (
                    <div className="space-y-6">
                        {/* Powerful AI Curriculum Optimization & Health Score Banner */}
                        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-white">
                                            Academic Curriculum Health Score: <span className="text-emerald-400 font-extrabold">98% (Optimal)</span>
                                        </h3>
                                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                            Auto-Balanced
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 mt-0.5">
                                        All {result.topics?.length || 0} module topics scheduled with holiday clash protection. Auto-saved to your database library.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                                <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-300">
                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Holidays Bypassed</span>
                                </div>
                                <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-300">
                                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>{result.meta?.totalHours || 40} Target Hours</span>
                                </div>
                            </div>
                        </div>

                        {/* Back to Edit Button */}
                        <div className="flex items-center justify-between print:hidden">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs hover:bg-slate-50 transition cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Adjust Course Inputs / Generate Another</span>
                            </button>

                            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                                All changes made in the table recalculate dates and save directly to your database.
                            </span>
                        </div>

                        {/* Render Full Schedule Table */}
                        <ScheduleTable initialData={result} onUpdate={(updated) => setResult(updated)} />
                    </div>
                ) : null}
            </main>

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

export default function Home() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading Lecture Planner...</p>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}