import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, Users, Star, ChevronRight, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Supervisor } from '../lib/types';

const CATEGORIES = ['AI/ML', 'Web/App Dev', 'IoT', 'Blockchain', 'Security', 'Mobile Dev', 'Data Science', 'NLP', 'Embedded', 'Algorithms'];
const CGPA_RANGES = [
  { label: '3.75 - 4.00 (Excellent)', value: 3.875 },
  { label: '3.50 - 3.74 (Very Good)', value: 3.62 },
  { label: '3.25 - 3.49 (Good)', value: 3.37 },
  { label: '3.00 - 3.24 (Average)', value: 3.12 },
  { label: 'Below 3.00', value: 2.8 },
];

interface ScoredSupervisor extends Supervisor {
  matchScore: number;
  matchReasons: string[];
}

function computeMatch(sup: Supervisor, interests: string[], cgpa: number, topic: string): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const topicLower = topic.toLowerCase();

  interests.forEach(interest => {
    if (sup.expertise.some(e => e.toLowerCase().includes(interest.toLowerCase()) || interest.toLowerCase().includes(e.toLowerCase()))) {
      score += 30;
      reasons.push(`Expertise in ${interest}`);
    }
  });

  if (topic) {
    const topicMatches = sup.expertise.filter(e => e.toLowerCase().split(' ').some(word => topicLower.includes(word)));
    if (topicMatches.length > 0) {
      score += 25;
      reasons.push(`Topic aligns with ${topicMatches[0]}`);
    }
    if (sup.bio.toLowerCase().includes(topicLower.split(' ')[0])) {
      score += 10;
      reasons.push('Research background matches');
    }
  }

  const slots = sup.max_groups - sup.current_groups;
  if (slots >= 2) { score += 20; reasons.push('High availability'); }
  else if (slots === 1) { score += 10; reasons.push('1 slot available'); }
  else { score -= 20; }

  if (cgpa >= 3.75) score += 15;
  else if (cgpa >= 3.5) score += 10;
  else if (cgpa >= 3.25) score += 5;

  return { score: Math.max(0, Math.min(100, score)), reasons: reasons.slice(0, 3) };
}

export default function SupervisorSuggestion() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [cgpa, setCgpa] = useState<number>(3.875);
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState<ScoredSupervisor[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('supervisors').select('*').then(({ data }) => {
      setSupervisors((data || []) as Supervisor[]);
    });
  }, []);

  function toggleInterest(cat: string) {
    setSelectedInterests(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  function handleSearch() {
    setLoading(true);
    setTimeout(() => {
      const scored = supervisors
        .map(sup => {
          const { score, reasons } = computeMatch(sup, selectedInterests, cgpa, topic);
          return { ...sup, matchScore: score, matchReasons: reasons };
        })
        .filter(s => s.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);
      setResults(scored);
      setSearched(true);
      setLoading(false);
    }, 600);
  }

  function reset() {
    setSelectedInterests([]);
    setCgpa(3.875);
    setTopic('');
    setResults([]);
    setSearched(false);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">Smart Supervisor Matching</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Fill in your details to find the best supervisor match</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">
              Your Interests <span className="text-slate-400 font-normal">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleInterest(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    selectedInterests.includes(cat)
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-transparent shadow-md shadow-sky-500/25 scale-105'
                      : 'bg-white/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-600/40 hover:border-sky-400 dark:hover:border-sky-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">Your CGPA Range</label>
              <select
                value={cgpa}
                onChange={e => setCgpa(parseFloat(e.target.value))}
                className="input-field"
              >
                {CGPA_RANGES.map(r => (
                  <option key={r.label} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">
                Project Topic <span className="text-slate-400 font-normal">(optional keyword)</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. face recognition, smart city..."
                className="input-field"
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSearch} disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {loading ? 'Finding matches...' : 'Find Best Supervisors'}
            </button>
            {searched && (
              <button onClick={reset} className="btn-secondary flex items-center gap-2">
                <RefreshCw size={15} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {searched && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">
              {results.length > 0 ? `${results.length} Best Matches Found` : 'No matches found'}
            </h3>
          </div>

          {results.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Sparkles size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No supervisors matched your criteria</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try selecting different interests or a broader topic</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((sup, idx) => {
                const isFull = sup.current_groups >= sup.max_groups;
                const scoreColor = sup.matchScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : sup.matchScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400';
                const scoreBg = sup.matchScore >= 70 ? 'from-emerald-500 to-teal-500' : sup.matchScore >= 40 ? 'from-amber-500 to-orange-500' : 'from-slate-400 to-slate-500';
                return (
                  <div key={sup.id} className={`glass-card rounded-2xl p-5 hover:scale-[1.01] transition-all duration-200 ${idx === 0 ? 'ring-2 ring-sky-400/40' : ''}`}>
                    {idx === 0 && (
                      <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-3 py-1 rounded-lg w-fit">
                        <Star size={11} fill="currentColor" /> Top Match
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                        style={{ backgroundColor: sup.avatar_color }}
                      >
                        {sup.name.split(' ').map(n => n[0]).slice(1, 3).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 dark:text-white truncate">{sup.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{sup.department}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {isFull ? (
                            <span className="text-xs text-red-500 font-semibold">Full</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                              <CheckCircle size={11} />{sup.max_groups - sup.current_groups} slot(s) left
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-2xl font-black ${scoreColor}`}>{sup.matchScore}%</p>
                        <p className="text-[10px] text-slate-400 font-medium">match</p>
                      </div>
                    </div>

                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full bg-gradient-to-r ${scoreBg} rounded-full transition-all duration-700`}
                        style={{ width: `${sup.matchScore}%` }}
                      />
                    </div>

                    {sup.matchReasons.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {sup.matchReasons.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <ChevronRight size={12} className="text-sky-500 flex-shrink-0" />
                            {r}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/50 dark:border-slate-700/40">
                      {sup.expertise.slice(0, 3).map(exp => (
                        <span key={exp} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                          {exp}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Users size={12} className="text-slate-400" />
                      <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-sky-500'}`}
                          style={{ width: `${(sup.current_groups / sup.max_groups) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{sup.current_groups}/{sup.max_groups}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
