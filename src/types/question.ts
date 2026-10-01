export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export type QuestionType =
  | 'CONCEPT'
  | 'DEFINITION'
  | 'COMPARISON'
  | 'APPLICATION'
  | 'TRUE_STATEMENT'
  | 'FALSE_STATEMENT'
  | 'DETAILS'
  | 'COMPREHENSIVE';

export type Category =
  | 'SK와 SKMS'
  | '경영철학'
  | '실행원리'
  | 'VWBE 문화'
  | 'SUPEX Company'
  | 'SKMS 정립의 의의'
  | 'SKMS 보완 내력';

export interface Question {
  id: string;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  answer: 1 | 2 | 3 | 4;
  explanation: string;
  category: Category;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  source: string;
  source_page: number;
  tags: string[];
  created_at?: string;
  isCustom?: boolean;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedAnswer: 1 | 2 | 3 | 4;
  isCorrect: boolean;
  answeredAt: number;
}

export interface WrongAnswerRecord {
  questionId: string;
  wrongCount: number;
  lastWrongAt: number;
}

export interface TestSession {
  id: string;
  startedAt: number;
  completedAt: number;
  durationSeconds: number;
  totalQuestions: number;
  score: number;
  accuracy: number;
  questions: Question[];
  userAnswers: Record<string, 1 | 2 | 3 | 4>;
}

export interface UserStats {
  totalSolved: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  streakDays: number;
  lastStudiedDate: string;
  bookmarkedQuestionIds: string[];
}
