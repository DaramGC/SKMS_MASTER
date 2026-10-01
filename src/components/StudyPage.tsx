import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  Shuffle, 
  Filter, 
  BookMarked,
  Info,
  ChevronRight
} from 'lucide-react';
import { Question, Category, Difficulty } from '../types/question';
import { ProgressStoreService } from '../services/progressStore';
import { QuestionAccuracyStat } from '../services/googleSheetsDb';

interface StudyPageProps {
  questions: Question[];
  onOpenWrongNote: () => void;
  collectiveStats?: Record<string, QuestionAccuracyStat>;
  onAnswerLogged?: (question: Question, selectedOption: 1 | 2 | 3 | 4, isCorrect: boolean) => void;
}

export const StudyPage: React.FC<StudyPageProps> = ({ 
  questions, 
  onOpenWrongNote,
  collectiveStats = {},
  onAnswerLogged
}) => {
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [filterMode, setFilterMode] = useState<'all' | 'unsolved' | 'wrong' | 'bookmarked'>('all');
  const [isRandomMode, setIsRandomMode] = useState<boolean>(false);

  // User state
  const [userAnswers, setUserAnswers] = useState(ProgressStoreService.getUserAnswers());
  const [wrongAnswers, setWrongAnswers] = useState(ProgressStoreService.getWrongAnswers());
  const [bookmarks, setBookmarks] = useState<string[]>(ProgressStoreService.getBookmarks());

  // Filtered Questions List
  const filteredQuestions = useMemo(() => {
    let list = [...questions];

    if (selectedCategory !== 'ALL') {
      list = list.filter((q) => q.category === selectedCategory);
    }

    if (selectedDifficulty !== 'ALL') {
      list = list.filter((q) => q.difficulty === selectedDifficulty);
    }

    if (filterMode === 'unsolved') {
      list = list.filter((q) => !userAnswers[q.id]);
    } else if (filterMode === 'wrong') {
      list = list.filter((q) => !!wrongAnswers[q.id]);
    } else if (filterMode === 'bookmarked') {
      list = list.filter((q) => bookmarks.includes(q.id));
    }

    if (isRandomMode) {
      // Deterministic shuffle
      return [...list].sort(() => Math.sin(list.length) - 0.5);
    }

    return list;
  }, [questions, selectedCategory, selectedDifficulty, filterMode, isRandomMode, userAnswers, wrongAnswers, bookmarks]);

  // Current Question Index
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Selected Option for the current question
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Sync state if question was already answered previously
  const currentQuestion = filteredQuestions[currentIndex];

  useEffect(() => {
    if (currentQuestion && userAnswers[currentQuestion.id]) {
      setSelectedOption(userAnswers[currentQuestion.id].selectedAnswer);
    } else {
      setSelectedOption(null);
    }
  }, [currentIndex, currentQuestion, userAnswers]);

  // Keep index within bounds if filtered list changes
  useEffect(() => {
    if (currentIndex >= filteredQuestions.length && filteredQuestions.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredQuestions.length, currentIndex]);

  const handleSelectOption = (optionNumber: 1 | 2 | 3 | 4) => {
    if (!currentQuestion) return;
    if (selectedOption !== null) return; // Prevent changing after immediate grading

    setSelectedOption(optionNumber);
    const isCorrect = optionNumber === currentQuestion.answer;

    // Record progress
    ProgressStoreService.recordAnswer(currentQuestion.id, optionNumber, isCorrect);
    setUserAnswers(ProgressStoreService.getUserAnswers());
    setWrongAnswers(ProgressStoreService.getWrongAnswers());

    if (onAnswerLogged) {
      onAnswerLogged(currentQuestion, optionNumber, isCorrect);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleToggleBookmark = () => {
    if (!currentQuestion) return;
    ProgressStoreService.toggleBookmark(currentQuestion.id);
    setBookmarks(ProgressStoreService.getBookmarks());
  };

  if (!currentQuestion || filteredQuestions.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-800 bg-[#0C1222] p-10">
          <Info className="mx-auto h-12 w-12 text-cyan-400 mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            조건에 맞는 문제가 없습니다
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            선택하신 필터 조건(카테고리/미풀이/오답)에 해당하는 문항이 모두 완료되었거나 없습니다.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedDifficulty('ALL');
              setFilterMode('all');
            }}
            className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition-colors"
          >
            모든 필터 초기화
          </button>
        </div>
      </div>
    );
  }

  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === currentQuestion.answer;
  const isBookmarked = bookmarks.includes(currentQuestion.id);

  // Progress metrics
  const solvedCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / filteredQuestions.length) * 100);

  const categories: Category[] = [
    'SK와 SKMS',
    '경영철학',
    '실행원리',
    'VWBE 문화',
    'SUPEX Company',
    'SKMS 정립의 의의',
    'SKMS 보완 내력'
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Filter and Controls Deck */}
      <div className="mb-6 rounded-xl border border-slate-800/80 bg-[#0C1222]/90 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Segmented Filter Mode Buttons */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-900/90 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterMode === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              전체 문항
            </button>
            <button
              onClick={() => { setFilterMode('unsolved'); setCurrentIndex(0); }}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterMode === 'unsolved' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              미풀이 우선
            </button>
            <button
              onClick={() => { setFilterMode('wrong'); setCurrentIndex(0); }}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterMode === 'wrong' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              오답 복습 ({Object.keys(wrongAnswers).length})
            </button>
            <button
              onClick={() => { setFilterMode('bookmarked'); setCurrentIndex(0); }}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterMode === 'bookmarked' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              북마크 ({bookmarks.length})
            </button>
          </div>

          {/* Category Dropdown & Shuffle */}
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentIndex(0); }}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              <option value="ALL">전체 카테고리</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentIndex(0); }}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              <option value="ALL">전체 난이도</option>
              <option value="EASY">쉬움 (EASY)</option>
              <option value="NORMAL">보통 (NORMAL)</option>
              <option value="HARD">어려움 (HARD)</option>
            </select>

            <button
              onClick={() => setIsRandomMode(!isRandomMode)}
              title="랜덤 순서 출제 토글"
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                isRandomMode
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>랜덤</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Header Info */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
            예상문제 학습
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            문제 {currentIndex + 1} <span className="text-slate-500 text-base font-normal">/ {filteredQuestions.length}</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleBookmark}
            title={isBookmarked ? '북마크 해제' : '문제 북마크 저장'}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              isBookmarked
                ? 'border-amber-500/50 bg-amber-950/30 text-amber-300'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-amber-400" /> : <Bookmark className="h-4 w-4" />}
            <span className="hidden sm:inline">북마크</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#0C1222]/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
        {/* Unboxed Metadata (Zero-pill discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-4 font-mono">
          <span className="text-cyan-400 font-semibold">{currentQuestion.category}</span>
          <span aria-hidden="true">·</span>
          <span>{currentQuestion.topic}</span>
          <span aria-hidden="true">·</span>
          <span>난이도: {currentQuestion.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span className="text-cyan-300 font-medium">
            전체 정답률 {collectiveStats[currentQuestion.id]?.accuracyRate ?? (currentQuestion.difficulty === 'EASY' ? 88 : currentQuestion.difficulty === 'NORMAL' ? 72 : 55)}%
          </span>
          {wrongAnswers[currentQuestion.id] && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-rose-400 font-medium">오답 {wrongAnswers[currentQuestion.id].wrongCount}회</span>
            </>
          )}
        </div>

        {/* Question Statement */}
        <div className="font-display text-lg sm:text-xl font-bold text-white leading-relaxed mb-8">
          {currentQuestion.question}
        </div>

        {/* 4 Options Grid */}
        <div className="space-y-3">
          {[
            { num: 1, text: currentQuestion.option_1 },
            { num: 2, text: currentQuestion.option_2 },
            { num: 3, text: currentQuestion.option_3 },
            { num: 4, text: currentQuestion.option_4 },
          ].map((opt) => {
            const isUserPick = selectedOption === opt.num;
            const isAnswerKey = currentQuestion.answer === opt.num;

            let cardStyles = 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-700 text-slate-200';
            let circleStyles = 'border-slate-700 bg-slate-800 text-slate-400';

            if (isAnswered) {
              if (isAnswerKey) {
                // Correct answer always highlighted in green
                cardStyles = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-100 ring-1 ring-emerald-500';
                circleStyles = 'border-emerald-500 bg-emerald-500 text-slate-950 font-bold';
              } else if (isUserPick) {
                // Wrong pick highlighted in red
                cardStyles = 'border-rose-500/80 bg-rose-950/40 text-rose-100 ring-1 ring-rose-500';
                circleStyles = 'border-rose-500 bg-rose-500 text-white font-bold';
              } else {
                cardStyles = 'border-slate-900 bg-slate-950/40 text-slate-500 opacity-60';
                circleStyles = 'border-slate-800 text-slate-600';
              }
            }

            return (
              <button
                key={opt.num}
                onClick={() => handleSelectOption(opt.num as 1 | 2 | 3 | 4)}
                disabled={isAnswered}
                className={`w-full text-left rounded-xl border p-4 sm:p-4.5 transition-all duration-200 flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${cardStyles}`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${circleStyles}`}>
                  {opt.num}
                </div>
                <div className="flex-1 text-sm sm:text-base font-normal leading-relaxed pt-0.5">
                  {opt.text}
                </div>
              </button>
            );
          })}
        </div>

        {/* Immediate Grading Feedback & Explanation Card */}
        {isAnswered && (
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className={`rounded-xl p-5 mb-4 border ${
              isCorrect 
                ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300' 
                : 'border-rose-500/30 bg-rose-950/30 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-display text-base font-bold mb-1">
                {isCorrect ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span>정답입니다!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-rose-400" />
                    <span>오답입니다</span>
                  </>
                )}
              </div>

              {!isCorrect && (
                <div className="mt-2 text-xs font-mono text-slate-300 flex items-center gap-4">
                  <span>선택한 답: <strong className="text-rose-400">{selectedOption}번</strong></span>
                  <span>·</span>
                  <span>정답: <strong className="text-emerald-400">{currentQuestion.answer}번</strong></span>
                </div>
              )}
            </div>

            {/* Explanation with Source of Truth */}
            <div className="rounded-xl border border-slate-800 bg-[#070B14] p-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">
                정답 해설 및 SKMS 원문
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {currentQuestion.explanation}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono">
                <div>
                  <span className="text-slate-500">SOURCE: </span>
                  <span className="text-cyan-300 font-semibold">{currentQuestion.source}</span>
                </div>
                <div>
                  <span className="text-slate-500">관련 개념: </span>
                  <span className="text-slate-300">{currentQuestion.topic}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Deck */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-800/60">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>이전 문제</span>
          </button>

          <div className="font-mono text-xs text-slate-400">
            {currentIndex + 1} / {filteredQuestions.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === filteredQuestions.length - 1}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-cyan-600/20"
          >
            <span>다음 문제</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
