import React from 'react';
import { Layers, User as UserIcon, FileSpreadsheet } from 'lucide-react';
import { User } from 'firebase/auth';

export type NavTab = 'home' | 'study' | 'test' | 'wrong' | 'stats';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenDataManager: () => void;
  isExpandedMode: boolean;
  totalQuestionsCount: number;
  currentUser: User | null;
  hasSheetsAccess: boolean;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenDataManager,
  isExpandedMode,
  totalQuestionsCount,
  currentUser,
  hasSheetsAccess,
  onOpenAuthModal
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-950/40 bg-[#07090E]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('home')}
            className="group flex items-center gap-2 text-left focus-visible:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
              S
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              SKMS MASTER
            </span>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('home')}
            className={`transition-colors hover:text-white ${
              currentTab === 'home' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
            }`}
          >
            홈
          </button>
          <button
            onClick={() => onSelectTab('study')}
            className={`transition-colors hover:text-white ${
              currentTab === 'study' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
            }`}
          >
            예상문제 풀기
          </button>
          <button
            onClick={() => onSelectTab('test')}
            className={`transition-colors hover:text-white ${
              currentTab === 'test' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
            }`}
          >
            실제 테스트 연습
          </button>
          <button
            onClick={() => onSelectTab('wrong')}
            className={`transition-colors hover:text-white ${
              currentTab === 'wrong' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
            }`}
          >
            오답노트
          </button>
          <button
            onClick={() => onSelectTab('stats')}
            className={`transition-colors hover:text-white ${
              currentTab === 'stats' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
            }`}
          >
            학습 통계
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDataManager}
            title="SKMC 연동 및 문제 DB 관리"
            className="hidden sm:flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>문제 관리 ({totalQuestionsCount})</span>
          </button>

          {/* User Account / Google Sheets Sync CTA */}
          <button
            onClick={onOpenAuthModal}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              currentUser
                ? hasSheetsAccess
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:border-emerald-400'
                  : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-200 hover:border-cyan-400'
                : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {hasSheetsAccess ? (
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <UserIcon className="h-3.5 w-3.5 text-cyan-400" />
            )}
            <span className="truncate max-w-[120px]">
              {currentUser ? currentUser.displayName || currentUser.email?.split('@')[0] || '내 계정' : '로그인 / DB 연동'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-800/60 bg-[#0B0F19]/90 px-4 py-2 text-xs font-medium text-slate-400 no-scrollbar gap-5">
        <button
          onClick={() => onSelectTab('home')}
          className={`whitespace-nowrap ${currentTab === 'home' ? 'text-cyan-400 font-bold' : ''}`}
        >
          홈
        </button>
        <button
          onClick={() => onSelectTab('study')}
          className={`whitespace-nowrap ${currentTab === 'study' ? 'text-cyan-400 font-bold' : ''}`}
        >
          예상문제
        </button>
        <button
          onClick={() => onSelectTab('test')}
          className={`whitespace-nowrap ${currentTab === 'test' ? 'text-cyan-400 font-bold' : ''}`}
        >
          실전 테스트
        </button>
        <button
          onClick={() => onSelectTab('wrong')}
          className={`whitespace-nowrap ${currentTab === 'wrong' ? 'text-cyan-400 font-bold' : ''}`}
        >
          오답노트
        </button>
        <button
          onClick={() => onSelectTab('stats')}
          className={`whitespace-nowrap ${currentTab === 'stats' ? 'text-cyan-400 font-bold' : ''}`}
        >
          학습통계
        </button>
      </div>
    </header>
  );
};
