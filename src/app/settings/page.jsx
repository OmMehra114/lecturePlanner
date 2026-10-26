'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  Settings as SettingsIcon, 
  User, 
  BookOpen, 
  ShieldCheck, 
  Trash2, 
  Save, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Lock,
  X
} from 'lucide-react';
import { 
  useUserProfileQuery, 
  useUpdateProfileMutation, 
  useDeleteAccountMutation, 
  useClearAllPlansMutation, 
  usePlansQuery 
} from '@/lib/queries/usePlans';

export default function SettingsPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  // Queries & Mutations
  const { data: profile, isLoading, isError, refetch } = useUserProfileQuery();
  const { data: plans = [] } = usePlansQuery();
  const updateMutation = useUpdateProfileMutation();
  const clearPlansMutation = useClearAllPlansMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  // Active settings tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'preferences' | 'security' | 'danger'

  // Form states
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState('INSTRUCTOR');

  // Preferences states
  const [defaultHours, setDefaultHours] = useState(40);
  const [defaultDuration, setDefaultDuration] = useState(60);
  const [teachingDays, setTeachingDays] = useState([1, 2, 3, 4, 5]);
  const [fridayOption, setFridayOption] = useState('full');
  const [includeDefaultHolidays, setIncludeDefaultHolidays] = useState(true);

  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Modals
  const [showClearPlansModal, setShowClearPlansModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Sync profile data into state
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDepartment(profile.department || '');
      setInstitution(profile.institution || '');
      setRole(profile.role || 'INSTRUCTOR');

      const prefs = profile.preferences || {};
      setDefaultHours(prefs.defaultHours ?? 40);
      setDefaultDuration(prefs.defaultDurationMinutes ?? 60);
      setTeachingDays(prefs.defaultTeachingDays ?? [1, 2, 3, 4, 5]);
      setFridayOption(prefs.fridayOption ?? 'full');
      setIncludeDefaultHolidays(prefs.includeDefaultHolidays ?? true);
    }
  }, [profile]);

  // Handle Save Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);

    updateMutation.mutate(
      {
        name,
        department,
        institution,
        role,
        preferences: {
          defaultHours: Number(defaultHours),
          defaultDurationMinutes: Number(defaultDuration),
          defaultTeachingDays: teachingDays,
          fridayOption,
          includeDefaultHolidays,
        },
      },
      {
        onSuccess: () => {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 4000);
        },
        onError: (err) => {
          setSaveError(err.message || 'Failed to update settings');
        },
      }
    );
  };

  // Toggle day
  const toggleTeachingDay = (dayNum) => {
    if (teachingDays.includes(dayNum)) {
      if (teachingDays.length > 1) {
        setTeachingDays(teachingDays.filter((d) => d !== dayNum));
      }
    } else {
      setTeachingDays([...teachingDays, dayNum].sort());
    }
  };

  // Handle Clear All Plans
  const handleConfirmClearPlans = () => {
    clearPlansMutation.mutate(undefined, {
      onSuccess: () => {
        setShowClearPlansModal(false);
        refetch();
        alert('All saved lecture plans have been cleared from your database.');
      },
    });
  };

  // Handle Delete Account
  const handleConfirmDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') return;

    deleteAccountMutation.mutate(undefined, {
      onSuccess: async () => {
        setShowDeleteAccountModal(false);
        await signOut({ redirectUrl: '/' });
      },
      onError: (err) => {
        alert(err.message || 'Failed to delete account');
      },
    });
  };

  // Export User Data as JSON
  const handleExportData = () => {
    const exportBundle = {
      profile,
      exportedAt: new Date().toISOString(),
      plans,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `LecturePlanner_UserData_${profile?.name || 'User'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Secure Account & Preferences
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">• Profile & System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Settings & Account Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Configure your academic profile, manage scheduling defaults, verify database isolation, and control your account privacy.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Isolated Database Session</span>
            </span>
          </div>
        </div>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Instructor Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition ${
                activeTab === 'preferences'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Scheduling Defaults</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition ${
                activeTab === 'security'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Security & Privacy</span>
            </button>

            <button
              onClick={() => setActiveTab('danger')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition ${
                activeTab === 'danger'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Danger Zone</span>
            </button>
          </div>

          {/* Settings Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Feedback Notifications */}
            {saveSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 shadow-xs animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Your settings and preferences have been updated successfully!</span>
              </div>
            )}

            {saveError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 shadow-xs animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    <span>Academic & Profile Information</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage your public academic identity, institution affiliation, and departmental role.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Rajesh Sharma"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      />
                    </div>

                    {/* Email (Read-Only) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                        <span>Email Address</span>
                        <span className="text-[10px] text-slate-400 font-normal">Clerk Authenticated</span>
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Department */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science & Engineering"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      />
                    </div>

                    {/* Institution */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">University / Institution</label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. Stanford University"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      />
                    </div>

                    {/* Academic Role */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block">Academic Title / Designation</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      >
                        <option value="INSTRUCTOR">Instructor / Lecturer</option>
                        <option value="ASSISTANT_PROFESSOR">Assistant Professor</option>
                        <option value="ASSOCIATE_PROFESSOR">Associate Professor</option>
                        <option value="PROFESSOR">Professor</option>
                        <option value="HOD">Head of Department (HOD)</option>
                        <option value="DEAN">Dean / Academic Director</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{updateMutation.isPending ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: PREFERENCES */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span>Academic Scheduling Defaults</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Set default teaching hours, days of the week, and lecture duration applied to new course plans.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Default Hours & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Default Semester Hours</label>
                      <input
                        type="number"
                        min="10"
                        max="120"
                        value={defaultHours}
                        onChange={(e) => setDefaultHours(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Default Lecture Duration (Minutes)</label>
                      <select
                        value={defaultDuration}
                        onChange={(e) => setDefaultDuration(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      >
                        <option value="45">45 Minutes</option>
                        <option value="50">50 Minutes</option>
                        <option value="60">60 Minutes (1 Hour)</option>
                        <option value="90">90 Minutes (1.5 Hours)</option>
                      </select>
                    </div>
                  </div>

                  {/* Teaching Days Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Standard Teaching Days</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { day: 1, label: 'Monday' },
                        { day: 2, label: 'Tuesday' },
                        { day: 3, label: 'Wednesday' },
                        { day: 4, label: 'Thursday' },
                        { day: 5, label: 'Friday' },
                        { day: 6, label: 'Saturday' },
                      ].map(({ day, label }) => {
                        const isSelected = teachingDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleTeachingDay(day)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Friday Policy */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Friday Scheduling Policy</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'full', label: 'Full Teaching Day' },
                        { id: 'half', label: 'Half Day (Morning Only)' },
                        { id: 'exclude', label: 'Exclude Friday' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFridayOption(opt.id)}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                            fridayOption === opt.id
                              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Preferences Button */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{updateMutation.isPending ? 'Saving Defaults...' : 'Save Default Preferences'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: SECURITY & DATA PRIVACY */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-indigo-600" />
                      <span>Security & Data Isolation</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Your plans and academic data are strictly scoped to your authenticated account ID.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-slate-900 block">Strict User Isolation</span>
                        <p className="text-slate-600 leading-relaxed">
                          All lecture plans in the database are queried strictly with your user identity key. Other users cannot query, view, or modify your course plans unless you explicitly share a copy with them.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                      <Lock className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-slate-900 block">Enterprise Clerk SSO Authentication</span>
                        <p className="text-slate-600 leading-relaxed">
                          Sessions are cryptographically verified via JWT tokens. No plain passwords or credentials are stored locally or in localStorage.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Export My Data */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Export Personal Data</h4>
                      <p className="text-[11px] text-slate-500">Download a full JSON archive of all your saved course plans.</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportData}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Archive (.json)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DANGER ZONE */}
            {activeTab === 'danger' && (
              <div className="bg-white rounded-3xl border border-red-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Danger Zone</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Irreversible actions that modify or delete your lecture planner data permanently.
                  </p>
                </div>

                {/* Clear Plans Card */}
                <div className="p-5 rounded-2xl border border-red-100 bg-red-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">Clear All Saved Lecture Plans</h4>
                    <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                      Delete all course plans, syllabus topics, and scheduled dates currently stored under your account in PostgreSQL.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowClearPlansModal(true)}
                    className="text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-4 py-2.5 rounded-xl transition shrink-0 cursor-pointer"
                  >
                    Clear All My Plans
                  </button>
                </div>

                {/* Delete Profile Card */}
                <div className="p-5 rounded-2xl border border-red-200 bg-red-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-red-950 text-sm">Delete My Profile & Account</h4>
                    <p className="text-xs text-red-700 max-w-lg leading-relaxed">
                      Permanently delete your profile, lecture plans, topic notes, peer connections, and Clerk user authentication account. This action cannot be undone.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-xl transition shadow-xs shrink-0 cursor-pointer"
                  >
                    Delete My Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL 1: CONFIRM CLEAR PLANS */}
      {showClearPlansModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Clear All Lecture Plans?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will delete all {plans.length} of your saved lecture schedules from the database. You will not be able to recover them.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearPlansModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={clearPlansMutation.isPending}
                onClick={handleConfirmClearPlans}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer"
              >
                {clearPlansMutation.isPending ? 'Clearing...' : 'Yes, Delete All Plans'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELETE PROFILE */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-red-300 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Permanently Delete Account?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This action is permanent and immediate. All your course plans, connections, and user records will be destroyed.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Type <span className="font-mono text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE' || deleteAccountMutation.isPending}
                onClick={handleConfirmDeleteAccount}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
              >
                {deleteAccountMutation.isPending ? 'Erasing Account...' : 'Permanently Delete My Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
