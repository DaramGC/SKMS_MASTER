import React from 'react';
import { BookOpen, Award, CheckCircle2, ChevronRight, Zap, Target, ShieldCheck } from 'lucide-react';
import { UserStats } from '../types/question';

interface HeroSectionProps {
  stats: UserStats;
  totalQuestions: number;
  onStartStudy: () => void;
  onStartTest: () => void;
  onGoToWrongAnswers: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stats,
  totalQuestions,
  onStartStudy,
  onStartTest,
  onGoToWrongAnswers
}) => {
  const progressPercent = totalQuestions > 0 ? Math.min(100, Math.round((stats.totalSolved / totalQuestions) * 100)) : 0;

  return (
    <div className="relative overflow-hidden py-10 lg:py-16">
      {/* Background Graphic with Measured Contrast Scrim */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <img
          src="/src/assets/images/hero_cyber_skms_1790831201706.jpg"
          alt="SKMS Cyber Command Hero"
          className="h-full w-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            2020.02 14차 개정 SKMS 공식 문서 기준 원천 데이터
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            SKMS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400">MASTER</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
            SK의 경영철학과 실행원리를 1,000개의 예상문제와 20문항 실전 모의 테스트로 완벽히 정복하세요.
          </p>

          {/* Primary Action CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartStudy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <BookOpen className="h-4 w-4" />
              <span>예상문제 풀기</span>
              <ChevronRight className="h-4 w-4 opacity-70" />
            </button>

            <button
              onClick={onStartTest}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-cyan-500/30 bg-[#0B132B]/80 px-7 py-3.5 text-sm font-bold text-cyan-300 backdrop-blur-sm transition-all hover:bg-cyan-950/60 hover:border-cyan-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Award className="h-4 w-4 text-cyan-400" />
              <span>실제 테스트 연습 (20문항)</span>
            </button>
          </div>
        </div>

        {/* Live Learning Analytics HUD */}
        <div className="mt-12 rounded-2xl border border-cyan-900/30 bg-[#0C1222]/80 backdrop-blur-md p-6 lg:p-8 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
            <div className="pt-4 lg:pt-0">
              <div className="text-xs font-medium text-slate-400 mb-1">전체 문제 데이터베이스</div>
              <div className="font-mono text-2xl lg:text-3xl font-bold text-white tabular-nums">
                {totalQuestions.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">문항</span>
              </div>
              <div className="text-[11px] text-cyan-400 mt-1">SKMS PDF 완벽 반영</div>
            </div>

            <div className="pt-4 lg:pt-0">
              <div className="text-xs font-medium text-slate-400 mb-1">누적 풀이 문항</div>
              <div className="font-mono text-2xl lg:text-3xl font-bold text-cyan-300 tabular-nums">
                {stats.totalSolved.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">/ {totalQuestions}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">진행률 {progressPercent}%</div>
            </div>

            <div className="pt-4 lg:pt-0">
              <div className="text-xs font-medium text-slate-400 mb-1">전체 정답률</div>
              <div className="font-mono text-2xl lg:text-3xl font-bold text-emerald-400 tabular-nums">
                {stats.accuracy}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">정답 {stats.correctCount} · 오답 {stats.wrongCount}</div>
            </div>

            <div className="pt-4 lg:pt-0">
              <div className="text-xs font-medium text-slate-400 mb-1">연속 학습 일수</div>
              <div className="font-mono text-2xl lg:text-3xl font-bold text-amber-400 tabular-nums">
                {stats.streakDays}
                <span className="text-xs font-normal text-slate-400 ml-1">일째</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">매일 반복 학습 중</div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-medium text-slate-300">SKMS 종합 학습 진도</span>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">{progressPercent}% 완료</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3 Core Pillars of SKMS 14th Revision */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-xl border border-slate-800 bg-[#0B0F19]/90 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-white text-sm">경영의 궁극적 목적</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              구성원 행복을 경영활동의 궁극적 목적으로 정의하고, 구성원이 행복 경영의 주체임을 확고히 하였습니다.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0B0F19]/90 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-white text-sm">VWBE를 통한 SUPEX 추구</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              자발적·의욕적 두뇌활용(VWBE)으로 발현되는 패기를 통해 SUPEX Company를 구현하고 구성원 행복을 확대합니다.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0B0F19]/90 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-white text-sm">사회적 가치 창출</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              이해관계자 행복을 위해 창출하는 모든 가치를 사회적 가치로 정의하여 경제적 가치와 선순환 발전을 이룹니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
