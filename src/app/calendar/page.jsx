'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import EventCalendar from '@/components/calender';
import { 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Download, 
  Upload, 
  CheckCircle2, 
  Plus,
  Inbox
} from 'lucide-react';

export default function CalendarPage() {
  const [receivedCalendars, setReceivedCalendars] = useState([]);
  const [isLoadingShares, setIsLoadingShares] = useState(true);
  const [appliedShareId, setAppliedShareId] = useState(null);

  // Fetch calendars shared by peers
  useEffect(() => {
    fetch('/api/calendar/share')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.receivedCalendars)) {
          setReceivedCalendars(data.receivedCalendars);
        }
      })
      .catch((err) => console.error('Failed to load shared calendars:', err))
      .finally(() => setIsLoadingShares(false));
  }, []);

  // Apply a peer's shared calendar
  const handleApplySharedCalendar = async (share) => {
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: share.events || [] }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedShareId(share.shareId);
        window.location.reload();
      }
    } catch (err) {
      console.error('Error applying shared calendar:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Automatic Lecture Clash Prevention
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Academic Holiday & Blackout Calendar
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Configure semester holidays, exam blocks, and faculty off-days. Any dates scheduled here are automatically skipped by the lecture scheduler when generating course timetables.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Course Plan</span>
            </Link>
          </div>
        </div>

        {/* Received Shared Calendars from Peers (if any) */}
        {receivedCalendars.length > 0 && (
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-950 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-indigo-600" />
                <span>Academic Calendars Shared with You ({receivedCalendars.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {receivedCalendars.map((share) => (
                <div
                  key={share.shareId}
                  className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 text-xs truncate">
                      {share.calendarTitle || 'Holiday Schedule'}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Shared by <span className="font-semibold text-slate-700">{share.sender?.name || share.sender?.email}</span> • {share.eventsCount || 0} dates
                    </p>
                    {share.message && (
                      <p className="text-[10px] text-slate-400 italic mt-0.5 truncate">&quot;{share.message}&quot;</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleApplySharedCalendar(share)}
                    className="shrink-0 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition shadow-xs"
                  >
                    {appliedShareId === share.shareId ? 'Applied!' : 'Apply to Calendar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* The Event & Blackout Calendar Component */}
        <EventCalendar />
      </main>
    </div>
  );
}
