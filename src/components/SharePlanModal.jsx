'use client';

import { useState } from 'react';
import { 
  X, 
  Share2, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Shield, 
  Copy, 
  Eye, 
  ExternalLink 
} from 'lucide-react';
import Link from 'next/link';
import { useConnectionsQuery, useSharePlanMutation } from '@/lib/queries/useConnections';
import { SharePlanSchema } from '@/lib/schema';

export default function SharePlanModal({ isOpen, onClose, planData }) {
  const [selectedPeerId, setSelectedPeerId] = useState('');
  const [permission, setPermission] = useState('VIEW');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { data: connectionsData, isLoading } = useConnectionsQuery();
  const shareMutation = useSharePlanMutation();

  const connections = connectionsData?.connections || [];

  if (!isOpen) return null;

  const handleShare = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Make sure we have a planId or save plan first
    const planId = planData?.id || 'temp-current-plan';

    // Zod validation
    const validation = SharePlanSchema.safeParse({
      planId,
      receiverId: selectedPeerId,
      permission,
      message,
    });

    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message || 'Please select a colleague to share with');
      return;
    }

    shareMutation.mutate(
      {
        planId: validation.data.planId,
        receiverId: validation.data.receiverId,
        permission: validation.data.permission,
        message: validation.data.message,
      },
      {
        onSuccess: (res) => {
          setSuccessMsg('Plan shared successfully!');
          setTimeout(() => {
            setSuccessMsg(null);
            onClose();
          }, 2000);
        },
        onError: (err) => {
          setErrorMsg(err.message || 'Failed to share plan with selected peer.');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Share Lecture Plan</h3>
              <p className="text-xs text-slate-400">Send curriculum outline to a connected colleague</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Plan Info preview */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-900 block text-sm">
              {planData?.meta?.subjectName || 'Current Lecture Plan'}
            </span>
            <div className="flex items-center gap-3 text-slate-500 mt-1">
              <span>{planData?.meta?.subjectCode || 'No Code'}</span>
              <span>&bull;</span>
              <span>{planData?.topics?.length || 0} Topics</span>
              <span>&bull;</span>
              <span>{planData?.meta?.totalHours || 40} Planned Hours</span>
            </div>
          </div>

          {/* Feedback */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading your connected network...</span>
            </div>
          ) : connections.length === 0 ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">No Connected Colleagues</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  You need to be connected with a colleague before you can share lecture plans with them.
                </p>
              </div>
              <Link
                href="/connections"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3.5 py-2 rounded-xl transition"
              >
                <span>Go to Connections Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleShare} className="space-y-4">
              {/* Select Peer */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Connected Colleague <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPeerId}
                  onChange={(e) => setSelectedPeerId(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  required
                >
                  <option value="">-- Choose a connected colleague --</option>
                  {connections.map((c) => (
                    <option key={c.id} value={c.peer?.id}>
                      {c.peer?.name || 'Colleague'} ({c.peer?.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Permission Options */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Access Permission
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPermission('VIEW')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      permission === 'VIEW'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Eye className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">View Only</span>
                      <span className="text-[11px] text-slate-500">Read & export syllabus</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPermission('CLONE')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      permission === 'CLONE'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Copy className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Allow Clone</span>
                      <span className="text-[11px] text-slate-500">Copy to their own library</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Optional Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Optional Note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Here is our proposed Fall semester timeline for review..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shareMutation.isPending || !selectedPeerId}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {shareMutation.isPending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Colleague</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
