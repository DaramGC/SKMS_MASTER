import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Flag, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  Send,
  HelpCircle
} from 'lucide-react';
import { Question, TestSession } from '../types/question';
import { QuestionDatabaseService } from '../services/questionDb';
import { ProgressStoreService } from '../services/progressStore';

interface TestPageProps {
  onCompleteTest: (session: TestSession) => void;
  onCancelTest: () => void;
}

export const TestPage: React.FC<TestPageProps> = ({ onCompleteTest, onCancelTest }) => {
  // 20 Mock Test Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // User answers map: questionId -> answer (1-4)
  const [answers, setAnswers] = useState<Record<string, 1 | 2 | 3 | 4>>({});
  
  // Flagged for review
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);

  // Timer (25 minutes = 1500 seconds)
  const TOTAL_TEST_TIME = 1500;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TEST_TIME);
  const [startTime] = useState<number>(Date.now());

  // Submit confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Initialize test questions on mount
  useEffect(() => {
    const mockSet = QuestionDatabaseService.generateMockExamQuestions(20);
    setQuestions(mockSet);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (questions.length === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [questions, answers]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optionNum: 1 | 2 | 3 | 4) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionNum
    }));
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedIds((prev) => 
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  };

  const handleSubmitTest = () => {
    const completedAt = Date.now();
    const durationSeconds = Math.round((completedAt - startTime) / 1000);

    // Compute score
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        score += 1;
      }
    });

    const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 1000) / 10 : 0;

    const session: TestSession = {
      id: `test-${Date.now()}`,
      startedAt: startTime,
      completedAt,
      durationSeconds,
      totalQuestions: questions.length,
      score,
      accuracy,
      questions,
      userAnswers: answers
    };

    // Save session in local storage
    ProgressStoreService.saveTestSession(session);

    // Trigger parent callback
    onCompleteTest(session);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center font-mono text-cyan-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mx-auto mb-3" />
          실전 모의 테스트 20문항을 준비하는 중입니다...
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const isFlagged = flaggedIds.includes(currentQuestion.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Test Status Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cyan-900/40 bg-[#0C1222]/90 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-white">
              SKMS 실전 모의 테스트
            </h2>
            <div className="text-xs text-slate-400 font-mono">
              20문항 실전 평가 모드 · 정답은 제출 후 공개
            </div>
          </div>
        </div>

        {/* Timer & Submit CTA */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm font-bold tabular-nums ${
            timeLeft < 300 
              ? 'border-rose-500 bg-rose-950/40 text-rose-300 animate-pulse'
              : 'border-slate-800 bg-slate-900 text-cyan-300'
          }`}>
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            <Send className="h-3.5 w-3.5" />
            <span>최종 답안 제출</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Main Question Sheet (3 columns) */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-800 bg-[#0C1222]/90 backdrop-blur-md p-6 sm:p-8 shadow-xl">
            {/* Header info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="text-cyan-400 font-semibold">{currentQuestion.category}</span>
                <span aria-hidden="true">·</span>
                <span>{currentQuestion.topic}</span>
                <span aria-hidden="true">·</span>
                <span>난이도: {currentQuestion.difficulty}</span>
              </div>

              <button
                onClick={handleToggleFlag}
                title="검토할 문제로 표시"
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  isFlagged
                    ? 'border-amber-500/60 bg-amber-950/40 text-amber-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <Flag className={`h-3.5 w-3.5 ${isFlagged ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>검토 체크</span>
              </button>
            </div>

            {/* Question title */}
            <div className="font-display text-lg sm:text-xl font-bold text-white leading-relaxed mb-6">
              <span className="text-cyan-400 font-mono mr-2">Q{currentIndex + 1}.</span>
              {currentQuestion.question}
            </div>

            {/* 4 Choices */}
            <div className="space-y-3">
              {[
                { num: 1, text: currentQuestion.option_1 },
                { num: 2, text: currentQuestion.option_2 },
                { num: 3, text: currentQuestion.option_3 },
                { num: 4, text: currentQuestion.option_4 },
              ].map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.num;
                return (
                  <button
                    key={opt.num}
                    onClick={() => handleSelectOption(opt.num as 1 | 2 | 3 | 4)}
                    className={`w-full text-left rounded-xl border p-4 transition-all flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/50 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500'
                        : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500 text-slate-950 font-bold'
                        : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}>
                      {opt.num}
                    </div>
                    <div className="flex-1 text-sm sm:text-base font-normal leading-relaxed pt-0.5">
                      {opt.text}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav */}
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-800/60">
              <button
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>이전</span>
              </button>

              <div className="text-xs text-slate-400 font-mono">
                {currentIndex + 1} / {questions.length}
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((p) => p + 1)}
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
                >
                  <span>다음</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  <Send className="h-4 w-4" />
                  <span>제출하기</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Question Navigation Matrix (OMR sheet) */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-800 bg-[#0C1222]/90 backdrop-blur-md p-5 sticky top-24 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                문항 답안 현황
              </span>
              <span className="font-mono text-xs text-cyan-400 tabular-nums">
                {answeredCount} / {questions.length}
              </span>
            </div>

            {/* 1-20 Question Grid */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((q, idx) => {
                const isCurrent = currentIndex === idx;
                const isAnswered = answers[q.id] !== undefined;
                const isQuestionFlagged = flaggedIds.includes(q.id);

                let btnStyles = 'border-slate-800 bg-slate-900/60 text-slate-400';

                if (isCurrent) {
                  btnStyles = 'border-cyan-400 bg-cyan-500/30 text-cyan-200 font-bold ring-2 ring-cyan-400';
                } else if (isAnswered) {
                  btnStyles = 'border-blue-500/40 bg-blue-950/50 text-blue-300 font-medium';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative flex h-10 w-full items-center justify-center rounded-lg border text-xs font-mono transition-all hover:border-slate-600 ${btnStyles}`}
                  >
                    <span>{idx + 1}</span>
                    {isQuestionFlagged && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded border border-blue-500/40 bg-blue-950/50" />
                <span>답안 선택 완료</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded border border-slate-800 bg-slate-900" />
                <span>미답변 문항 ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>검토 체크 문항 ({flaggedIds.length})</span>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={onCancelTest}
              className="mt-6 w-full text-center text-xs text-slate-500 hover:text-slate-300 py-2 transition-colors"
            >
              테스트 중단하고 나가기
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0C1222] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-cyan-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-display text-lg font-bold text-white">
                답안을 최종 제출하시겠습니까?
              </h3>
            </div>

            <div className="space-y-2 text-sm text-slate-300 mb-6">
              <p>총 20문제 중 <strong className="text-cyan-400">{answeredCount}문제</strong>에 답안을 작성하셨습니다.</p>
              {unansweredCount > 0 && (
                <p className="text-rose-400 font-medium">
                  주의: 아직 답안을 선택하지 않은 문제가 {unansweredCount}건 있습니다.
                </p>
              )}
              {flaggedIds.length > 0 && (
                <p className="text-amber-400">
                  검토 체크로 표시된 문제가 {flaggedIds.length}건 있습니다.
                </p>
              )}
              <p className="text-xs text-slate-400 pt-2">
                제출 후에는 즉시 채점 결과와 문항별 정답 및 상세 해설을 확인하실 수 있습니다.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                계속 풀기
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmitTest();
                }}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white hover:from-cyan-400 hover:to-blue-500 transition-colors"
              >
                제출 및 채점하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
