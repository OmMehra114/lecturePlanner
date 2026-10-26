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
        {/* Clean & Rich Modern Header */}
        <div className="mb-6 pb-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Lecture Clash Prevention
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">• Academic Calendar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Academic Holiday & Blackout Calendar
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Configure institutional holidays, exam blocks, and breaks. All dates are automatically bypassed during timetable generation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition"
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
