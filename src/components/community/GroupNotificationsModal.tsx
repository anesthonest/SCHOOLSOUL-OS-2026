import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Mail,
  Megaphone,
  MessageSquare,
  Sparkles,
  X,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';
import { digitalCommunityApi } from '../../services/digitalCommunityApi';
import { GroupNotification, User } from '../../types';

interface GroupNotificationsModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onOpenGroupChat?: (groupId: string) => void;
}

export const GroupNotificationsModal: React.FC<GroupNotificationsModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onOpenGroupChat,
}) => {
  const [notifications, setNotifications] = useState<GroupNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await digitalCommunityApi.getNotifications(
        currentUser.id,
        currentUser.schoolId || 'school-001'
      );
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen, currentUser.id]);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id: string) => {
    await digitalCommunityApi.markNotificationRead(id, currentUser.schoolId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await digitalCommunityApi.markAllNotificationsRead(currentUser.id, currentUser.schoolId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'INVITED_TO_GROUP':
        return Mail;
      case 'JOIN_REQUEST_APPROVED':
        return CheckCircle2;
      case 'NEW_ANNOUNCEMENT':
        return Megaphone;
      default:
        return MessageSquare;
    }
  };

  return (
    <div
      id="modal-group-notifications"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Community Activity & Alerts
              </h3>
              <p className="text-[11px] text-slate-500">
                Safeguarded updates, group invites & membership statuses
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-mark-all-notifications-read"
              onClick={handleMarkAllRead}
              title="Mark all as read"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-xs">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-1 opacity-50" />
              <p className="text-xs font-bold text-slate-600">All caught up!</p>
              <p className="text-[11px]">No recent community notifications.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = getNotifIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  id={`notif-card-${notif.id}`}
                  onClick={() => {
                    if (!notif.read) handleMarkAsRead(notif.id);
                    if (notif.groupId && onOpenGroupChat) {
                      onOpenGroupChat(notif.groupId);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    notif.read
                      ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                      : 'bg-blue-50/50 border-blue-200 text-slate-900 shadow-2xs'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.read ? 'bg-slate-200/80 text-slate-500' : 'bg-blue-600 text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold truncate text-slate-900">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      {notif.message}
                    </p>
                    {notif.groupName && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-100">
                        {notif.groupName}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
