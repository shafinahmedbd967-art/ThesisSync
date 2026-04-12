import { useEffect, useState } from 'react';
import { Lightbulb, Eye, Tag, Play, X, ChevronRight, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProjectIdea } from '../lib/types';

interface ProjectIdeasProps {
  searchQuery: string;
}

const CATEGORIES = ['All', 'AI/ML', 'Web/App Dev', 'IoT', 'Blockchain', 'Security', 'Mobile Dev', 'Data Science', 'NLP'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const difficultyConfig = {
  Easy: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200/60 dark:border-emerald-500/20', dot: 'bg-emerald-500' },
  Medium: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200/60 dark:border-amber-500/20', dot: 'bg-amber-500' },
  Hard: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200/60 dark:border-red-500/20', dot: 'bg-red-500' },
};

const categoryColors: Record<string, string> = {
  'AI/ML': 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200/60 dark:border-violet-500/20',
  'Web/App Dev': 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-500/20',
  'IoT': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20',
  'Blockchain': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20',
  'Security': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-500/20',
  'Mobile Dev': 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200/60 dark:border-pink-500/20',
};

function getCatColor(cat: string) {
  return categoryColors[cat] || 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-600/40';
}

export default function ProjectIdeas({ searchQuery }: ProjectIdeasProps) {
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [selected, setSelected] = useState<ProjectIdea | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    supabase.from('project_ideas').select('*').order('view_count', { ascending: false }).then(({ data }) => {
      setIdeas((data || []) as ProjectIdea[]);
      setLoading(false);
    });
  }, []);

  async function openIdea(idea: ProjectIdea) {
    setSelected(idea);
    setShowVideo(false);
    await supabase.from('project_ideas').update({ view_count: idea.view_count + 1 }).eq('id', idea.id);
    setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, view_count: i.view_count + 1 } : i));
  }

  const filtered = ideas.filter(idea => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || idea.title.toLowerCase().includes(q) || idea.description.toLowerCase().includes(q) || idea.tags.some(t => t.toLowerCase().includes(q));
    const matchCat = category === 'All' || idea.category === category;
    const matchDiff = difficulty === 'All' || idea.difficulty_level === difficulty;
    return matchSearch && matchCat && matchDiff;
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
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  category === cat
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-transparent shadow-md shadow-sky-500/20'
                    : 'bg-white/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/40 hover:border-sky-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  difficulty === d
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-transparent shadow-md shadow-sky-500/20'
                    : 'bg-white/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/40 hover:border-sky-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filtered.length}</span> ideas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(idea => {
          const diff = difficultyConfig[idea.difficulty_level as keyof typeof difficultyConfig] || difficultyConfig.Medium;
          return (
            <button
              key={idea.id}
              onClick={() => openIdea(idea)}
              className="glass-card rounded-2xl p-5 text-left hover:scale-[1.01] transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getCatColor(idea.category)}`}>
                  {idea.category}
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${diff.bg} ${diff.color} ${diff.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                  {idea.difficulty_level}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 dark:text-white leading-snug mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {idea.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                {idea.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {idea.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                    <Tag size={9} />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-700/40">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Eye size={12} />
                  {idea.view_count} views
                </div>
                <div className="flex items-center gap-1 text-xs text-sky-500 font-medium group-hover:gap-2 transition-all">
                  View Details <ChevronRight size={13} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Lightbulb size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No ideas found</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try different filters or search terms</p>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => { setSelected(null); setShowVideo(false); }}>
          <div
            className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getCatColor(selected.category)}`}>
                    {selected.category}
                  </span>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${difficultyConfig[selected.difficulty_level as keyof typeof difficultyConfig]?.bg} ${difficultyConfig[selected.difficulty_level as keyof typeof difficultyConfig]?.color} ${difficultyConfig[selected.difficulty_level as keyof typeof difficultyConfig]?.border}`}>
                    {selected.difficulty_level}
                  </span>
                </div>
                <button
                  onClick={() => { setSelected(null); setShowVideo(false); }}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{selected.title}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-5">{selected.description}</p>

              {selected.video_url && (
                <div className="mb-5">
                  {showVideo ? (
                    <div className="rounded-xl overflow-hidden aspect-video">
                      <iframe
                        src={selected.video_url}
                        title="Project reference video"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play size={18} fill="white" />
                      </div>
                      <span className="font-medium">Watch Reference Video</span>
                    </button>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <TrendingUp size={12} /> Tech Stack & Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium">
                      <Tag size={11} className="text-sky-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-700/40 text-xs text-slate-400">
                <Eye size={12} />
                {selected.view_count} students viewed this idea
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
