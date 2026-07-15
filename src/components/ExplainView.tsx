import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Copy, 
  Check, 
  RotateCcw,
  BookOpen,
  Volume2
} from "lucide-react";
import { Topic, Module, TutorPersona } from "../types";

interface ExplainViewProps {
  topic: Topic;
  module: Module;
  persona: TutorPersona;
  style: string;
  onBack: () => void;
  onToggleTopicStatus: (topicId: string, status: 'completed' | 'not_started') => void;
  onUpdateStudyTime: (minutes: number) => void;
}

export default function ExplainView({
  topic,
  module,
  persona,
  style,
  onBack,
  onToggleTopicStatus,
  onUpdateStudyTime
}: ExplainViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    fetchExplanation();
  }, [topic.id, style]);

  // Track study time when unmounting
  useEffect(() => {
    return () => {
      const minutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));
      onUpdateStudyTime(minutes);
    };
  }, []);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    setContent("");

    try {
      const response = await fetch("/api/explain-concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.title,
          style: style
        })
      });

      if (!response.ok) {
        let errMsg = "Unable to contact AI engine to explain concept.";
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
      setContent(data.text);
    } catch (err: any) {
      setError(err.message || "Failed to generate lesson content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const isCompleted = topic.status === 'completed';

  // Beautiful parsing engine for general markdown
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let keyCounter = 0;

    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks ```
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          // Closing code block
          const fullCode = codeContent.join("\n");
          const blockLang = codeLanguage;
          elements.push(
            <div key={`code-${keyCounter++}`} className="my-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono shadow-sm">
              <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  {blockLang || "Code block"}
                </span>
                <button
                  onClick={() => handleCopyCode(fullCode)}
                  className="p-1 text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                  title="Copy code"
                >
                  {copiedText ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedText ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-4 text-xs overflow-x-auto text-slate-800 dark:text-slate-100 leading-relaxed font-semibold">
                <code>{fullCode}</code>
              </pre>
            </div>
          );
          codeContent = [];
          codeLanguage = "";
          inCodeBlock = false;
        } else {
          // Opening code block
          inCodeBlock = true;
          codeLanguage = line.trim().substring(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Headers #, ##, ###
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={keyCounter++} className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-6 mb-3 tracking-tight">
            {line.substring(2)}
          </h1>
        );
        continue;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={keyCounter++} className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mt-6 mb-3 tracking-tight">
            {line.substring(3)}
          </h2>
        );
        continue;
      }
      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={keyCounter++} className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-5 mb-2.5 tracking-tight">
            {line.substring(4)}
          </h3>
        );
        continue;
      }

      // Blockquotes >
      if (line.trim().startsWith(">")) {
        elements.push(
          <blockquote key={keyCounter++} className="border-l-4 border-indigo-500 dark:border-indigo-400 pl-4 py-1 my-4 text-slate-600 dark:text-slate-400 italic text-sm bg-indigo-50/20 dark:bg-indigo-950/5 rounded-r-xl">
            {line.trim().substring(1).trim()}
          </blockquote>
        );
        continue;
      }

      // Horizontal lines ---
      if (line.trim() === "---") {
        elements.push(
          <hr key={keyCounter++} className="border-slate-100 dark:border-slate-800/80 my-6" />
        );
        continue;
      }

      // Handle bold text, inline code, and normal formatting inside lists or paragraphs
      const formatInlineElements = (str: string) => {
        // Simple regex-based splitting for bold **text** and code `text`
        const parts: React.ReactNode[] = [];
        let index = 0;
        
        // Find both code and bold tokens
        const tokenRegex = /(\*\*|`)(.*?)\1/g;
        let match;
        
        while ((match = tokenRegex.exec(str)) !== null) {
          if (match.index > index) {
            parts.push(str.substring(index, match.index));
          }
          const token = match[1];
          const text = match[2];
          
          if (token === "**") {
            parts.push(<strong key={`b-${match.index}`} className="font-extrabold text-slate-950 dark:text-white">{text}</strong>);
          } else {
            parts.push(<code key={`c-${match.index}`} className="bg-slate-100 dark:bg-slate-800/80 text-rose-500 font-mono text-xs px-1.5 py-0.5 rounded">{text}</code>);
          }
          index = tokenRegex.lastIndex;
        }
        
        if (index < str.length) {
          parts.push(str.substring(index));
        }
        
        return parts.length > 0 ? parts : str;
      };

      // Unordered List - or *
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        elements.push(
          <li key={keyCounter++} className="ml-5 list-disc text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-2">
            {formatInlineElements(line.trim().substring(2))}
          </li>
        );
        continue;
      }

      // Numbered List 1.
      const numListMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numListMatch) {
        elements.push(
          <li key={keyCounter++} className="ml-5 list-decimal text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-2">
            {formatInlineElements(numListMatch[2])}
          </li>
        );
        continue;
      }

      // Paragraph
      if (line.trim() !== "") {
        elements.push(
          <p key={keyCounter++} className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-4">
            {formatInlineElements(line)}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg animate-fadeIn" id="explain-view-root">
      {/* Header Bar */}
      <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Back to roadmap"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
              Interactive AI Lesson
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium uppercase tracking-wider font-mono">
              Topic: {topic.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Style:</span>
          <span className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 px-3 py-1 rounded-full text-xs font-bold text-indigo-800 dark:text-indigo-300">
            {style === "socratic" ? "🏛️ Socratic Style" :
             style === "elif" ? "👶 ELI5 (Explain Like 5)" :
             style === "coder" ? "💻 Senior Engineer" :
             style === "interactive_tutor" ? "👩‍🏫 Interactive Tutor" :
             "💡 Analogy & Breakdown"}
          </span>
        </div>
      </div>

      {/* Main content body */}
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        {loading ? (
          <div className="py-24 text-center space-y-4" id="explain-loading">
            <Loader2 size={36} className="animate-spin text-indigo-600 mx-auto" />
            <p className="text-slate-500 font-bold tracking-tight">Drafting Study Sheets...</p>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">
              Please wait while {persona.name} organizes analogies, diagrams, definitions, and code structures.
            </p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-4" id="explain-error">
            <span className="text-4xl">⚠️</span>
            <p className="text-slate-800 dark:text-white font-bold">Failed to Fetch Lesson</p>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">{error}</p>
            <button
              onClick={fetchExplanation}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1 mx-auto"
            >
              <RotateCcw size={14} /> Retry Generation
            </button>
          </div>
        ) : (
          /* Render parsed content */
          <div className="space-y-6" id="explain-content-parsed">
            
            {/* Pedagogical Tutor Card */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-start gap-4 mb-8">
              <div className="text-4xl">{persona.avatar}</div>
              <div className="space-y-1">
                <p className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tutor Commentary</p>
                <p className="text-slate-600 dark:text-slate-400 text-xs italic leading-relaxed">
                  "I have custom-authored this breakdown based on my tutoring style. Pay close attention to the analogies, and practice writing the code blocks manually to build active muscle memory!"
                </p>
              </div>
            </div>

            <article className="prose dark:prose-invert max-w-none prose-slate">
              {renderMarkdown(content)}
            </article>

            {/* Bottom Actions Row */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleTopicStatus(topic.id, isCompleted ? 'not_started' : 'completed')}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm border cursor-pointer ${
                    isCompleted
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                      : "bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-transparent hover:opacity-90"
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-50 dark:fill-emerald-950/10" /> Topic Mastered!
                    </>
                  ) : (
                    <>
                      <Circle size={18} /> Mark as Mastered
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-2xl text-sm transition-all cursor-pointer"
                >
                  Return to Syllabus
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
