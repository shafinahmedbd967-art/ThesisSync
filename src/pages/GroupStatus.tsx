import { useState, useEffect } from 'react';
import {
  FolderKanban, Plus, CheckCircle, Clock, XCircle,
  Users, X, ChevronDown, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ThesisGroup, Supervisor, Notification } from '../lib/types';

interface GroupStatusProps {
  onNewNotification: () => void;
}

const CATEGORIES = ['AI/ML', 'Web/App Dev', 'IoT', 'Blockchain', 'Security', 'Mobile Dev', 'Data Science', 'NLP', 'Embedded', 'Algorithms'];

const statusConfig = {
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200/60 dark:border-emerald-500/20',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200/60 dark:border-amber-500/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200/60 dark:border-red-500/20',
  },
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface FormState {
  title: string;
  topic: string;
  category: string;
  supervisor_id: string;
  cgpa_avg: string;
  student_names: string;
}

export default function GroupStatus({ onNewNotification }: GroupStatusProps) {
  const [groups, setGroups] = useState<ThesisGroup[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '', topic: '', category: 'AI/ML', supervisor_id: '', cgpa_avg: '', student_names: ''
  });
  const [error, setError] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [{ data: grps }, { data: sups }, { data: notifs }] = await Promise.all([
      supabase.from('thesis_groups').select('*, supervisor:supervisors(*)').order('created_at', { ascending: false }),
      supabase.from('supervisors').select('*').order('name'),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }),
    ]);
    setGroups((grps || []) as ThesisGroup[]);
    setSupervisors((sups || []) as Supervisor[]);
    setNotifications((notifs || []) as Notification[]);
    setLoading(false);
  }

  async function handleSubmit() {
    setError('');
    if (!form.title.trim() || !form.topic.trim() || !form.supervisor_id || !form.student_names.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    const cgpa = parseFloat(form.cgpa_avg);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 4) {
      setError('CGPA must be between 0.00 and 4.00');
      return;
    }

    setSubmitting(true);
    const student_names = form.student_names.split(',').map(s => s.trim()).filter(Boolean);
    const { data: inserted, error: insertErr } = await supabase
      .from('thesis_groups')
      .insert({
        title: form.title.trim(),
        topic: form.topic.trim(),
        category: form.category,
        supervisor_id: form.supervisor_id,
        student_names,
        cgpa_avg: cgpa,
        status: 'pending',
      })
      .select('*, supervisor:supervisors(*)')
      .single();

    if (insertErr || !inserted) {
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
      return;
    }

    await supabase.from('supervisors').update({
      current_groups: supervisors.find(s => s.id === form.supervisor_id)!.current_groups + 1
    }).eq('id', form.supervisor_id);

    const sup = supervisors.find(s => s.id === form.supervisor_id);
    const notifMsg = `Your proposal "${form.title.trim()}" has been submitted to ${sup?.name}. Status: Pending review.`;
    await supabase.from('notifications').insert({
      group_id: inserted.id,
      message: notifMsg,
      type: 'info',
    });

    setForm({ title: '', topic: '', category: 'AI/ML', supervisor_id: '', cgpa_avg: '', student_names: '' });
    setShowForm(false);
    setSubmitting(false);
    onNewNotification();
    loadAll();
  }

  async function simulateStatusChange(group: ThesisGroup, newStatus: 'accepted' | 'rejected') {
    await supabase.from('thesis_groups').update({ status: newStatus }).eq('id', group.id);
    const msg = newStatus === 'accepted'
      ? `Congratulations! Your thesis proposal "${group.title}" has been accepted.`
      : `Your proposal "${group.title}" was not approved. Please revise and resubmit.`;
    await supabase.from('notifications').insert({
      group_id: group.id,
      message: msg,
      type: newStatus === 'accepted' ? 'success' : 'error',
    });
    onNewNotification();
    loadAll();
  }

  const getGroupNotifications = (groupId: string) =>
    notifications.filter(n => n.group_id === groupId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const availableSups = supervisors.filter(s => s.current_groups < s.max_groups);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{groups.length}</span> total groups
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <FolderKanban size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No groups yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Create your first thesis group to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => {
            const config = statusConfig[group.status];
            const StatusIcon = config.icon;
            const isExpanded = expandedGroup === group.id;
            const groupNotifs = getGroupNotifications(group.id);
            const sup = group.supervisor as unknown as Supervisor | null;
            return (
              <div key={group.id} className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-800 dark:text-white">{group.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400">
                        {group.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{group.topic}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${config.bg} ${config.color} ${config.border}`}>
                      <StatusIcon size={12} />
                      {config.label}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-200/50 dark:border-slate-700/40 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                      <div className="space-y-3">
                        {sup && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ backgroundColor: sup.avatar_color }}
                            >
                              {sup.name.split(' ').map((n: string) => n[0]).slice(1, 3).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{sup.name}</p>
                              <p className="text-xs text-slate-400">{sup.department}</p>
                            </div>
                          </div>
                        )}
                        <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                            <Users size={12} /> Students ({group.student_names.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {group.student_names.map(name => (
                              <span key={name} className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium border border-slate-200/60 dark:border-slate-600/40">
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Avg CGPA:</span>
                          <span className="font-bold text-slate-800 dark:text-white">{Number(group.cgpa_avg).toFixed(2)}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-xs text-slate-400">{timeAgo(group.created_at)}</span>
                        </div>
                        {group.notes && (
                          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-500/20">
                            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">Supervisor Note:</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">{group.notes}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                          Simulate Status (Demo)
                        </p>
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={() => simulateStatusChange(group, 'accepted')}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                          >
                            <CheckCircle size={13} /> Accept
                          </button>
                          <button
                            onClick={() => simulateStatusChange(group, 'rejected')}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200/60 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>

                        {groupNotifs.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Activity Log</p>
                            {groupNotifs.slice(0, 3).map(notif => (
                              <div key={notif.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/40">
                                <AlertCircle size={12} className={`mt-0.5 flex-shrink-0 ${notif.type === 'success' ? 'text-emerald-500' : notif.type === 'error' ? 'text-red-500' : 'text-sky-500'}`} />
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notif.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div
            className="glass-card rounded-2xl w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-white text-lg">Create Thesis Group</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submit your group proposal for supervisor review</p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">Group Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Team Phoenix"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">Project Topic <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                    placeholder="e.g. AI-powered traffic management for Dhaka"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">Category</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">Avg CGPA <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      value={form.cgpa_avg}
                      onChange={e => setForm(p => ({ ...p, cgpa_avg: e.target.value }))}
                      placeholder="3.50"
                      step="0.01"
                      min="0"
                      max="4"
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">
                    Supervisor <span className="text-red-400">*</span>
                    {availableSups.length < supervisors.length && (
                      <span className="text-xs font-normal text-amber-500 ml-2">({supervisors.length - availableSups.length} full)</span>
                    )}
                  </label>
                  <select value={form.supervisor_id} onChange={e => setForm(p => ({ ...p, supervisor_id: e.target.value }))} className="input-field">
                    <option value="">-- Select a supervisor --</option>
                    {supervisors.map(s => (
                      <option key={s.id} value={s.id} disabled={s.current_groups >= s.max_groups}>
                        {s.name} — {s.current_groups}/{s.max_groups} groups{s.current_groups >= s.max_groups ? ' (Full)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">
                    Student Names <span className="text-red-400">*</span>
                    <span className="text-xs font-normal text-slate-400 ml-2">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={form.student_names}
                    onChange={e => setForm(p => ({ ...p, student_names: e.target.value }))}
                    placeholder="Rahul Ahmed, Priya Das, Tanvir Hossain"
                    className="input-field"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {submitting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
