import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Moon, 
  Sun, 
  GraduationCap, 
  Flame, 
  Award, 
  Clock, 
  UserCheck, 
  BookMarked,
  Info
} from "lucide-react";
import { Roadmap, Topic, Module, TutorPersona, UserStats } from "./types";
import { TUTOR_PERSONAS } from "./constants";
import Dashboard from "./components/Dashboard";
import RoadmapView from "./components/RoadmapView";
import ChatView from "./components/ChatView";
import QuizView from "./components/QuizView";
import FlashcardsView from "./components/FlashcardsView";
import ExplainView from "./components/ExplainView";

const STORAGE_KEYS = {
  STATS: "ai_tutor_stats",
  ROADMAPS: "ai_tutor_roadmaps",
  ACTIVE_PERSONA: "ai_tutor_active_persona",
  DARK_MODE: "ai_tutor_dark_mode"
};

// Initial template roadmaps to populate the applet on first load
const INITIAL_ROADMAPS: Roadmap[] = [
  {
    id: "ts-intro",
    title: "TypeScript Deep Dive",
    description: "Learn robust typed systems, complex interfaces, union/intersection types, generic design patterns, and ES module setups.",
    difficulty: "intermediate",
    estimatedTime: "8 hours",
    targetAudience: "Developers looking to scale applications with rigorous type safety.",
    createdAt: Date.now() - 86400000 * 3,
    modules: [
      {
        id: "ts-mod-1",
        title: "Rigorous Type Fundamentals",
        description: "Master standard types, object configurations, and function constraints.",
        duration: "3 hours",
        topics: [
          {
            id: "ts-topic-1",
            title: "Strict Objects & Explicit Arrays",
            description: "Deep dive into strongly typing structural properties, index signatures, and strict arrays.",
            status: "not_started"
          },
          {
            id: "ts-topic-2",
            title: "Advanced Union & Literal Types",
            description: "Harness narrow value boundaries using literal lists and optional mapping logic.",
            status: "not_started"
          }
        ]
      },
      {
        id: "ts-mod-2",
        title: "Generics & Intersections",
        description: "Scale reusable logic with polymorphic classes and functions.",
        duration: "5 hours",
        topics: [
          {
            id: "ts-topic-3",
            title: "Generic Parameters & Constraints",
            description: "Construct flexible yet strongly-typed function bounds using the 'extends' keyword.",
            status: "not_started"
          },
          {
            id: "ts-topic-4",
            title: "Utility Types",
            description: "Leverage advanced native operations like Pick, Partial, Omit, and Record.",
            status: "not_started"
          }
        ]
      }
    ]
  },
  {
    id: "socratic-philosophy",
    title: "The Socratic Method of Inquiry",
    description: "Explore the art of critical reasoning, philosophical questioning, and conceptual deconstruction.",
    difficulty: "beginner",
    estimatedTime: "4 hours",
    targetAudience: "Curious minds seeking to master analytical questioning and dialogue.",
    createdAt: Date.now() - 86400000,
    modules: [
      {
        id: "soc-mod-1",
        title: "Elenchus & Dialogue",
        description: "Understand Socratic cross-examination and critical refutation.",
        duration: "4 hours",
        topics: [
          {
            id: "soc-topic-1",
            title: "The Art of Constructive Irony",
            description: "Learn how starting with a declaration of ignorance (aporia) triggers objective conceptual thinking.",
            status: "not_started"
          },
          {
            id: "soc-topic-2",
            title: "Formulating Guiding Questions",
            description: "Design queries that expose cognitive biases, circular definitions, and structural contradictions.",
            status: "not_started"
          }
        ]
      }
    ]
  }
];

const INITIAL_STATS: UserStats = {
  streak: 3,
  lastStudyDate: new Date().toISOString().split('T')[0],
  totalTimeMinutes: 45,
  completedTopicsCount: 0,
  totalQuizzesTaken: 0,
  quizAverageScore: 0
};

