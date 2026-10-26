'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Users, 
  UserPlus, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Sparkles, 
  AlertCircle, 
  Building2, 
  GraduationCap, 
  Share2, 
  UserMinus,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  useConnectionsQuery, 
  useSendConnectionMutation, 
  useRespondConnectionMutation, 
  useRemoveConnectionMutation 
} from '@/lib/queries/useConnections';
import { useDirectoryUsersQuery } from '@/lib/queries/usePlans';
import { SendConnectionSchema } from '@/lib/schema';

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState('connections'); // 'connections' | 'requests' | 'find'
  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // TanStack Queries
  const { data, isLoading, isError, error, refetch } = useConnectionsQuery();
  const { data: directoryUsers = [], isLoading: isLoadingDirectory } = useDirectoryUsersQuery(searchQuery);

  // TanStack Mutations
  const sendMutation = useSendConnectionMutation();
  const respondMutation = useRespondConnectionMutation();
  const removeMutation = useRemoveConnectionMutation();

  const connections = data?.connections || [];
  const pendingReceived = data?.pending?.received || [];
  const pendingSent = data?.pending?.sent || [];
  const currentUser = data?.currentUser;

  // Handle Send Connection Invite via Zod validated form
  const handleSendInvite = (e) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);

    // Zod validation
    const validation = SendConnectionSchema.safeParse({
      targetIdentifier: inviteIdentifier,
      message: inviteMessage,
    });

    if (!validation.success) {
      const issues = validation.error.issues;
      setInviteError(issues[0]?.message || 'Please provide a valid email or user ID');
      return;
    }

    sendMutation.mutate(
      { 
        targetIdentifier: validation.data.targetIdentifier, 
        message: validation.data.message 
      },
      {
        onSuccess: (res) => {
          setInviteSuccess(`Invitation sent successfully to ${inviteIdentifier}!`);
          setInviteIdentifier('');
          setInviteMessage('');
          setTimeout(() => setInviteSuccess(null), 5000);
        },
        onError: (err) => {
          setInviteError(err.message || 'Failed to send connection request');
        },
      }
    );
  };

  // Quick connect from search result
  const handleQuickConnect = (userEmail) => {
    setInviteError(null);
    sendMutation.mutate(
      { targetIdentifier: userEmail },
      {
        onSuccess: () => {
          setInviteSuccess(`Connection request sent to ${userEmail}!`);
          setTimeout(() => setInviteSuccess(null), 4000);
        },
        onError: (err) => {
          setInviteError(err.message || 'Could not send request');
        },
      }
    );
  };

  const handleRespond = (connectionId, status) => {
    respondMutation.mutate({ connectionId, status });
  };

  const handleRemove = (connectionId, peerName) => {
    if (confirm(`Are you sure you want to disconnect from ${peerName || 'this user'}?`)) {
      removeMutation.mutate(connectionId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden mb-8 border border-slate-800">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Academic Peer Collaboration
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Instructor Network & Plan Sharing
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Connect with fellow university professors, HODs, and curriculum coordinators. Share lesson plans, align semester objectives, and import peer course structures seamlessly.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="bg-slate-800/80 border border-slate-700/60 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{connections.length} Connected Colleague{connections.length === 1 ? '' : 's'}</span>
            </div>
            {pendingReceived.length > 0 && (
              <div className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>{pendingReceived.length} Incoming Request{pendingReceived.length === 1 ? '' : 's'}</span>
              </div>
            )}
            {pendingSent.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700/40 text-slate-300 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{pendingSent.length} Outgoing Pending</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setActiveTab('connections')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'connections'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>My Network ({connections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition relative ${
              activeTab === 'requests'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Requests ({pendingReceived.length + pendingSent.length})</span>
            {pendingReceived.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping absolute top-0 right-0" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('find')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'find'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Find & Invite Peers</span>
          </button>
        </div>

        {/* Global Loading / Error States */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading your collaboration network...</p>
          </div>
        )}

        {isError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Failed to load connection data</span>
              <span>{error?.message || 'Check your database connection or authentication status.'}</span>
            </div>
            <button
              onClick={() => refetch()}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div>
            {/* TAB 1: ACTIVE CONNECTIONS */}
            {activeTab === 'connections' && (
              <div>
                {connections.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">No Connected Peers Yet</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Connect with instructors in your institution to easily send and sync lecture syllabi.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('find')}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Find & Connect Colleagues</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {connections.map((conn) => {
                      const peer = conn.peer;
                      return (
                        <div
                          key={conn.id}
                          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                          <div className="space-y-4">
                            {/* Peer Header */}
                            <div className="flex items-start gap-3.5">
                              {peer?.imageUrl ? (
                                <img
                                  src={peer.imageUrl}
                                  alt={peer.name || 'Peer'}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-base flex items-center justify-center shadow-xs">
                                  {peer?.name ? peer.name.slice(0, 2).toUpperCase() : 'IN'}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 text-base truncate">
                                  {peer?.name || 'Instructor'}
                                </h4>
                                <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{peer?.email}</span>
                                </p>
                              </div>
                            </div>

                            {/* Details & Badges */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                              {peer?.department && (
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{peer.department}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-slate-400">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>Connected peer</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <a
                              href={`mailto:${peer?.email}`}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </a>

                            <button
                              onClick={() => handleRemove(conn.id, peer?.name)}
                              className="text-xs text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                              title="Disconnect"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: REQUESTS (INCOMING & OUTGOING) */}
            {activeTab === 'requests' && (
              <div className="space-y-8">
                {/* Incoming Requests */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>Incoming Requests</span>
                      <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {pendingReceived.length}
                      </span>
                    </h3>
                  </div>

                  {pendingReceived.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-xs text-slate-500">
                      No pending connection requests awaiting your response.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingReceived.map((req) => (
                        <div
                          key={req.id}
                          className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs flex flex-col justify-between"
                        >
                          <div className="flex items-start gap-3.5">
                            {req.sender?.imageUrl ? (
                              <img
                                src={req.sender.imageUrl}
                                alt={req.sender.name || 'Sender'}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                                {req.sender?.name ? req.sender.name.slice(0, 2).toUpperCase() : 'REQ'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate">
                                {req.sender?.name || 'Instructor'}
                              </h4>
                              <p className="text-xs text-slate-500 truncate">{req.sender?.email}</p>
                              {req.sender?.department && (
                                <p className="text-xs text-slate-400 mt-1">{req.sender.department}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRespond(req.id, 'DECLINED')}
                              disabled={respondMutation.isPending}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleRespond(req.id, 'ACCEPTED')}
                              disabled={respondMutation.isPending}
                              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept Connection</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Outgoing Requests */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>Sent Requests</span>
                      <span className="bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {pendingSent.length}
                      </span>
                    </h3>
                  </div>

                  {pendingSent.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-xs text-slate-500">
                      You haven't sent any invitations that are currently pending.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingSent.map((req) => (
                        <div
                          key={req.id}
                          className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                              {req.receiver?.name ? req.receiver.name.slice(0, 2).toUpperCase() : 'INV'}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-semibold text-slate-900 text-sm truncate">
                                {req.receiver?.name || req.receiver?.email}
                              </h5>
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>Awaiting response</span>
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemove(req.id, req.receiver?.name)}
                            className="text-xs text-slate-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: FIND & INVITE PEERS */}
            {activeTab === 'find' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Registered Faculty Directory */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <span>Faculty Directory ({directoryUsers.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Browse all instructors registered on this platform and send connection invitations directly.
                    </p>
                  </div>

                  {/* Filter Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filter directory by name, email, or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  </div>

                  {/* Directory Users List */}
                  <div className="space-y-3">
                    {isLoadingDirectory && (
                      <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span>Loading platform instructors directory...</span>
                      </div>
                    )}

                    {!isLoadingDirectory && directoryUsers.length === 0 && (
                      <div className="py-10 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="font-semibold text-slate-700">No other faculty registered yet</p>
                        <p className="text-slate-400">Invite colleagues to join using their institutional email on the right!</p>
                      </div>
                    )}

                    {!isLoadingDirectory && directoryUsers.map((user) => {
                      const isConnected = user.connectionStatus === 'CONNECTED';
                      const isPendingSent = user.connectionStatus === 'PENDING_SENT';
                      const isPendingReceived = user.connectionStatus === 'PENDING_RECEIVED';

                      return (
                        <div
                          key={user.id}
                          className="p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-200 bg-white hover:bg-indigo-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {user.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={user.name || 'User'}
                                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                                {user.name ? user.name.slice(0, 2).toUpperCase() : 'DR'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-900 text-sm truncate">
                                {user.name || 'Instructor'}
                              </h5>
                              <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{user.email}</span>
                              </p>
                              {(user.department || user.institution) && (
                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                  {[user.department, user.institution].filter(Boolean).join(' • ')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isConnected ? (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Connected</span>
                              </span>
                            ) : isPendingSent ? (
                              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Request Pending</span>
                              </span>
                            ) : isPendingReceived ? (
                              <button
                                onClick={() => handleRespond(user.connectionId, 'ACCEPTED')}
                                disabled={respondMutation.isPending}
                                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept Request</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleQuickConnect(user.email)}
                                disabled={sendMutation.isPending}
                                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Connect Directly</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Invite Form (Validated with Zod) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-indigo-600" />
                      <span>Direct Colleague Invite</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter the institutional email of a professor or peer to connect with them.
                    </p>
                  </div>

                  {/* Feedback Alerts */}
                  {inviteSuccess && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{inviteSuccess}</span>
                    </div>
                  )}

                  {inviteError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{inviteError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendInvite} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Instructor Email / ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. professor.sharma@university.edu"
                        value={inviteIdentifier}
                        onChange={(e) => {
                          setInviteIdentifier(e.target.value);
                          if (inviteError) setInviteError(null);
                        }}
                        className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                          inviteError 
                            ? 'border-red-400 focus:ring-red-500/20' 
                            : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Optional Note / Department
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Hi! I'd like to collaborate and share syllabus planning schedules with you..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sendMutation.isPending}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      {sendMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending Request...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Send Connection Request</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
