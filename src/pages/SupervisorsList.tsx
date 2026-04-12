import { useEffect, useState } from 'react';
import { Mail, BookOpen, Users, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Supervisor } from '../lib/types';

interface SupervisorsListProps {
  searchQuery: string;
}

export default function SupervisorsList({ searchQuery }: SupervisorsListProps) {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('All');

  useEffect(() => {
    supabase.from('supervisors').select('*').then(({ data }) => {
      setSupervisors((data || []) as Supervisor[]);
      setLoading(false);
    });
  }, []);

  const departments = ['All', ...Array.from(new Set(supervisors.map(s => s.department)))];

  const filtered = supervisors.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.expertise.some(e => e.toLowerCase().includes(q)) || s.department.toLowerCase().includes(q);
    const matchDept = filterDept === 'All' || s.department === filterDept;
    return matchSearch && matchDept;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap gap-2">
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setFilterDept(dept)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
              filterDept === dept
                ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-transparent shadow-md shadow-sky-500/20'
                : 'bg-white/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/40 hover:border-sky-300 dark:hover:border-sky-600'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(sup => {
          const isFull = sup.current_groups >= sup.max_groups;
          const pct = Math.min((sup.current_groups / sup.max_groups) * 100, 100);
          return (
            <div key={sup.id} className="glass-card rounded-2xl p-5 hover:scale-[1.01] transition-all duration-200 group">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-200"
                  style={{ backgroundColor: sup.avatar_color }}
                >
                  {sup.name.split(' ').map(n => n[0]).slice(1, 3).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-white truncate">{sup.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{sup.department}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {isFull ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-lg">
                        <XCircle size={11} /> Full
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                        <CheckCircle size={11} /> Available
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 mb-4">{sup.bio}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {sup.expertise.slice(0, 4).map(exp => (
                  <span key={exp} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20">
                    {exp}
                  </span>
                ))}
                {sup.expertise.length > 4 && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-600/30">
                    +{sup.expertise.length - 4}
                  </span>
                )}
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  <div className="flex items-center gap-1">
                    <Users size={11} />
                    <span>Group Capacity</span>
                  </div>
                  <span className="font-semibold">{sup.current_groups}/{sup.max_groups}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isFull ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200/50 dark:border-slate-700/40">
                <BookOpen size={12} className="text-slate-400" />
                <a
                  href={`mailto:${sup.email}`}
                  className="text-xs text-sky-500 hover:text-sky-600 hover:underline flex items-center gap-1 transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <Mail size={12} />
                  {sup.email}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Users size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No supervisors found</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
