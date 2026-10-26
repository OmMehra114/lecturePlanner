'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SharePlanModal from '@/components/SharePlanModal';
import { 
  FolderOpen, 
  Calendar, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Search, 
  Star, 
  Trash2, 
  Copy, 
  ArrowRight, 
  Share2, 
  AlertCircle, 
  Plus, 
  CheckCircle2,
  Users,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { 
  usePlansQuery, 
  useDeletePlanMutation, 
  useFavoritePlanMutation, 
  useDuplicatePlanMutation 
} from '@/lib/queries/usePlans';
import { useReceivedPlansQuery } from '@/lib/queries/useConnections';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('my-plans'); // 'my-plans' | 'favorites' | 'shared'
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingPlan, setSharingPlan] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // TanStack Queries
  const { data: plans = [], isLoading, isError, error, refetch } = usePlansQuery();
  const { data: sharedPlans = [], isLoading: isLoadingShared } = useReceivedPlansQuery();

  // Mutations
  const deleteMutation = useDeletePlanMutation();
  const favoriteMutation = useFavoritePlanMutation();
  const duplicateMutation = useDuplicatePlanMutation();

  // Filtered plans
  const filteredMyPlans = useMemo(() => {
    return plans.filter((plan) => {
      const subject = plan.meta?.subjectName || '';
      const code = plan.meta?.subjectCode || '';
      const dept = plan.meta?.department || '';

      const matchesSearch =
        subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (activeTab === 'favorites') return plan.isFavorite;
      return true;
    });
  }, [plans, searchQuery, activeTab]);

  const filteredSharedPlans = useMemo(() => {
    return sharedPlans.filter((share) => {
      const subject = share.plan?.subjectName || '';
      const code = share.plan?.subjectCode || '';
      const sender = share.sender?.name || share.sender?.email || '';

      return (
        subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sender.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [sharedPlans, searchQuery]);

  const handleDeletePlan = (planId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to permanently delete this lecture plan from the database?')) {
      deleteMutation.mutate(planId);
    }
  };

  const handleToggleFavorite = (planId, e) => {
    e.preventDefault();
    e.stopPropagation();
    favoriteMutation.mutate(planId);
  };

  const handleDuplicate = (planId, e) => {
    e.preventDefault();
    e.stopPropagation();
    duplicateMutation.mutate(planId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Clean & Rich Modern Header */}
        <div className="mb-6 pb-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
                Isolated Database Library
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">• PostgreSQL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Academic Course Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Access, inspect, clone, and export your personal lecture schedules and peer-shared courses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Quick Metrics Pills */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{plans.length} Personal Plans</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{plans.filter((p) => p.isFavorite).length} Starred</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>{sharedPlans.length} Shared</span>
              </span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New Plan</span>
            </Link>
          </div>
        </div>

        {/* Tab Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('my-plans')}
              className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'my-plans'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>My Plans ({plans.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'favorites'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Favorites ({plans.filter((p) => p.isFavorite).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('shared')}
              className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'shared'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Shared with Me ({sharedPlans.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by title, code, or dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition shadow-2xs"
            />
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading your course library...</p>
          </div>
        )}

        {isError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Failed to load saved plans</span>
              <span>{error?.message || 'Database error occurred. Please verify your connection.'}</span>
            </div>
            <button
              onClick={() => refetch()}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content Grids */}
        {!isLoading && !isError && (
          <div>
            {/* TAB 1 & 2: MY PLANS & FAVORITES */}
            {activeTab !== 'shared' && (
              <div>
                {filteredMyPlans.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                      <FolderOpen className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">
                        {activeTab === 'favorites' ? 'No Starred Plans' : 'No Saved Course Plans Yet'}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {activeTab === 'favorites'
                          ? 'Star any lecture plan to quickly access it from this tab anytime.'
                          : 'Generate an AI academic syllabus schedule and it will automatically be saved securely in your database library.'}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Your First Plan</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMyPlans.map((plan) => {
                      const meta = plan.meta || {};
                      const stats = plan.stats || {};
                      const topicsCount = plan.topics?.length || 0;

                      return (
                        <div
                          key={plan.id}
                          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between group relative"
                        >
                          <div>
                            {/* Card Top Header */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  {meta.subjectCode || 'COURSE'}
                                </span>
                                {meta.credits && (
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                    {meta.credits} Credits
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={(e) => handleToggleFavorite(plan.id, e)}
                                title={plan.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  plan.isFavorite
                                    ? 'text-amber-500 hover:bg-amber-50'
                                    : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                                }`}
                              >
                                <Star
                                  className={`w-4 h-4 ${plan.isFavorite ? 'fill-amber-400' : ''}`}
                                />
                              </button>
                            </div>

                            {/* Plan Subject Title */}
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition line-clamp-1 mb-1">
                              {meta.subjectName || 'Untitled Lecture Plan'}
                            </h3>

                            {meta.department && (
                              <p className="text-xs text-slate-500 mb-3">{meta.department}</p>
                            )}

                            {/* Key Metadata Stats */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span>{meta.totalHours || topicsCount} Total Hours</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>{topicsCount} Topics / Units</span>
                              </div>
                              <div className="flex items-center gap-1.5 col-span-2 text-slate-500">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {meta.startDate} {meta.endDate ? `to ${meta.endDate}` : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSharingPlan(plan);
                                }}
                                title="Share Plan with Peer"
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={(e) => handleDuplicate(plan.id, e)}
                                title="Clone / Duplicate Plan"
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={(e) => handleDeletePlan(plan.id, e)}
                                title="Delete from Database"
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <Link
                              href={`/library/${plan.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 px-3.5 py-2 rounded-xl transition shadow-xs"
                            >
                              <span>Open Table</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SHARED WITH ME */}
            {activeTab === 'shared' && (
              <div>
                {filteredSharedPlans.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">No Shared Plans Yet</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        When fellow university instructors or connected peers share course plans with you, they will appear here.
                      </p>
                    </div>
                    <Link
                      href="/connections"
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
                    >
                      <Users className="w-4 h-4" />
                      <span>Connect with Faculty</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSharedPlans.map((share) => {
                      const plan = share.plan || {};
                      const sender = share.sender || {};

                      return (
                        <div
                          key={share.id}
                          className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Shared Header */}
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                              {sender.imageUrl ? (
                                <img
                                  src={sender.imageUrl}
                                  alt={sender.name || 'Sender'}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                                  {sender.name ? sender.name.slice(0, 2).toUpperCase() : 'FC'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">
                                  Shared by {sender.name || sender.email}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  Permission: {share.permission}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-1 mb-3">
                              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {plan.subjectCode || 'COURSE'}
                              </span>
                              <h4 className="font-bold text-slate-900 text-base mt-1">
                                {plan.subjectName || 'Course Plan'}
                              </h4>
                            </div>

                            {share.message && (
                              <p className="text-xs italic text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                                &quot;{share.message}&quot;
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                            <Link
                              href={`/library/${plan.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition shadow-xs"
                            >
                              <span>View Plan Table</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Share Plan Modal */}
      {sharingPlan && (
        <SharePlanModal
          isOpen={!!sharingPlan}
          onClose={() => setSharingPlan(null)}
          planData={sharingPlan}
        />
      )}
    </div>
  );
}
