import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Users,
  RefreshCw,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  fetchSchoolQRIdentity,
  rotateSchoolQRIdentity,
  fetchActiveSchoolInvitation,
  generateSchoolInvitation,
  revokeSchoolInvitation,
  type SchoolQRIdentityResponse,
  type SchoolInvitationInfo,
} from '../../services/qrApi';
import { useAuth } from '../../context/AuthContext';
import { SchoolJoinRequestsModal } from '../modals/SchoolJoinRequestsModal';

export const SchoolQRInviteCard: React.FC = () => {
  const { schoolProfile, activeRole, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'invite' | 'identity'>('invite');
  const [identityData, setIdentityData] = useState<SchoolQRIdentityResponse | null>(null);
  const [invitationData, setInvitationData] = useState<SchoolInvitationInfo | null>(null);
  const [inviteQrDataUrl, setInviteQrDataUrl] = useState<string>('');
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const isAdmin =
    activeRole === 'Administrator' ||
    activeRole === 'School Owner' ||
    activeRole === 'Head Teacher' ||
    activeRole === 'Headteacher' ||
    activeRole === 'Platform Administrator' ||
    user?.role === 'Administrator' ||
    user?.role === 'Headteacher';

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [identRes, inviteRes] = await Promise.all([
        fetchSchoolQRIdentity().catch(() => null),
        fetchActiveSchoolInvitation().catch(() => null),
      ]);

      if (identRes) setIdentityData(identRes);
      if (inviteRes) {
        setInvitationData(inviteRes.invitation);
        setInviteQrDataUrl(inviteRes.qrDataUrl);
        setInviteUrl(inviteRes.inviteUrl);
        setPendingRequestsCount(inviteRes.pendingCount || 0);
      }
    } catch (err) {
      console.warn('Failed to load QR data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer calculation
  useEffect(() => {
    if (!invitationData?.expiresAt) {
      setTimeRemaining('');
      return;
    }

    const interval = setInterval(() => {
      const remainingMs = new Date(invitationData.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeRemaining('Expired');
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeRemaining(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [invitationData?.expiresAt]);

  const handleRegenerateInvite = async () => {
    setRegenerating(true);
    try {
      const res = await generateSchoolInvitation(15);
      setInvitationData(res.invitation);
      setInviteQrDataUrl(res.qrDataUrl);
      setInviteUrl(res.inviteUrl);
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate invite QR');
    } finally {
      setRegenerating(false);
    }
  };

  const handleRevokeInvite = async () => {
    if (!invitationData?.token) return;
    if (!window.confirm('Are you sure you want to revoke this active School Join QR code immediately? Any further scan attempts using this QR will be blocked.')) {
      return;
    }
    setRevoking(true);
    try {
      await revokeSchoolInvitation(invitationData.token);
      setTimeRemaining('Revoked');
      setInvitationData(prev => prev ? { ...prev, status: 'REVOKED' } : null);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke invite QR');
    } finally {
      setRevoking(false);
    }
  };

  const handleCopyInviteLink = () => {
    const link = inviteUrl || (invitationData ? `https://schoolsoul.org/join?token=${invitationData.token}` : '');
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Card Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                School Join QR
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                  SECURE ENTRY
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scan this QR to join your school's digital system.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start">
            <button
              onClick={() => setActiveTab('invite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'invite'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              School Join QR
            </button>
            <button
              onClick={() => setActiveTab('identity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'identity'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              School Identity QR
            </button>
          </div>
        </div>

        {/* Tab 1: Secure Invite / Join QR */}
        {activeTab === 'invite' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
              <p className="font-semibold flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                The Digital Door to This School
              </p>
              <p className="text-[11px] text-purple-700 dark:text-purple-300">
                School members scan this QR code to identify this school, create their credentials, and submit their membership application. Applications are held safely in the Administrator Approval Queue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* QR Image Box */}
              <div className="relative p-3 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0">
                {inviteQrDataUrl ? (
                  <img
                    src={inviteQrDataUrl}
                    alt="School Join QR Code"
                    className="w-36 h-36 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                  </div>
                )}
                {invitationData?.status === 'REVOKED' ? (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold whitespace-nowrap shadow-md">
                    REVOKED
                  </div>
                ) : timeRemaining && timeRemaining !== 'Expired' ? (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900 text-purple-300 text-[10px] font-mono font-bold whitespace-nowrap shadow-md border border-purple-500/30">
                    {timeRemaining} left
                  </div>
                ) : null}
              </div>

              {/* Details & Actions */}
              <div className="space-y-2.5 flex-1 w-full text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Join Token Code</span>
                  <div className="font-mono font-extrabold text-slate-900 dark:text-white text-base tracking-wide flex items-center gap-2">
                    {invitationData?.token || 'INV-SCAN-READY'}
                    {invitationData && invitationData.status !== 'REVOKED' && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        15 MIN
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target School: <strong>{schoolProfile?.schoolName || 'Victoria Horizon'}</strong>
                </div>

                {/* Buttons Bar with 44px+ touch targets */}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  {isAdmin && (
                    <button
                      disabled={regenerating}
                      onClick={handleRegenerateInvite}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                      <span>Regenerate</span>
                    </button>
                  )}

                  {isAdmin && invitationData && invitationData.status !== 'REVOKED' && (
                    <button
                      disabled={revoking}
                      onClick={handleRevokeInvite}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>{revoking ? 'Revoking...' : 'Revoke'}</span>
                    </button>
                  )}

                  <button
                    onClick={handleCopyInviteLink}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Join Link'}</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setIsJoinModalOpen(true)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer relative"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View Join Requests</span>
                      {pendingRequestsCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 rounded-md bg-rose-500 text-white font-bold text-[10px]">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: School Identity QR */}
        {activeTab === 'identity' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              <p className="font-semibold flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                Permanent Institutional Discovery Identity
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                Official digital stamp for physical school gate banners, letterheads, and report card verification.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0">
                {identityData?.qrDataUrl ? (
                  <img
                    src={identityData.qrDataUrl}
                    alt="School Identity QR"
                    className="w-36 h-36 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1 w-full text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">School Code</span>
                  <div className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                    {identityData?.schoolQr?.code || 'SCH-ID-UG-001'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Institution: <strong>{schoolProfile?.schoolName || 'Victoria Horizon'}</strong>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Identity Badge</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Join Requests Approval Modal */}
      {isJoinModalOpen && (
        <SchoolJoinRequestsModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onUpdated={loadAll}
        />
      )}
    </>
  );
};