export default function App() {
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activePersona, setActivePersona] = useState<TutorPersona>(TUTOR_PERSONAS[0]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active View navigation
  const [currentView, setCurrentView] = useState<'dashboard' | 'roadmap' | 'chat' | 'quiz' | 'flashcards' | 'explain'>('dashboard');
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [explainStyle, setExplainStyle] = useState<string>("interactive_tutor");

  // Initial Load from local storage
  useEffect(() => {
    // Stats
    const savedStats = localStorage.getItem(STORAGE_KEYS.STATS);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    } else {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(INITIAL_STATS));
    }

    // Roadmaps
    const savedRoadmaps = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
    if (savedRoadmaps) {
      setRoadmaps(JSON.parse(savedRoadmaps));
    } else {
      setRoadmaps(INITIAL_ROADMAPS);
      localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(INITIAL_ROADMAPS));
    }

    // Active Persona
    const savedPersona = localStorage.getItem(STORAGE_KEYS.ACTIVE_PERSONA);
    if (savedPersona) {
      const found = TUTOR_PERSONAS.find(p => p.id === savedPersona);
      if (found) setActivePersona(found);
    }

    // Dark Mode
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  // Sync Stats to storage
  const updateStats = (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
  };

  // Sync Roadmaps to storage
  const updateRoadmaps = (newRoadmaps: Roadmap[]) => {
    setRoadmaps(newRoadmaps);
    localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(newRoadmaps));
  };

  // Toggle Dark Mode
  const handleToggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(newVal));
    if (newVal) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Handle Persona Change
  const handleSelectPersona = (persona: TutorPersona) => {
    setActivePersona(persona);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PERSONA, persona.id);
  };

  // Delete Roadmap
  const handleDeleteRoadmap = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening the deleted item
    if (confirm("Are you sure you want to delete this roadmap syllabus? This cannot be undone.")) {
      const updated = roadmaps.filter(r => r.id !== id);
      updateRoadmaps(updated);
      if (selectedRoadmap?.id === id) {
        setSelectedRoadmap(null);
        setCurrentView('dashboard');
      }
    }
  };

  // Toggle topic completed status
  const handleToggleTopicStatus = (topicId: string, status: 'completed' | 'not_started') => {
    if (!selectedRoadmap) return;

    // Map modules and subtopics
    const updatedModules = selectedRoadmap.modules.map(mod => {
      const updatedTopics = mod.topics.map(topic => {
        if (topic.id === topicId) {
          return { ...topic, status };
        }
        return topic;
      });
      return { ...mod, topics: updatedTopics };
    });

    const updatedRoadmap = { ...selectedRoadmap, modules: updatedModules };
    setSelectedRoadmap(updatedRoadmap);

    // Sync in global lists
    const updatedGlobal = roadmaps.map(r => r.id === selectedRoadmap.id ? updatedRoadmap : r);
    updateRoadmaps(updatedGlobal);

    // Re-calculate stats
    const totalCompleted = updatedGlobal.flatMap(r => r.modules.flatMap(m => m.topics)).filter(t => t.status === 'completed').length;
    
    // Check daily streak increment (if first completion of the day)
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = stats.streak;
    if (stats.lastStudyDate !== todayStr) {
      newStreak += 1;
    }

    updateStats({
      ...stats,
      completedTopicsCount: totalCompleted,
      streak: newStreak,
      lastStudyDate: todayStr
    });
  };

  // Generate dynamic curriculum from API
  const handleGenerateRoadmap = async (topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced', audience: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, targetAudience: audience })
      });

      if (!response.ok) {
        let errMsg = "Tutor API failed to process the request. Make sure GEMINI_API_KEY is configured.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      
      const newRoadmap: Roadmap = {
        id: `rm-${Date.now()}`,
        title: data.title,
        description: data.description,
        difficulty,
        estimatedTime: data.estimatedTime || "12 hours",
        targetAudience: data.targetAudience || "No prior experience required.",
        createdAt: Date.now(),
        modules: data.modules.map((m: any, mIdx: number) => ({
          id: `mod-${mIdx}-${Date.now()}`,
          title: m.title,
          description: m.description,
          duration: m.duration || "2 hours",
          topics: m.topics.map((t: any, tIdx: number) => ({
            id: `topic-${mIdx}-${tIdx}-${Date.now()}`,
            title: t.title,
            description: t.description,
            status: "not_started"
          }))
        }))
      };

      const updated = [newRoadmap, ...roadmaps];
      updateRoadmaps(updated);
      setSelectedRoadmap(newRoadmap);
      setCurrentView('roadmap');
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to contact Socratic tutor network. Check your secrets.");
    } finally {
      setLoading(false);
    }
  };

  // Record completed study duration
  const handleUpdateStudyTime = (minutes: number) => {
    updateStats({
      ...stats,
      totalTimeMinutes: stats.totalTimeMinutes + minutes
    });
  };

  // Record quiz score stats
  const handleRecordQuizScore = (scorePercent: number) => {
    const totalTaken = stats.totalQuizzesTaken + 1;
    const newAverage = Math.round(((stats.quizAverageScore * stats.totalQuizzesTaken) + scorePercent) / totalTaken);
    
    updateStats({
      ...stats,
      totalQuizzesTaken: totalTaken,
      quizAverageScore: newAverage
    });
  };

  const handleStartStudy = (
    action: 'chat' | 'quiz' | 'flashcards' | 'explain', 
    topic: Topic, 
    module: Module
  ) => {
    setActiveTopic(topic);
    setActiveModule(module);
    
    if (action === 'explain') {
      // Find what select was set to
      const selectElement = document.querySelector("select") as HTMLSelectElement | null;
      setExplainStyle(selectElement?.value || "socratic");
    }

    setCurrentView(action);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Dynamic Top App Banner */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div 
            onClick={() => { setCurrentView('dashboard'); setSelectedRoadmap(null); }}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 p-2.5 rounded-2xl flex items-center justify-center font-black shadow-md">
              <span>🏛️</span>
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg leading-tight flex items-center gap-1.5">
                AI Personal Tutor <span className="bg-indigo-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-extrabold">Agent</span>
              </span>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-widest font-mono">
                Active Learning Roadmap Engine
              </p>
            </div>
          </div>

          {/* User Quick Metrics & Options */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Metrics */}
            <div className="hidden md:flex items-center gap-5 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-2xl">
              <div className="flex items-center gap-1.5 font-mono text-xs text-orange-600 dark:text-orange-400">
                <Flame size={14} className="fill-orange-100/50 dark:fill-transparent" />
                <span className="font-bold">{stats.streak}d Streak</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-teal-600 dark:text-teal-400">
                <Clock size={14} />
                <span className="font-bold">{stats.totalTimeMinutes}m</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                <BookMarked size={14} />
                <span className="font-bold">{stats.completedTopicsCount} Done</span>
              </div>
            </div>

            {/* Dark/Light mode toggle */}
            <button
              onClick={handleToggleDarkMode}
              className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-2xl transition-colors cursor-pointer"
              title="Toggle theme mode"
              id="theme-toggle"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8" id="main-content-layout">
        
        {/* Universal Loading Modal (Generation) */}
        {loading && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" id="global-architect-loading">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl animate-scaleUp">
              <div className="relative flex items-center justify-center h-16 w-16 mx-auto bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <span className="text-3xl animate-spin">🧭</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">Architecting Syllabus</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Engaging Socratic modeling, sequencing curriculum modules, and generating conceptual subtopics...
                </p>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-2/3 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 rounded-2xl flex items-center gap-3 text-xs" id="global-error-banner">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <strong className="font-semibold">Tutor Connection Issue:</strong> {errorMsg}
            </div>
            <button 
              onClick={() => setErrorMsg(null)}
              className="text-slate-400 hover:text-slate-950 dark:hover:text-white font-bold ml-2"
            >
              &times;
            </button>
          </div>
        )}

        {/* Dynamic Route views */}
        {currentView === 'dashboard' && (
          <Dashboard
            stats={stats}
            roadmaps={roadmaps}
            activePersona={activePersona}
            setActivePersona={handleSelectPersona}
            onSelectRoadmap={(roadmap) => { setSelectedRoadmap(roadmap); setCurrentView('roadmap'); }}
            onDeleteRoadmap={handleDeleteRoadmap}
            onGenerateRoadmap={handleGenerateRoadmap}
            loading={loading}
          />
        )}

        {currentView === 'roadmap' && selectedRoadmap && (
          <RoadmapView
            roadmap={selectedRoadmap}
            activePersona={activePersona}
            onBack={() => { setCurrentView('dashboard'); setSelectedRoadmap(null); }}
            onToggleTopicStatus={handleToggleTopicStatus}
            onStartStudy={handleStartStudy}
          />
        )}

        {currentView === 'chat' && activeTopic && activeModule && (
          <ChatView
            topic={activeTopic}
            module={activeModule}
            persona={activePersona}
            onBack={() => setCurrentView('roadmap')}
            onUpdateStudyTime={handleUpdateStudyTime}
          />
        )}

        {currentView === 'quiz' && activeTopic && activeModule && (
          <QuizView
            topic={activeTopic}
            module={activeModule}
            persona={activePersona}
            onBack={() => setCurrentView('roadmap')}
            onRecordQuizScore={handleRecordQuizScore}
          />
        )}

        {currentView === 'flashcards' && activeTopic && activeModule && (
          <FlashcardsView
            topic={activeTopic}
            module={activeModule}
            persona={activePersona}
            onBack={() => setCurrentView('roadmap')}
            onUpdateStudyTime={handleUpdateStudyTime}
          />
        )}

        {currentView === 'explain' && activeTopic && activeModule && (
          <ExplainView
            topic={activeTopic}
            module={activeModule}
            persona={activePersona}
            style={explainStyle}
            onBack={() => setCurrentView('roadmap')}
            onToggleTopicStatus={handleToggleTopicStatus}
            onUpdateStudyTime={handleUpdateStudyTime}
          />
        )}

      </main>

      {/* Footer copyright */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 px-6 py-6 mt-12 text-center text-xs text-slate-400 dark:text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 AI Personal Tutor Agent. Built with Socratic pedagogy & Gemini 3.5 Flash.</p>
          <div className="flex gap-4">
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-amber-500 dark:text-amber-400 font-bold flex items-center gap-1">
              🏛️ Dedicated to Curious Minds
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
