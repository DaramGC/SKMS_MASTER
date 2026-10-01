import React, { useState } from 'react';
import { 
  RotateCcw, 
  Trash2, 
  AlertCircle, 
  BookOpen, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Question, WrongAnswerRecord } from '../types/question';
import { ProgressStoreService } from '../services/progressStore';

interface WrongAnswerPageProps {
  allQuestions: Question[];
  onStartRetest: (questions: Question[]) => void;
  onGoToStudy: () => void;
}

export const WrongAnswerPage: React.FC<WrongAnswerPageProps> = ({
  allQuestions,
  onStartRetest,
  onGoToStudy
}) => {
  const [wrongRecords, setWrongRecords] = useState<Record<string, WrongAnswerRecord>>(
    ProgressStoreService.getWrongAnswers()
  );
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high_freq'>('all');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Match wrong records to Question objects
  const wrongQuestionsWithCount = Object.values(wrongRecords)
    .map((record) => {
      const q = allQuestions.find((item) => item.id === record.questionId);
      return q ? { ...q, wrongCount: record.wrongCount } : null;
    })
    .filter((q): q is Question & { wrongCount: number } => q !== null)
    .sort((a, b) => b.wrongCount - a.wrongCount); // highest error count first

  const displayedList = selectedFilter === 'high_freq'
    ? wrongQuestionsWithCount.filter((q) => q.wrongCount >= 2)
    : wrongQuestionsWithCount;

  const handleRemove = (questionId: string) => {
    ProgressStoreService.removeWrongAnswer(questionId);
    setWrongRecords(ProgressStoreService.getWrongAnswers());
  };

  const handleStartAll = () => {
    if (displayedList.length > 0) {
      onStartRetest(displayedList);
    }
  };

  if (wrongQuestionsWithCount.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-800 bg-[#0C1222] p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 mx-auto mb-4">
            <CheckCircle className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            오답 노트가 비어 있습니다!
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            현재 틀린 문제가 없거나 모든 오답을 성공적으로 복습 완료하셨습니다.
            예상문제나 실전 테스트를 풀면 틀린 문제가 이곳에 자동으로 기록됩니다.
          </p>
          <button
            onClick={onGoToStudy}
            className="rounded-xl bg-cyan-600 px-6 py-3 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-600/20"
          >
            예상문제 풀러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Header Card */}
      <div className="mb-6 rounded-2xl border border-rose-950/50 bg-[#0C1222]/90 p-6 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono tracking-wider text-rose-400 uppercase mb-1">
              오답 취약점 집중 클리닉
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              오답노트 <span className="font-mono text-rose-400 text-lg font-normal">({displayedList.length}문항)</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                  selectedFilter === 'all' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                전체 오답 ({wrongQuestionsWithCount.length})
              </button>
              <button
                onClick={() => setSelectedFilter('high_freq')}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                  selectedFilter === 'high_freq' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                2회 이상 반복 오답
              </button>
            </div>

            <button
              onClick={handleStartAll}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20"
            >
              <RotateCcw className="h-4 w-4" />
              <span>오답 전체 다시 풀기</span>
            </button>
          </div>
        </div>
      </div>

      {/* List of Wrong Questions */}
      <div className="space-y-4">
        {displayedList.map((q) => {
          const isOpen = activeQuestionId === q.id;

          return (
            <div
              key={q.id}
              className="rounded-xl border border-slate-800 bg-[#0C1222]/90 backdrop-blur-md p-5 transition-all hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Unboxed Metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                    <span className="text-cyan-400 font-semibold">{q.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{q.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-rose-400 font-bold">오답 {q.wrongCount}회</span>
                    <span aria-hidden="true">·</span>
                    <span>출처: {q.source}</span>
                  </div>

                  <div className="text-base font-semibold text-white leading-relaxed">
                    {q.question}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveQuestionId(isOpen ? null : q.id)}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    {isOpen ? '해설 닫기' : '정답 및 해설'}
                  </button>

                  <button
                    onClick={() => handleRemove(q.id)}
                    title="오답노트에서 삭제 (마스터 완료)"
                    className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {[
                      { num: 1, text: q.option_1 },
                      { num: 2, text: q.option_2 },
                      { num: 3, text: q.option_3 },
                      { num: 4, text: q.option_4 },
                    ].map((opt) => (
                      <div
                        key={opt.num}
                        className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                          opt.num === q.answer
                            ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200 font-semibold'
                            : 'border-slate-800 bg-slate-900/40 text-slate-400'
                        }`}
                      >
                        <span className="font-mono font-bold">{opt.num}.</span>
                        <span className="flex-1">{opt.text}</span>
                        {opt.num === q.answer && (
                          <span className="text-[10px] text-emerald-400 font-bold shrink-0">정답</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-[#070B14] p-4 text-xs text-slate-300 leading-relaxed">
                    <div className="font-mono text-cyan-400 mb-1 font-semibold uppercase">
                      SKMS 원문 해설
                    </div>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
