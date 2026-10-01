import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  RotateCcw, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  PieChart,
  Layers,
  AlertTriangle,
  FileSpreadsheet,
  ExternalLink,
  Users
} from 'lucide-react';
import { UserStats, TestSession, Question, Category } from '../types/question';
import { ProgressStoreService } from '../services/progressStore';
import { QuestionAccuracyStat } from '../services/googleSheetsDb';
import { QuestionStatsSection } from './QuestionStatsSection';

interface DashboardPageProps {
  stats: UserStats;
  totalQuestions: number;
  allQuestions: Question[];
  collectiveStats?: Record<string, QuestionAccuracyStat>;
  spreadsheetUrl?: string | null;
  onOpenAuthModal?: () => void;
  onResetStats: () => void;
  onStartStudy: () => void;
  onSelectQuestionToStudy?: (q: Question) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  totalQuestions,
  allQuestions,
  collectiveStats = {},
  spreadsheetUrl,
  onOpenAuthModal,
  onResetStats,
  onStartStudy,
  onSelectQuestionToStudy
}) => {
  const [viewMode, setViewMode] = useState<'personal' | 'collective'>('personal');
  const [testSessions] = useState<TestSession[]>(ProgressStoreService.getTestSessions());
  const [userAnswers] = useState(ProgressStoreService.getUserAnswers());
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const unsolvedCount = Math.max(0, totalQuestions - stats.totalSolved);
  const overallProgress = totalQuestions > 0 ? Math.round((stats.totalSolved / totalQuestions) * 100) : 0;

  // Average test score
  const avgTestScore = testSessions.length > 0
    ? Math.round((testSessions.reduce((acc, s) => acc + s.score, 0) / testSessions.length) * 10) / 10
    : 0;

  const categories: Category[] = [
    'SK와 SKMS',
    '경영철학',
    '실행원리',
    'VWBE 문화',
    'SUPEX Company',
    'SKMS 정립의 의의',
    'SKMS 보완 내력'
  ];

  // Calculate mastery by category
  const categoryStats = categories.map((cat) => {
    const catQuestions = allQuestions.filter((q) => q.category === cat);
    const catTotal = catQuestions.length;
    let solvedInCat = 0;
    let correctInCat = 0;

    catQuestions.forEach((q) => {
      const record = userAnswers[q.id];
      if (record) {
        solvedInCat += 1;
        if (record.isCorrect) correctInCat += 1;
      }
    });

    const accuracyInCat = solvedInCat > 0 ? Math.round((correctInCat / solvedInCat) * 100) : 0;
    const progressInCat = catTotal > 0 ? Math.round((solvedInCat / catTotal) * 100) : 0;

    return {
      category: cat,
      total: catTotal,
      solved: solvedInCat,
      correct: correctInCat,
      accuracy: accuracyInCat,
      progress: progressInCat
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
            학습 성취도 & 빅데이터 분석
          </span>
          <h2 className="font-display text-3xl font-bold text-white">
            SKMS MASTER DASHBOARD
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {spreadsheetUrl ? (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-xs text-emerald-300 hover:border-emerald-400 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Google Sheet DB 열기</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-900/50 transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
              <span>Google Sheet DB 연동</span>
            </button>
          )}

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:border-rose-900 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>데이터 초기화</span>
          </button>
        </div>
      </div>

      {/* Dashboard View Mode Selector */}
      <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-xs font-semibold mb-8 max-w-md">
        <button
          onClick={() => setViewMode('personal')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            viewMode === 'personal'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>내 학습 성취도</span>
        </button>
        <button
          onClick={() => setViewMode('collective')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            viewMode === 'collective'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>문제별 전체 정답률 통계</span>
        </button>
      </div>

      {viewMode === 'collective' ? (
        <QuestionStatsSection
          allQuestions={allQuestions}
          collectiveStats={collectiveStats}
          onSelectQuestionToStudy={(q) => {
            if (onSelectQuestionToStudy) {
              onSelectQuestionToStudy(q);
            } else {
              onStartStudy();
            }
          }}
        />
      ) : (
        <>
          {/* Main KPI Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="rounded-2xl border border-slate-800 bg-[#0C1222]/90 p-5 backdrop-blur-md">
              <div className="text-xs text-slate-400 mb-2 font-medium">전체 학습 진행률</div>
              <div className="font-display text-3xl font-bold text-white mb-2">
                {overallProgress}%
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="text-xs font-mono text-slate-400 tabular-nums">
                {stats.totalSolved} / {totalQuestions} 문항 풀이 완료
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0C1222]/90 p-5 backdrop-blur-md">
              <div className="text-xs text-slate-400 mb-2 font-medium">종합 정답률</div>
              <div className="font-display text-3xl font-bold text-emerald-400 mb-2 font-mono tabular-nums">
                {stats.accuracy}%
              </div>
              <div className="text-xs font-mono text-slate-400 tabular-nums">
                정답 <span className="text-emerald-400 font-bold">{stats.correctCount}</span> · 오답 <span className="text-rose-400 font-bold">{stats.wrongCount}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0C1222]/90 p-5 backdrop-blur-md">
              <div className="text-xs text-slate-400 mb-2 font-medium">모의 테스트 평균 점수</div>
              <div className="font-display text-3xl font-bold text-cyan-300 mb-2 font-mono tabular-nums">
                {avgTestScore} <span className="text-base text-slate-500 font-normal">/ 20</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                총 {testSessions.length}회 응시 완료
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0C1222]/90 p-5 backdrop-blur-md">
              <div className="text-xs text-slate-400 mb-2 font-medium">연속 학습 일수</div>
              <div className="font-display text-3xl font-bold text-amber-400 mb-2 font-mono tabular-nums">
                {stats.streakDays}일
              </div>
              <div className="text-xs text-slate-400">
                최근 학습: {stats.lastStudiedDate}
              </div>
            </div>
          </div>

          {/* Category Mastery Breakdown */}
          <div className="rounded-2xl border border-slate-800 bg-[#0C1222]/90 p-6 sm:p-8 backdrop-blur-md mb-8 shadow-xl">
            <h3 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              <span>영역별 이해도 및 학습 진도</span>
            </h3>

            <div className="space-y-5">
              {categoryStats.map((item) => (
                <div key={item.category} className="border-b border-slate-800/60 pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm font-medium text-slate-200 mb-2">
                    <span className="font-semibold text-white">{item.category}</span>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-slate-400">
                        진도: {item.solved} / {item.total} ({item.progress}%)
                      </span>
                      <span className={`font-bold ${item.accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        정답률: {item.accuracy}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.accuracy >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Mock Test History Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0C1222]/90 p-6 sm:p-8 backdrop-blur-md shadow-xl">
            <h3 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-cyan-400" />
              <span>실전 모의 테스트 응시 기록</span>
            </h3>

            {testSessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                아직 응시한 실전 모의 테스트가 없습니다. "실제 테스트 연습"을 완료해보세요.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="py-3 px-3">회차</th>
                      <th className="py-3 px-3">응시 일시</th>
                      <th className="py-3 px-3">점수</th>
                      <th className="py-3 px-3">정답률</th>
                      <th className="py-3 px-3">소요 시간</th>
                      <th className="py-3 px-3 text-right">판정</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {testSessions.map((session, idx) => (
                      <tr key={session.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-200">
                          제 {testSessions.length - idx}회
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {new Date(session.completedAt).toLocaleDateString()} {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3 font-bold text-white tabular-nums">
                          {session.score} / {session.totalQuestions}
                        </td>
                        <td className="py-3 px-3 font-bold text-cyan-400 tabular-nums">
                          {session.accuracy}%
                        </td>
                        <td className="py-3 px-3 text-slate-400 tabular-nums">
                          {Math.floor(session.durationSeconds / 60)}분 {session.durationSeconds % 60}초
                        </td>
                        <td className="py-3 px-3 text-right">
                          {session.accuracy >= 70 ? (
                            <span className="text-emerald-400 font-bold">합격 (Pass)</span>
                          ) : (
                            <span className="text-amber-400 font-bold">보완 권장</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-950 bg-[#0C1222] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-display text-lg font-bold text-white">
                학습 데이터를 초기화하시겠습니까?
              </h3>
            </div>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              풀이한 모든 문제 기록, 오답노트, 모의 테스트 결과 및 연속 학습 일수가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                취소
              </button>
              <button
                onClick={() => {
                  ProgressStoreService.resetAllProgress();
                  setShowResetConfirm(false);
                  onResetStats();
                }}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500"
              >
                초기화 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
