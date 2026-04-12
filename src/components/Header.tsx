import { Sun, Moon, Bell, Search } from 'lucide-react';
import type { Page } from '../lib/types';

interface HeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
  currentPage: Page;
  unreadCount: number;
  onNotificationClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Analytics & Overview' },
  supervisors: { title: 'Supervisors', subtitle: 'Browse all faculty supervisors' },
  suggest: { title: 'Find Supervisor', subtitle: 'Smart supervisor matching' },
  ideas: { title: 'Project Ideas', subtitle: 'Explore thesis project topics' },
  groups: { title: 'My Groups', subtitle: 'Manage your thesis groups' },
};

export default function Header({
  isDark,
  onThemeToggle,
  currentPage,
  unreadCount,
  onNotificationClick,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const { title, subtitle } = pageTitles[currentPage];

  return (
    <header className="glass sticky top-0 z-20 px-6 py-4 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 flex-1 max-w-sm ml-8">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="input-field pl-9 text-sm py-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onThemeToggle}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 transition-all duration-200 hover:scale-105"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          onClick={onNotificationClick}
          className="relative w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 transition-all duration-200 hover:scale-105"
          title="Notifications"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-sky-500/30">
          S
        </div>
      </div>
    </header>
  );
}
