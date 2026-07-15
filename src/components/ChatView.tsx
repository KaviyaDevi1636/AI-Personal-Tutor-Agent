import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Loader2, 
  HelpCircle,
  Volume2
} from "lucide-react";
import { Topic, Module, TutorPersona, Message } from "../types";

interface ChatViewProps {
  topic: Topic;
  module: Module;
  persona: TutorPersona;
  onBack: () => void;
  onUpdateStudyTime: (minutes: number) => void;
}

export default function ChatView({
  topic,
  module,
  persona,
  onBack,
  onUpdateStudyTime
}: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: `Hello there! I am ${persona.name}, your ${persona.role}. I am very excited to explore **${topic.title}** under **${module.title}** with you.\n\nMy tutoring style is: *${persona.style}*.\n\nTo begin our learning journey, what is your current understanding of this topic, or do you have a specific question about it?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Track study time when unmounting
  useEffect(() => {
    return () => {
      const minutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));
      onUpdateStudyTime(minutes);
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    setInput("");

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          history: messages.slice(1).concat(userMessage), // skip welcome message to keep payload light & standard
          systemInstruction: persona.systemInstruction + `\n\nYou are tutoring the user specifically on the topic "${topic.title}: ${topic.description}" which is part of the module "${module.title}". Keep the dialogue active and Socratic.`
        })
      });

      if (!response.ok) {
        let errMsg = "Failed to receive tutor response.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: data.text,
        timestamp: Date.now()
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        sender: "assistant",
        text: `My apologies, friend! An unexpected network issue occurred:\n\n**${err.message || "Failed to process chat response from Gemini API."}**\n\n*Tip: If you're running this on Vercel or GitHub, make sure you have added the ` + "`" + `GEMINI_API_KEY` + "`" + ` environment variable under your Vercel Project Settings > Environment Variables.*`,
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Safe and clean parser for rendering simple markdown
  const renderTextContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lIdx) => {
      // Bold syntax **text**
      let formatted = line;
      
      // Inline Code `code`
      const codeRegex = /`([^`]+)`/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = codeRegex.exec(formatted)) !== null) {
        if (match.index > lastIndex) {
          parts.push(formatted.substring(lastIndex, match.index));
        }
        parts.push(
          <code key={match.index} className="bg-slate-100 dark:bg-slate-800 text-rose-500 font-mono text-xs px-1.5 py-0.5 rounded">
            {match[1]}
          </code>
        );
        lastIndex = codeRegex.lastIndex;
      }
      
      if (lastIndex < formatted.length) {
        parts.push(formatted.substring(lastIndex));
      }

      const inlineFormatted = parts.length > 0 ? parts : formatted;

      // Handle bullet items
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={lIdx} className="ml-4 list-disc text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-1">
            {inlineFormatted}
          </li>
        );
      }

      // Default paragraph
      return (
        <p key={lIdx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2.5 min-h-[1px]">
          {inlineFormatted}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[650px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg animate-fadeIn" id="chat-view-container">
      {/* Top Header */}
      <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Back to roadmap"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{persona.avatar}</span>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                  Socratic Chat with {persona.name}
                </h3>
                <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium uppercase tracking-wider font-mono">
                  Topic: {topic.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 px-3 py-1.5 rounded-full text-[11px] font-bold text-amber-800 dark:text-amber-300">
          <Sparkles size={12} className="animate-pulse" /> Socratic Active Recalling
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/20" id="chat-messages-area">
        {messages.map((msg) => {
          const isAssistant = msg.sender === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              {/* Avatar Icon */}
              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm shrink-0 ${
                isAssistant 
                  ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950" 
                  : "bg-indigo-600 text-white"
              }`}>
                {isAssistant ? persona.avatar : <User size={16} />}
              </div>

              {/* Message bubble */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 px-1 font-mono">
                  <span>{isAssistant ? persona.name : "You"}</span>
                  <span>•</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`p-4 rounded-2xl text-sm border shadow-sm ${
                  isAssistant
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-100 dark:border-slate-800/80 rounded-tl-none"
                    : "bg-indigo-600 text-white border-transparent rounded-tr-none"
                }`}>
                  {isAssistant ? (
                    <div className="prose dark:prose-invert max-w-none">
                      {renderTextContent(msg.text)}
                    </div>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex gap-3 max-w-md mr-auto">
            <div className="h-9 w-9 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center text-sm shadow-sm shrink-0">
              {persona.avatar}
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 px-1 font-mono">
                {persona.name} is formulating a question...
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs font-medium font-mono">Contemplating...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder={`Discuss ${topic.title} with ${persona.name}...`}
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white dark:text-white disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white p-3.5 rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-md"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
