import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  LogOut, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  signInWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser 
} from '../services/firebaseAuth';
import { GoogleSheetsDbService } from '../services/googleSheetsDb';
import { UserStats } from '../types/question';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  currentAccessToken: string | null;
  userStats: UserStats;
  onAuthChanged: (user: User | null, token: string | null) => void;
  onSyncWithSheets: () => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentAccessToken,
  userStats,
  onAuthChanged,
  onSyncWithSheets
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { user, accessToken } = await signInWithGoogle();
      onAuthChanged(user, accessToken);
      // Automatically ensure spreadsheet and sync profile
      await GoogleSheetsDbService.syncUserProfile(user, userStats, accessToken);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginWithEmail(email, password);
      onAuthChanged(user, currentAccessToken);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setErrorMsg('모든 필수 항목을 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await registerWithEmail(email, password, displayName);
      onAuthChanged(user, currentAccessToken);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      onAuthChanged(null, null);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!currentAccessToken) {
      // Re-trigger google sign in to obtain access token
      await handleGoogleSignIn();
      return;
    }
    setIsLoading(true);
    setSyncStatus('Google Sheet에 동기화하는 중...');
    try {
      await onSyncWithSheets();
      setSyncStatus('동기화가 완료되었습니다!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: any) {
      setSyncStatus(`동기화 실패: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sheetUrl = GoogleSheetsDbService.getSpreadsheetUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl border border-cyan-900/50 bg-[#0C1222] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                {currentUser ? '사용자 프로필 & DB 연동' : 'SKMS MASTER 계정 로그인'}
              </h3>
              <p className="text-xs text-slate-400">
                {currentUser ? 'Google Sheet DB 실시간 동기화 상태' : '로그인하여 학습 기록을 영구 보존하세요'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentUser ? (
            /* Signed In View */
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 font-bold text-white text-sm">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {currentUser.displayName || 'SKMS 학습자'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block">풀이</span>
                    <strong className="text-cyan-300">{userStats.totalSolved}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">정답률</span>
                    <strong className="text-emerald-400">{userStats.accuracy}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">연속</span>
                    <strong className="text-amber-400">{userStats.streakDays}일</strong>
                  </div>
                </div>
              </div>

              {/* Google Sheets Connection Status */}
              <div className="rounded-xl border border-cyan-900/40 bg-[#070B14] p-4 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                    <span>Google Sheets DB 연동</span>
                  </span>
                  {currentAccessToken ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>연결됨 (Active)</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium">인증 필요</span>
                  )}
                </div>

                <p className="text-slate-400 leading-relaxed mb-3">
                  문제 풀이 로그, 테스트 기록, 전체 정답률 집계 데이터가 Google Sheet에 실시간 저장됩니다.
                </p>

                {sheetUrl && (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium mb-3"
                  >
                    <span>내 Google Sheet 데이터베이스 열기</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualSync}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{currentAccessToken ? '지금 Google Sheet 동기화' : 'Google 계정 연결'}</span>
                  </button>
                </div>

                {syncStatus && (
                  <div className="mt-2 text-[11px] text-cyan-300 font-mono text-center">
                    {syncStatus}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:border-rose-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </button>
            </div>
          ) : (
            /* Sign In / Register View */
            <div className="space-y-5">
              {/* Primary Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white py-3 px-4 text-xs font-bold text-slate-800 shadow-md hover:bg-slate-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Google 계정으로 로그인 및 Google Sheets 연동</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative bg-[#0C1222] px-3 text-[11px] text-slate-500 font-mono">
                  또는 이메일 계정
                </div>
              </div>

              {/* Segmented Tab (Login vs Register) */}
              <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMsg(null); }}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    tab === 'login' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMsg(null); }}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    tab === 'register' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  회원가입
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-950/40 border border-rose-500/30 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={tab === 'login' ? handleEmailLogin : handleEmailRegister} className="space-y-3.5">
                {tab === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      이름 / 닉네임 *
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="예: 홍길동 (SK C&C)"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    이메일 주소 *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    비밀번호 *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6자 이상 비밀번호"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-600/20"
                >
                  {tab === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  <span>{tab === 'login' ? '로그인' : '회원가입 완료'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
