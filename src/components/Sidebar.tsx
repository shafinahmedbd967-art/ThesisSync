import {
  LayoutDashboard,
  Users,
  Lightbulb,
  Sparkles,
  FolderKanban,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Page } from '../lib/types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount: number;
}

const navItems: { id: Page; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'supervisors', label: 'Supervisors', icon: Users },
  { id: 'suggest', label: 'Find Supervisor', icon: Sparkles },
  { id: 'ideas', label: 'Project Ideas', icon: Lightbulb },
  { id: 'groups', label: 'My Groups', icon: FolderKanban },
];

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse, unreadCount }: SidebarProps) {
  return (
    <aside
      className={`glass-sidebar fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-200/50 dark:border-slate-700/50 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-500/30">
          <GraduationCap size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="font-bold text-slate-800 dark:text-white text-sm leading-tight">ThesisSync</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Smart FYP Manager</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const showBadge = item.id === 'groups' && unreadCount > 0;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`sidebar-item w-full ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <div className="relative flex-shrink-0">
                <Icon size={18} className={isActive ? 'text-sky-500' : ''} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <span className="animate-fade-in flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && showBadge && (
                <span className="animate-fade-in bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <button
          onClick={onToggleCollapse}
          className="sidebar-item w-full justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} />
              <span className="animate-fade-in text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
