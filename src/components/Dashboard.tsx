import React, { useState } from "react";
import { 
  Flame, 
  Clock, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Plus, 
  ChevronRight, 
  Trash2, 
  Sparkles,
  BookMarked
} from "lucide-react";
import { Roadmap, TutorPersona, UserStats, DifficultyLevel } from "../types";
import { TUTOR_PERSONAS, STUDY_TIPS } from "../constants";

interface DashboardProps {
  stats: UserStats;
  roadmaps: Roadmap[];
  activePersona: TutorPersona;
  setActivePersona: (p: TutorPersona) => void;
  onSelectRoadmap: (r: Roadmap) => void;
  onDeleteRoadmap: (id: string, e: React.MouseEvent) => void;
  onGenerateRoadmap: (topic: string, difficulty: DifficultyLevel, audience: string) => Promise<void>;
  loading: boolean;
}

export default function Dashboard({
  stats,
  roadmaps,
  activePersona,
  setActivePersona,
  onSelectRoadmap,
  onDeleteRoadmap,
  onGenerateRoadmap,
  loading
}: DashboardProps) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("beginner");
  const [audience, setAudience] = useState("");
  const [tipIndex] = useState(() => Math.floor(Math.random() * STUDY_TIPS.length));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerateRoadmap(topic, difficulty, audience);
    setTopic("");
    setAudience("");
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="dashboard-container">
      {/* Welcome & Stats Row */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden" id="welcome-banner">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-y-6 translate-x-6">
            <Sparkles size={250} />
          </div>
          <div>
            <span className="bg-slate-800 text-amber-400 font-mono text-xs px-3 py-1.5 rounded-full border border-slate-700/50 uppercase tracking-widest font-semibold inline-flex items-center gap-1.5 mb-4">
              <Sparkles size={12} /> Personalized Academy
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Welcome Back, Scholar!</h1>
            <p className="text-slate-300 text-sm md:text-base max-w-md">
              Your personal AI tutoring team is ready. Choose a study topic below to architect a structured curriculum or talk to your active tutor.
            </p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-4 mt-6 backdrop-blur-sm">
            <h4 className="text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
              💡 Tutor Study Secret
            </h4>
            <p className="text-slate-200 text-xs leading-relaxed">
              {STUDY_TIPS[tipIndex]}
            </p>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full lg:w-[450px]" id="stats-grid">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200">
            <div className="bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 p-3 rounded-2xl w-fit">
              <Flame size={22} />
            </div>
            <div className="mt-4">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-mono uppercase tracking-wider">Day Streak</p>
              <p className="text-3xl font-bold dark:text-white mt-1">{stats.streak} days</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200">
            <div className="bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 p-3 rounded-2xl w-fit">
              <Clock size={22} />
            </div>
            <div className="mt-4">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-mono uppercase tracking-wider">Study Time</p>
              <p className="text-3xl font-bold dark:text-white mt-1">{stats.totalTimeMinutes}m</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200">
            <div className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-2xl w-fit">
              <GraduationCap size={22} />
            </div>
            <div className="mt-4">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-mono uppercase tracking-wider">Completed Topics</p>
              <p className="text-3xl font-bold dark:text-white mt-1">{stats.completedTopicsCount}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200">
            <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-3 rounded-2xl w-fit">
              <Award size={22} />
            </div>
            <div className="mt-4">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-mono uppercase tracking-wider">Avg Quiz Score</p>
              <p className="text-3xl font-bold dark:text-white mt-1">
                {stats.totalQuizzesTaken > 0 ? `${stats.quizAverageScore}%` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tutor Selection Panel */}
      <div className="space-y-4" id="tutor-selection-panel">
        <h2 className="text-xl font-bold dark:text-white tracking-tight flex items-center gap-2">
          <span>🧠</span> Choose Your Active Study Coach
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {TUTOR_PERSONAS.map((persona) => {
            const isSelected = activePersona.id === persona.id;
            return (
              <button
                key={persona.id}
                id={`tutor-${persona.id}`}
                onClick={() => setActivePersona(persona)}
                className={`p-6 rounded-3xl border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden group hover:shadow-md ${
                  isSelected 
                    ? "border-slate-900 dark:border-white ring-2 ring-slate-900 dark:ring-white bg-slate-50 dark:bg-slate-950" 
                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="text-4xl">{persona.avatar}</div>
                  <div className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    persona.color === 'amber' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300' :
                    persona.color === 'teal' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300' :
                    persona.color === 'indigo' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
                  }`}>
                    {persona.role}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{persona.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">{persona.style}</p>
                </div>
                
                {isSelected && (
                  <div className="absolute top-3 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main split: Curriculum Architect & Saved Roadmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between" id="architect-panel">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <BookMarked className="text-indigo-600 dark:text-indigo-400" size={24} />
              <h3 className="font-bold text-xl dark:text-white tracking-tight">Curriculum Architect</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Define any subject (e.g. <i>"Quantum Computing basics"</i> or <i>"Organic Chemistry reactions"</i>) and let the AI architect an structured, custom course roadmap just for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                What do you want to learn?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Modern React with TypeScript, World War I"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white dark:text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(["beginner", "intermediate", "advanced"] as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`py-2 text-xs font-semibold capitalize rounded-xl border transition-all ${
                    difficulty === level
                      ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-transparent"
                      : "bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Any specific goals or background? (Optional)
              </label>
              <textarea
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. 'I am preparing for an exam', 'I already know Javascript'"
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-2xl text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus size={18} /> Architect Custom Roadmap
            </button>
          </form>
        </div>

        {/* List of roadmaps */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col" id="roadmaps-panel">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen size={22} className="text-teal-600 dark:text-teal-400" />
              Your Study Roadmaps
            </h3>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold px-2.5 py-1 rounded-full">
              {roadmaps.length} Total
            </span>
          </div>

          {roadmaps.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl" id="empty-roadmaps">
              <span className="text-4xl mb-3">🧭</span>
              <p className="font-bold text-slate-700 dark:text-slate-300">No roadmaps architected yet</p>
              <p className="text-slate-400 text-xs max-w-xs mt-1">
                Enter a topic in the Curriculum Architect on the left to start your personalized education journey.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1" id="roadmaps-list">
              {roadmaps.map((roadmap) => (
                <div
                  key={roadmap.id}
                  onClick={() => onSelectRoadmap(roadmap)}
                  className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100/80 dark:border-slate-800/60 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-slate-100/30 dark:hover:bg-slate-950/80 transition-all duration-200 cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        roadmap.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400' :
                        roadmap.difficulty === 'intermediate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400' :
                        'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {roadmap.difficulty}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">
                        ⏱️ {roadmap.estimatedTime}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">{roadmap.title}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{roadmap.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => onDeleteRoadmap(roadmap.id, e)}
                      className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete roadmap"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
