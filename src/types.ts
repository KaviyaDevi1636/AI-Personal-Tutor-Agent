export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface TutorPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  style: string;
  color: string;
  bgGradient: string;
  systemInstruction: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'completed';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: Topic[];
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedTime: string;
  targetAudience: string;
  modules: Module[];
  createdAt: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  questions: QuizQuestion[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'unreviewed';
}

export interface UserStats {
  streak: number;
  lastStudyDate: string | null;
  totalTimeMinutes: number;
  completedTopicsCount: number;
  totalQuizzesTaken: number;
  quizAverageScore: number;
}
