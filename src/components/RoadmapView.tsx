import React, { useState } from "react";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  PlayCircle, 
  BrainCircuit, 
  BookOpen, 
  HelpCircle,
  FileText,
  BookmarkCheck,
  Award
} from "lucide-react";
import { Roadmap, Topic, Module, TutorPersona } from "../types";

interface RoadmapViewProps {
  roadmap: Roadmap;
  onBack: () => void;
  activePersona: TutorPersona;
  onToggleTopicStatus: (topicId: string, status: 'completed' | 'not_started') => void;
  onStartStudy: (action: 'chat' | 'quiz' | 'flashcards' | 'explain', topic: Topic, module: Module) => void;
}

export default function RoadmapView({
  roadmap,
  onBack,
  activePersona,
  onToggleTopicStatus,
  onStartStudy
}: RoadmapViewProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [explainStyle, setExplainStyle] = useState<string>("interactive_tutor");

  // Calculate total topics and completed topics
  const allTopics = roadmap.modules.flatMap(m => m.topics);
  const totalTopics = allTopics.length;
  const completedTopics = allTopics.filter(t => t.status === 'completed').length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Find currently selected topic and its parent module
  let selectedTopic: Topic | null = null;
  let selectedModule: Module | null = null;

  for (const mod of roadmap.modules) {
    const topic = mod.topics.find(t => t.id === selectedTopicId);
    if (topic) {
      selectedTopic = topic;
      selectedModule = mod;
      break;
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn" id="roadmap-view-root">
      {/* Header card with back navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1.5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono ${
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight dark:text-white">{roadmap.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">{roadmap.description}</p>
        </div>

        {/* Progress Bar & Summary */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 min-w-[240px] flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Course Progress</span>
            <span className="text-sm font-bold dark:text-white">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <BookmarkCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>{completedTopics} of {totalTopics} topics mastered</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Modules on left, Study Desk on right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Module Content */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-lg font-bold dark:text-white tracking-tight">🗺️ Curriculum Roadmap Syllabus</h2>
          {roadmap.modules.map((mod, index) => (
            <div 
              key={mod.id} 
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
              id={`module-${mod.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Module 0{index + 1} • {mod.duration}
                  </span>
                  <h3 className="font-bold text-lg dark:text-white text-slate-900 tracking-tight">{mod.title}</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-xs">{mod.description}</p>
                </div>
              </div>

              {/* Topics inside Module */}
              <div className="space-y-2 mt-4" id={`topics-list-${mod.id}`}>
                {mod.topics.map((topic) => {
                  const isSelected = selectedTopicId === topic.id;
                  const isCompleted = topic.status === 'completed';
                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? "bg-slate-50 dark:bg-slate-950 border-slate-900 dark:border-white shadow-sm"
                          : "bg-transparent border-slate-100/60 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        {/* Completion Checkmark */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTopicStatus(topic.id, isCompleted ? 'not_started' : 'completed');
                          }}
                          className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                          title={isCompleted ? "Mark as uncompleted" : "Mark as completed"}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={20} className="text-emerald-500 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950/20" />
                          ) : (
                            <Circle size={20} className="text-slate-300 dark:text-slate-700 hover:scale-105 transition-transform" />
                          )}
                        </button>
                        
                        <div className="min-w-0">
                          <p className={`text-sm font-bold tracking-tight ${isCompleted ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                            {topic.title}
                          </p>
                          <p className="text-slate-400 dark:text-slate-500 text-xs truncate max-w-sm md:max-w-md">
                            {topic.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <span className="text-[10px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-1 rounded-md font-mono font-bold uppercase tracking-wider">
                            Active
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 text-xs font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            Study &rarr;
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Study Desk Options */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-6">
            <h2 className="text-lg font-bold dark:text-white tracking-tight flex items-center gap-2">
              <span>🎛️</span> Study Desk Controls
            </h2>

            {!selectedTopic ? (
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center" id="no-topic-selected">
                <div className="text-4xl mb-3">☝️</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Select a Topic to study</h3>
                <p className="text-slate-400 text-xs mt-2 max-w-xs mx-auto">
                  Click on any granular concept on the left to activate your study desk controls and select an AI lesson, quiz, or chat.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6 animate-slideUp" id="study-deck-active">
                {/* Active Subtopic Summary */}
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    ACTIVE SUBTOPIC
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight mt-1">
                    {selectedTopic.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-1.5">
                    {selectedTopic.description}
                  </p>
                </div>

                {/* Coach Assistant Info */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                  <div className="text-3xl">{activePersona.avatar}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">ACTIVE COACH</p>
                    <p className="font-bold text-sm dark:text-white">{activePersona.name} • <span className="font-normal text-slate-500 dark:text-slate-400 text-xs">{activePersona.role}</span></p>
                  </div>
                </div>

                {/* Study Methods Menu */}
                <div className="space-y-3">
                  <p className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">CHOOSE STUDY METHOD</p>
                  
                  {/* Socratic Explanation */}
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 p-2 rounded-xl">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm dark:text-white">Explain Concept</h4>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Let the AI explain this topic in your favorite pedagogical style.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <select
                        value={explainStyle}
                        onChange={(e) => setExplainStyle(e.target.value)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="interactive_tutor">👩‍🏫 Interactive Tutor</option>
                        <option value="socratic">🏛️ Socratic Style</option>
                        <option value="elif">👶 ELI5 (Explain like 5)</option>
                        <option value="coder">💻 Senior Engineer</option>
                        <option value="analogy">💡 Analogy & Breakdown</option>
                      </select>

                      <button
                        onClick={() => selectedTopic && selectedModule && onStartStudy('explain', selectedTopic, selectedModule)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1 hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        <Sparkles size={14} /> Go Learn
                      </button>
                    </div>
                  </div>

                  {/* Socratic Dialogue Chat */}
                  <button
                    onClick={() => selectedTopic && selectedModule && onStartStudy('chat', selectedTopic, selectedModule)}
                    className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all group cursor-pointer"
                  >
                    <div className="bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
                      <BrainCircuit size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm dark:text-white flex items-center justify-between">
                        Socratic Chat <span>&rarr;</span>
                      </h4>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Engage in Socratic dialogue. Think through code, math, or history together.</p>
                    </div>
                  </button>

                  {/* Multiple Choice Quiz */}
                  <button
                    onClick={() => selectedTopic && selectedModule && onStartStudy('quiz', selectedTopic, selectedModule)}
                    className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all group cursor-pointer"
                  >
                    <div className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
                      <Award size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm dark:text-white flex items-center justify-between">
                        Interactive Quiz <span>&rarr;</span>
                      </h4>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Consolidate knowledge with 5 custom-generated multiple choice questions.</p>
                    </div>
                  </button>

                  {/* Active Recall Flashcards */}
                  <button
                    onClick={() => selectedTopic && selectedModule && onStartStudy('flashcards', selectedTopic, selectedModule)}
                    className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all group cursor-pointer"
                  >
                    <div className="bg-teal-100 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
                      <BookOpen size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm dark:text-white flex items-center justify-between">
                        Active Recall Flashcards <span>&rarr;</span>
                      </h4>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Train long-term memory using 6 targeted flippable study cards.</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
