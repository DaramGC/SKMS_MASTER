import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { TestSession, Question } from '../types/question';

interface ResultPageProps {
  session: TestSession;
  onRetestMistakes: (wrongQuestions: Question[]) => void;
  onStartNewTest: () => void;
  onGoToStudy: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  session,
  onRetestMistakes,
  onStartNewTest,
  onGoToStudy
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'wrong'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const { score, totalQuestions, accuracy, durationSeconds, questions, userAnswers } = session;
  const wrongQuestions = questions.filter((q) => userAnswers[q.id] !== q.answer);
  const correctCount = score;
  const wrongCount = totalQuestions - score;

  const filteredQuestions = filterMode === 'wrong' ? wrongQuestions : questions;

  const isPassed = accuracy >= 70; // 70% passing threshold for SKMS assessments

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Score Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-900/40 bg-gradient-to-b from-[#0C1222] to-[#080B14] p-8 text-center shadow-2xl backdrop-blur-md">
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase mb-2">
          SKMS TEST RESULT
        </div>

        <div className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight my-2">
          <span className="font-mono text-cyan-300 tabular-nums">{score}</span>
          <span className="text-2xl text-slate-500 font-normal"> / {totalQuestions}</span>
        </div>

        <div className="inline-flex items-center gap-2 text-xl font-bold font-mono text-emerald-400 mb-6">
          <span>정답률 {accuracy}%</span>
          <span>·</span>
          <span className={isPassed ? 'text-cyan-400' : 'text-amber-400'}>
            {isPassed ? '합격 권역 도달' : '추가 보완 학습 권장'}
          </span>
        </div>

        {/* Sub-Metrics Row */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-6 border-t border-slate-800/80 text-center font-mono">
          <div>
            <div className="text-xs text-slate-400 mb-1">정답 문항</div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums">{correctCount}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">오답 문항</div>
            <div className="text-xl font-bold text-rose-400 tabular-nums">{wrongCount}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">소요 시간</div>
            <div className="text-xl font-bold text-slate-200 tabular-nums">
              {Math.floor(durationSeconds / 60)}분 {durationSeconds % 60}초
            </div>
          </div>
        </div>

        {/* Next Step Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {wrongCount > 0 && (
            <button
              onClick={() => onRetestMistakes(wrongQuestions)}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>오답 {wrongCount}문제 바로 다시 풀기</span>
            </button>
          )}

          <button
            onClick={onStartNewTest}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-6 py-3 text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition-all"
          >
            <Award className="h-4 w-4" />
            <span>새로운 테스트 시작</span>
          </button>

          <button
            onClick={onGoToStudy}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-6 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <BookOpen className="h-4 w-4" />
            <span>예상문제 계속 풀기</span>
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="font-display text-xl font-bold text-white">
            문항별 상세 채점 결과
          </h3>

          <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterMode === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              전체 문항 (20)
            </button>
            <button
              onClick={() => setFilterMode('wrong')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterMode === 'wrong' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              오답만 확인 ({wrongCount})
            </button>
          </div>
        </div>

        {/* Question Review Cards */}
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const userPick = userAnswers[q.id];
            const isCorrect = userPick === q.answer;
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className={`rounded-xl border transition-all duration-200 ${
                  isCorrect
                    ? 'border-slate-800 bg-[#0C1222]/80 hover:border-slate-700'
                    : 'border-rose-950/60 bg-rose-950/10 hover:border-rose-900/80'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                  className="flex items-center justify-between p-4 cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300">
                      {questions.indexOf(q) + 1}
                    </div>

                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                      )}
                      <span className="text-sm font-medium text-slate-200 line-clamp-1">
                        {q.question}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs font-mono">
                    <span className="text-slate-400 hidden sm:inline">{q.topic}</span>
                    <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {isCorrect ? '정답' : `오답 (선택 ${userPick || '미선택'}번 / 정답 ${q.answer}번)`}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 p-5 bg-[#070B14]">
                    <div className="font-semibold text-slate-100 text-sm mb-4 leading-relaxed">
                      {q.question}
                    </div>

                    {/* 4 Choices */}
                    <div className="space-y-2 mb-4">
                      {[
                        { num: 1, text: q.option_1 },
                        { num: 2, text: q.option_2 },
                        { num: 3, text: q.option_3 },
                        { num: 4, text: q.option_4 },
                      ].map((opt) => {
                        const isAns = opt.num === q.answer;
                        const isPick = opt.num === userPick;

                        let style = 'bg-slate-900/60 border-slate-800/60 text-slate-400';
                        if (isAns) {
                          style = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-medium';
                        } else if (isPick) {
                          style = 'bg-rose-950/40 border-rose-500/50 text-rose-200';
                        }

                        return (
                          <div
                            key={opt.num}
                            className={`flex items-start gap-3 rounded-lg border p-2.5 text-xs ${style}`}
                          >
                            <span className="font-mono font-bold w-4">{opt.num}.</span>
                            <span className="flex-1">{opt.text}</span>
                            {isAns && <span className="text-[10px] text-emerald-400 font-bold">정답</span>}
                            {isPick && !isAns && <span className="text-[10px] text-rose-400 font-bold">내 선택</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4">
                      <div className="text-[11px] font-mono uppercase text-cyan-400 mb-1">
                        정답 및 해설 (출처: {q.source})
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
