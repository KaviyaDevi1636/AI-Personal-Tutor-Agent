import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Award, 
  RotateCcw, 
  HelpCircle,
  Sparkles
} from "lucide-react";
import { Topic, Module, TutorPersona, Quiz, QuizQuestion } from "../types";

interface QuizViewProps {
  topic: Topic;
  module: Module;
  persona: TutorPersona;
  onBack: () => void;
  onRecordQuizScore: (scorePercent: number) => void;
}

export default function QuizView({
  topic,
  module,
  persona,
  onBack,
  onRecordQuizScore
}: QuizViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const startTimeRef = useRef<number>(Date.now());

  // Fetch Quiz on load
  useEffect(() => {
    fetchQuiz();
  }, [topic.id]);

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.title,
          moduleTitle: module.title,
          difficulty: "intermediate"
        })
      });

      if (!response.ok) {
        let errMsg = "Unable to contact AI engine to generate quiz questions.";
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
      setQuiz({
        id: `quiz-${Date.now()}`,
        title: data.title || `${topic.title} Assessment`,
        topic: topic.title,
        questions: data.questions
      });
    } catch (err: any) {
      setError(err.message || "Failed to generate dynamic assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isAnswered || !quiz) return;
    
    const currentQuestion = quiz.questions[currentIdx];
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setIsAnswered(true);
  };

  const handleNext = () => {
    if (!quiz) return;
    
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz finished
      setQuizCompleted(true);
      const scorePercent = Math.round((score / quiz.questions.length) * 100);
      onRecordQuizScore(scorePercent);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-lg h-[450px]" id="quiz-loading">
        <Loader2 size={40} className="animate-spin text-indigo-600 mb-4" />
        <h3 className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight">Drafting Custom Exam Questions</h3>
        <p className="text-slate-400 text-xs mt-1.5 max-w-sm">
          {persona.name} is evaluating the material for <strong>{topic.title}</strong> to construct a tailored multiple-choice test...
        </p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-lg h-[400px]" id="quiz-error">
        <span className="text-4xl mb-3">⚠️</span>
        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Failed to Construct Exam</h3>
        <p className="text-slate-400 text-xs mt-1 max-w-sm">
          {error || "An error occurred while communicating with the personal tutor API."}
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={fetchQuiz}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Retry Build
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg animate-fadeIn" id="quiz-view-root">
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
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
              {quiz.title}
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium uppercase tracking-wider font-mono">
              Topic Assessment: {topic.title}
            </p>
          </div>
        </div>

        <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-100/50 dark:border-teal-900/30 px-3 py-1.5 rounded-full text-[11px] font-bold text-teal-800 dark:text-teal-300 font-mono">
          Question {quizCompleted ? currentIdx + 1 : currentIdx + 1} of {quiz.questions.length}
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 md:p-8 space-y-6">
        {quizCompleted ? (
          /* Quiz Results screen */
          <div className="text-center py-10 space-y-6 max-w-md mx-auto" id="quiz-results">
            <div className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-inner">
              <Award size={48} className="animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold dark:text-white tracking-tight">Assessment Finished!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                You scored <strong className="text-slate-800 dark:text-slate-200">{score} out of {quiz.questions.length}</strong> correct on this topic.
              </p>
            </div>

            {/* Score Bar */}
            <div className="bg-slate-100 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 dark:text-slate-500 uppercase font-semibold mb-1">
                <span>Score Performance</span>
                <span>{Math.round((score / quiz.questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    score >= 4 ? "bg-emerald-500" : score >= 3 ? "bg-orange-400" : "bg-red-500"
                  }`}
                  style={{ width: `${(score / quiz.questions.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic leading-normal">
                {score === 5 
                  ? "Perfect Masterclass! You fully conceptualized every single sub-topic here."
                  : score >= 3 
                  ? "Good grasp! Use Socrates Chat or Concept Explanation to solidify the remaining gaps."
                  : "Needs practice. Let's study again together!"}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Return to Roadmap
              </button>
              <button
                onClick={fetchQuiz}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={16} /> Re-Take Exam
              </button>
            </div>
          </div>
        ) : (
          /* Active Question */
          <div className="space-y-6" id="active-question">
            {/* Progress Bar inside quiz */}
            <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx) / quiz.questions.length) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Question {currentIdx + 1}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const showCorrect = isAnswered && index === currentQuestion.correctIndex;
                const showIncorrect = isAnswered && isSelected && index !== currentQuestion.correctIndex;

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between text-sm transition-all font-medium ${
                      showCorrect
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300"
                        : showIncorrect
                        ? "bg-rose-50 dark:bg-rose-950/20 border-rose-500 dark:border-rose-500/50 text-rose-900 dark:text-rose-300"
                        : isSelected
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md"
                        : "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <span className="flex-1 pr-4">{option}</span>
                    <span className="shrink-0 flex items-center justify-center font-mono text-xs font-bold">
                      {showCorrect && (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      )}
                      {showIncorrect && (
                        <XCircle size={18} className="text-rose-500" />
                      )}
                      {!isAnswered && (
                        <span className="h-6 w-6 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500">
                          {["A", "B", "C", "D"][index]}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Answer feedback & Explanation */}
            {isAnswered && (
              <div className={`p-5 rounded-2xl border ${
                selectedOption === currentQuestion.correctIndex
                  ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-950/20 text-emerald-900 dark:text-emerald-300"
                  : "bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-950/20 text-rose-900 dark:text-rose-300"
              } animate-slideUp`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  {selectedOption === currentQuestion.correctIndex ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-500" /> Correct Analysis!
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-rose-500" /> Incorrect Choice
                    </>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mt-1">
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Action buttons footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              {!isAnswered ? (
                <button
                  onClick={handleConfirmAnswer}
                  disabled={selectedOption === null}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md flex items-center gap-1 cursor-pointer"
                >
                  {currentIdx + 1 < quiz.questions.length ? "Next Question" : "View Results"} <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
