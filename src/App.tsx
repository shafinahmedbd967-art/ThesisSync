import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import NotificationPanel from './components/NotificationPanel';
import Dashboard from './pages/Dashboard';
import SupervisorsList from './pages/SupervisorsList';
import SupervisorSuggestion from './pages/SupervisorSuggestion';
import ProjectIdeas from './pages/ProjectIdeas';
import GroupStatus from './pages/GroupStatus';
import { useTheme } from './hooks/useTheme';
import { supabase } from './lib/supabase';
import type { Page, Notification } from './lib/types';

export default function App() {
  const { isDark, toggle } = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    setNotifications((data || []) as Notification[]);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function markAllRead() {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function handleNavigate(page: Page) {
    setCurrentPage(page);
    setSearchQuery('');
  }

  const sidebarWidth = sidebarCollapsed ? 72 : 256;

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/40 to-slate-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900 transition-colors duration-300">
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-sky-200/20 dark:bg-sky-900/10 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-200/20 dark:bg-cyan-900/10 blur-[100px]" />
        </div>

        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(p => !p)}
          unreadCount={unreadCount}
        />

        <div
          className="flex flex-col min-h-screen transition-all duration-300 relative z-10"
          style={{ marginLeft: sidebarWidth }}
        >
          <Header
            isDark={isDark}
            onThemeToggle={toggle}
            currentPage={currentPage}
            unreadCount={unreadCount}
            onNotificationClick={() => setShowNotifications(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <main className="flex-1 p-6">
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'supervisors' && <SupervisorsList searchQuery={searchQuery} />}
            {currentPage === 'suggest' && <SupervisorSuggestion />}
            {currentPage === 'ideas' && <ProjectIdeas searchQuery={searchQuery} />}
            {currentPage === 'groups' && (
              <GroupStatus onNewNotification={loadNotifications} />
            )}
          </main>
        </div>

        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAllRead={markAllRead}
            onMarkRead={markRead}
          />
        )}
      </div>
    </div>
  );
}
