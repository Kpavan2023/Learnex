export interface User {
  id: string;
  name: string;
  email: string;
  currentEmotion: 'happy' | 'sad' | 'neutral' | 'excited' | 'frustrated';
  skills: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface AssessmentResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  categoryScores: { [key: string]: number };
  levelResults?: { level: number; score: number; passed: boolean }[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
}

export interface InterviewResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  passed: boolean;
  feedback: string[];
  answers: { question: string; answer: string; score: number }[];
}