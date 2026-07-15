import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Loader2, 
  RotateCcw, 
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ThumbsUp,
  Meh,
  Frown,
  Check
} from "lucide-react";
import { Topic, Module, TutorPersona, Flashcard } from "../types";

interface FlashcardsViewProps {
  topic: Topic;
  module: Module;
  persona: TutorPersona;
  onBack: () => void;
  onUpdateStudyTime: (minutes: number) => void;
}

export default function FlashcardsView({
  topic,
  module,
  persona,
  onBack,
  onUpdateStudyTime
}: FlashcardsViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  
  const startTimeRef = useRef<number>(Date.now());

  // Fetch cards on mount
  useEffect(() => {
    fetchCards();
  }, [topic.id]);

  // Track study time when unmounting
  useEffect(() => {
    return () => {
      const minutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));
      onUpdateStudyTime(minutes);
    };
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);
    setCards([]);
    setCurrentIdx(0);
    setIsFlipped(false);
    setReviewedCount(0);

    try {
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.title,
          moduleTitle: module.title
        })
      });

      if (!response.ok) {
        let errMsg = "Unable to contact AI engine to construct flashcards.";
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
      
      const parsedCards = data.cards.map((card: any, idx: number) => ({
        id: `card-${idx}-${Date.now()}`,
        front: card.front,
        back: card.back,
        category: card.category || "General",
        difficulty: "unreviewed"
      }));

      setCards(parsedCards);
    } catch (err: any) {
      setError(err.message || "Failed to generate study flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleRateDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (cards.length === 0) return;

    const oldDifficulty = cards[currentIdx].difficulty;
    const updatedCards = [...cards];
    updatedCards[currentIdx].difficulty = difficulty;
    setCards(updatedCards);

    if (oldDifficulty === "unreviewed") {
      setReviewedCount(prev => prev + 1);
    }

    // Automatically flip back and slide to next card after rating
    setTimeout(() => {
      if (currentIdx + 1 < cards.length) {
        setIsFlipped(false);
        // Delay sliding so flipping can execute smoothly first
        setTimeout(() => {
          setCurrentIdx(prev => prev + 1);
        }, 150);
      } else {
        // Show flip back on the last card
        setIsFlipped(false);
      }
    }, 400);
  };

  const handleNext = () => {
    if (currentIdx + 1 < cards.length) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIdx(prev => prev - 1);
      }, 150);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-lg h-[450px]" id="flash-loading">
        <Loader2 size={40} className="animate-spin text-teal-600 mb-4" />
        <h3 className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight">Structuring Active Recall Flashcards</h3>
        <p className="text-slate-400 text-xs mt-1.5 max-w-sm">
          {persona.name} is condensing key concepts of <strong>{topic.title}</strong> into flippable, memory-retaining flashcards...
        </p>
      </div>
    );
  }

  if (error || cards.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-lg h-[400px]" id="flash-error">
        <span className="text-4xl mb-3">⚠️</span>
        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Failed to Construct Cards</h3>
        <p className="text-slate-400 text-xs mt-1 max-w-sm">
          {error || "An error occurred while compiling study flashcards."}
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={fetchCards}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Re-Generate
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIdx];
  const allReviewed = cards.every(c => c.difficulty !== 'unreviewed');

  return (
    <div className="space-y-6 animate-fadeIn" id="flash-view-root">
      {/* Top Header Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
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
              Active Recall Deck
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium uppercase tracking-wider font-mono">
              Topic: {topic.title}
            </p>
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            Reviewed: <strong className="text-slate-700 dark:text-slate-300">{reviewedCount}/{cards.length}</strong>
          </span>
          <div className="w-24 sm:w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-teal-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(reviewedCount / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Fliping Deck Grid */}
      <div className="flex flex-col items-center max-w-xl mx-auto space-y-6">
        
        {/* Flippable Card Container */}
        <div 
          onClick={handleFlip}
          className="w-full h-80 cursor-pointer group [perspective:1000px]"
          id="flippable-card"
        >
          <div className={`relative w-full h-full duration-500 rounded-3xl border shadow-md transition-all [transform-style:preserve-3d] ${
            isFlipped 
              ? "[transform:rotateY(180deg)] border-teal-500 dark:border-teal-500/50" 
              : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
          }`}>
            
            {/* FRONT SIDE */}
            <div className="absolute inset-0 w-full h-full p-8 flex flex-col justify-between rounded-3xl [backface-visibility:hidden] bg-white dark:bg-slate-900">
              <div className="flex justify-between items-start">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  💡 {currentCard.category}
                </span>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  Card {currentIdx + 1} of {cards.length}
                </span>
              </div>

              <div className="text-center py-4 space-y-3">
                <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest font-mono">
                  ACTIVE RECALL TERM / QUESTION
                </p>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {currentCard.front}
                </h2>
              </div>

              <div className="text-center">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono tracking-wider uppercase animate-pulse">
                  Click card to reveal answer &rarr;
                </span>
              </div>
            </div>

            {/* BACK SIDE */}
            <div className="absolute inset-0 w-full h-full p-8 flex flex-col justify-between rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] bg-teal-50/20 dark:bg-teal-950/10">
              <div className="flex justify-between items-start">
                <span className="bg-teal-100 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  🎓 Explanation / Answer
                </span>
                <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                  {currentCard.difficulty !== "unreviewed" ? `Mastery: ${currentCard.difficulty}` : "Rating Pending"}
                </span>
              </div>

              <div className="text-center py-4 overflow-y-auto max-h-36 pr-1">
                <p className="text-slate-800 dark:text-slate-200 text-base md:text-lg font-medium leading-relaxed">
                  {currentCard.back}
                </p>
              </div>

              <div className="text-center">
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 font-mono tracking-wider uppercase">
                  Click card to view front &larr;
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Flipping Control Buttons */}
        <div className="flex items-center gap-6" id="deck-nav-controls">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
            title="Previous card"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={handleFlip}
            className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            Flip Card
          </button>

          <button
            onClick={handleNext}
            disabled={currentIdx === cards.length - 1}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
            title="Next card"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Self-Rating Difficulty Options (Active after revealing answer) */}
        <div className={`w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4 transition-all duration-300 ${
          isFlipped ? "opacity-100 translate-y-0" : "opacity-60 pointer-events-none"
        }`} id="difficulty-rating-panel">
          <div className="text-center">
            <h4 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              How well did you recall this answer?
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleRateDifficulty('hard')}
              className="p-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 rounded-2xl border border-red-100/50 dark:border-red-950/50 flex flex-col items-center gap-1 text-xs font-bold transition-all cursor-pointer"
            >
              <Frown size={20} />
              <span>Forgot (Hard)</span>
            </button>

            <button
              onClick={() => handleRateDifficulty('medium')}
              className="p-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-2xl border border-amber-100/50 dark:border-amber-950/50 flex flex-col items-center gap-1 text-xs font-bold transition-all cursor-pointer"
            >
              <Meh size={20} />
              <span>Struggled (Medium)</span>
            </button>

            <button
              onClick={() => handleRateDifficulty('easy')}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-100/50 dark:border-emerald-950/50 flex flex-col items-center gap-1 text-xs font-bold transition-all cursor-pointer"
            >
              <ThumbsUp size={20} />
              <span>Got It! (Easy)</span>
            </button>
          </div>
        </div>

        {/* Completion feedback */}
        {allReviewed && (
          <div className="w-full bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-950/30 p-5 rounded-2xl flex items-center justify-between text-emerald-900 dark:text-emerald-300 animate-slideUp">
            <div className="flex items-center gap-3">
              <Check size={20} className="bg-emerald-100 dark:bg-emerald-900 p-0.5 rounded-full" />
              <div className="text-left">
                <p className="font-bold text-sm">Study Round Complete!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">You graded every active recall flashcard in this topic deck.</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold rounded-xl shadow-md cursor-pointer hover:opacity-90 transition-opacity"
            >
              Mastered &larr;
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
