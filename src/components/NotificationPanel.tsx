import { X, CheckCheck, Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Notification } from '../lib/types';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

const typeConfig = {
  success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  info: { icon: Info, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10' },
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationPanel({ notifications, onClose, onMarkAllRead, onMarkRead }: NotificationPanelProps) {
  const unread = notifications.filter(n => !n.read);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md h-full glass-card flex flex-col animate-slide-up shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-sky-500" />
            <h2 className="font-bold text-slate-800 dark:text-white">Notifications</h2>
            {unread.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unread.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread.length > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-600 font-medium transition-colors"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Bell size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No notifications yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">You are all caught up!</p>
            </div>
          ) : (
            notifications.map(notification => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              return (
                <button
                  key={notification.id}
                  onClick={() => onMarkRead(notification.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 hover:scale-[1.01] ${
                    notification.read
                      ? 'bg-slate-50/50 dark:bg-slate-800/30 opacity-60'
                      : 'glass-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={15} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{notification.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{timeAgo(notification.created_at)}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
