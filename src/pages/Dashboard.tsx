import { useEffect, useState } from 'react';
import {
  Users, Lightbulb, FolderKanban, CheckCircle,
  Clock, XCircle, TrendingUp, Activity, Award
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Supervisor, ThesisGroup, ProjectIdea } from '../lib/types';

interface Stats {
  totalSupervisors: number;
  totalGroups: number;
  acceptedGroups: number;
  pendingGroups: number;
  rejectedGroups: number;
  totalIdeas: number;
  availableSupervisors: number;
}

interface TopicCount {
  category: string;
  count: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalSupervisors: 0, totalGroups: 0, acceptedGroups: 0,
    pendingGroups: 0, rejectedGroups: 0, totalIdeas: 0, availableSupervisors: 0,
  });
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [groups, setGroups] = useState<ThesisGroup[]>([]);
  const [topicCounts, setTopicCounts] = useState<TopicCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [{ data: sups }, { data: grps }, { data: ideas }] = await Promise.all([
        supabase.from('supervisors').select('*'),
        supabase.from('thesis_groups').select('*, supervisor:supervisors(*)'),
        supabase.from('project_ideas').select('*'),
      ]);

      const supList = (sups || []) as Supervisor[];
      const grpList = (grps || []) as ThesisGroup[];
      const ideaList = (ideas || []) as ProjectIdea[];

      setSupervisors(supList);
      setGroups(grpList);

      const accepted = grpList.filter(g => g.status === 'accepted').length;
      const pending = grpList.filter(g => g.status === 'pending').length;
      const rejected = grpList.filter(g => g.status === 'rejected').length;
      const available = supList.filter(s => s.current_groups < s.max_groups).length;

      setStats({
        totalSupervisors: supList.length,
        totalGroups: grpList.length,
        acceptedGroups: accepted,
        pendingGroups: pending,
        rejectedGroups: rejected,
        totalIdeas: ideaList.length,
        availableSupervisors: available,
      });

      const catMap: Record<string, number> = {};
      grpList.forEach(g => { catMap[g.category] = (catMap[g.category] || 0) + 1; });
      ideaList.forEach(i => { catMap[i.category] = (catMap[i.category] || 0) + 1; });
      const sorted = Object.entries(catMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      setTopicCounts(sorted);

      setLoading(false);
    }
    loadData();
  }, []);

  const statCards = [
    { label: 'Total Supervisors', value: stats.totalSupervisors, icon: Users, color: 'from-sky-500 to-blue-500', shadow: 'shadow-sky-500/25' },
    { label: 'Available Slots', value: stats.availableSupervisors, icon: Award, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/25' },
    { label: 'Project Ideas', value: stats.totalIdeas, icon: Lightbulb, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/25' },
    { label: 'Active Groups', value: stats.totalGroups, icon: FolderKanban, color: 'from-cyan-500 to-sky-500', shadow: 'shadow-cyan-500/25' },
  ];

  const maxTopicCount = Math.max(...topicCounts.map(t => t.count), 1);
  const categoryColors = ['bg-sky-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500','bg-violet-500'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-transform duration-200">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} shadow-lg ${card.shadow} flex items-center justify-center mb-4`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{card.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={17} className="text-sky-500" />
            <h3 className="font-semibold text-slate-800 dark:text-white">Group Status</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300">Accepted</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.acceptedGroups}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: stats.totalGroups ? `${(stats.acceptedGroups / stats.totalGroups) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-amber-500" />
                  <span className="text-slate-600 dark:text-slate-300">Pending</span>
                </div>
                <span className="font-bold text-amber-600 dark:text-amber-400">{stats.pendingGroups}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                  style={{ width: stats.totalGroups ? `${(stats.pendingGroups / stats.totalGroups) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <XCircle size={14} className="text-red-500" />
                  <span className="text-slate-600 dark:text-slate-300">Rejected</span>
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">{stats.rejectedGroups}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-700"
                  style={{ width: stats.totalGroups ? `${(stats.rejectedGroups / stats.totalGroups) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <p className="text-xs text-slate-400 dark:text-slate-500">Total groups: <span className="font-semibold text-slate-600 dark:text-slate-300">{stats.totalGroups}</span></p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={17} className="text-sky-500" />
            <h3 className="font-semibold text-slate-800 dark:text-white">Popular Categories</h3>
          </div>
          <div className="space-y-3">
            {topicCounts.map((topic, idx) => (
              <div key={topic.category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{topic.category}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">{topic.count} projects</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${categoryColors[idx % categoryColors.length]} rounded-full transition-all duration-700`}
                    style={{ width: `${(topic.count / maxTopicCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Users size={17} className="text-sky-500" />
          <h3 className="font-semibold text-slate-800 dark:text-white">Supervisor Workload</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {supervisors.slice(0, 10).map(sup => {
            const pct = (sup.current_groups / sup.max_groups) * 100;
            const isFull = sup.current_groups >= sup.max_groups;
            return (
              <div key={sup.id} className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/40">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: sup.avatar_color }}
                  >
                    {sup.name.split(' ').slice(-1)[0][0]}
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-tight line-clamp-2">
                    {sup.name.replace('Dr. ', '').replace('Prof. ', '')}
                  </p>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isFull ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  {sup.current_groups}/{sup.max_groups} groups
                  {isFull && <span className="text-red-400 font-medium ml-1">Full</span>}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <FolderKanban size={17} className="text-sky-500" />
          <h3 className="font-semibold text-slate-800 dark:text-white">Recent Groups</h3>
        </div>
        <div className="space-y-3">
          {groups.slice(0, 5).map(group => {
            const statusConfig = {
              accepted: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle },
              pending: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: Clock },
              rejected: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: XCircle },
            }[group.status];
            const StatusIcon = statusConfig.icon;
            return (
              <div key={group.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100/80 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{group.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{group.topic}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 hidden sm:block">
                  {group.category}
                </span>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${statusConfig.bg} ${statusConfig.color}`}>
                  <StatusIcon size={12} />
                  {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
