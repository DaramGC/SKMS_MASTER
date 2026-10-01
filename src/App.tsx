/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Header, NavTab } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StudyPage } from './components/StudyPage';
import { TestPage } from './components/TestPage';
import { ResultPage } from './components/ResultPage';
import { WrongAnswerPage } from './components/WrongAnswerPage';
import { DashboardPage } from './components/DashboardPage';
import { DataManagerModal } from './components/DataManagerModal';
import { AuthModal } from './components/AuthModal';
import { QuestionDatabaseService } from './services/questionDb';
import { ProgressStoreService } from './services/progressStore';
import { initAuth, setAccessToken } from './services/firebaseAuth';
import { GoogleSheetsDbService, QuestionAccuracyStat } from './services/googleSheetsDb';
import { Question, TestSession, UserStats } from './types/question';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isExpandedMode, setIsExpandedMode] = useState<boolean>(
    QuestionDatabaseService.isExpandedMode()
  );
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalSolved: 0,
    correctCount: 0,
    wrongCount: 0,
    accuracy: 0,
    streakDays: 0,
    lastStudiedDate: '',
    bookmarkedQuestionIds: []
  });

  // Auth & Google Sheets State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [collectiveStats, setCollectiveStats] = useState<Record<string, QuestionAccuracyStat>>({});

  // Current completed test session for Result view
  const [completedTestSession, setCompletedTestSession] = useState<TestSession | null>(null);

  // Retest questions subset (for wrong answers clinic)
  const [customStudySubset, setCustomStudySubset] = useState<Question[] | null>(null);

  // Data Manager Modal
  const [isDataManagerOpen, setIsDataManagerOpen] = useState<boolean>(false);

  // Load questions and stats
  const refreshData = useCallback(() => {
    const list = QuestionDatabaseService.getAllQuestions();
    setAllQuestions(list);
    const updatedStats = ProgressStoreService.getUserStats(list.length);
    setStats(updatedStats);
  }, []);

  // Fetch collective stats from Google Sheets if access token available
  const loadCollectiveStats = useCallback(async (token: string) => {
    try {
      const statsMap = await GoogleSheetsDbService.fetchCollectiveQuestionStats(token);
      if (statsMap && Object.keys(statsMap).length > 0) {
        setCollectiveStats(statsMap);
      }
    } catch (e) {
      console.warn('Failed to load collective stats from sheets', e);
    }
  }, []);

  // Initialize Auth & Data on mount
  useEffect(() => {
    refreshData();

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setToken(token);
        setAccessToken(token);
        if (token) {
          loadCollectiveStats(token);
        }
      },
      () => {
        setCurrentUser(null);
        setToken(null);
        setAccessToken(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [refreshData, loadCollectiveStats]);

  const handleToggleExpandedMode = (expanded: boolean) => {
    QuestionDatabaseService.setExpandedMode(expanded);
    setIsExpandedMode(expanded);
    refreshData();
  };

  const handleStartStudy = () => {
    setCustomStudySubset(null);
    setCurrentTab('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartStudyWithQuestion = (q: Question) => {
    setCustomStudySubset([q]);
    setCurrentTab('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTest = () => {
    setCompletedTestSession(null);
    setCurrentTab('test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When a single problem is answered in Practice mode
  const handleProblemAnswerLogged = async (
    question: Question,
    selectedOption: 1 | 2 | 3 | 4,
    isCorrect: boolean
  ) => {
    refreshData();

    // Log to Google Sheets if user is authenticated with token
    if (currentUser && accessToken) {
      const logPayload = {
        logId: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: currentUser.uid,
        email: currentUser.email || 'N/A',
        questionId: question.id,
        category: question.category,
        topic: question.topic,
        selectedOption,
        correctAnswer: question.answer,
        isCorrect,
        difficulty: question.difficulty,
        timestamp: new Date().toISOString()
      };

      try {
        await GoogleSheetsDbService.logProblemAttempt(logPayload, accessToken);
        // Refresh collective stats in background
        loadCollectiveStats(accessToken);
      } catch (err) {
        console.warn('Logging problem attempt to Sheets failed', err);
      }
    }
  };

  // When 20-question mock test is submitted
  const handleCompleteTest = async (session: TestSession) => {
    setCompletedTestSession(session);
    refreshData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Log test session to Google Sheets if user is authenticated
    if (currentUser && accessToken) {
      try {
        await GoogleSheetsDbService.logTestSession(session, currentUser, accessToken);
        const updatedStats = ProgressStoreService.getUserStats(allQuestions.length);
        await GoogleSheetsDbService.syncUserProfile(currentUser, updatedStats, accessToken);
      } catch (err) {
        console.warn('Logging test session to Sheets failed', err);
      }
    }
  };

  const handleRetestMistakes = (wrongQuestions: Question[]) => {
    setCustomStudySubset(wrongQuestions);
    setCompletedTestSession(null);
    setCurrentTab('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tab: NavTab) => {
    setCompletedTestSession(null);
    setCustomStudySubset(null);
    setCurrentTab(tab);
    refreshData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manual trigger to sync current profile and stats to Google Sheets
  const handleManualSyncWithSheets = async () => {
    if (!currentUser || !accessToken) {
      setIsAuthModalOpen(true);
      return;
    }
    await GoogleSheetsDbService.syncUserProfile(currentUser, stats, accessToken);
    await loadCollectiveStats(accessToken);
  };

  const spreadsheetUrl = GoogleSheetsDbService.getSpreadsheetUrl();

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 cyber-grid flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenDataManager={() => setIsDataManagerOpen(true)}
        isExpandedMode={isExpandedMode}
        totalQuestionsCount={allQuestions.length}
        currentUser={currentUser}
        hasSheetsAccess={!!accessToken}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* If test was just completed, show ResultPage */}
        {completedTestSession ? (
          <ResultPage
            session={completedTestSession}
            onRetestMistakes={handleRetestMistakes}
            onStartNewTest={handleStartTest}
            onGoToStudy={handleStartStudy}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HeroSection
                stats={stats}
                totalQuestions={allQuestions.length}
                onStartStudy={handleStartStudy}
                onStartTest={handleStartTest}
                onGoToWrongAnswers={() => handleSelectTab('wrong')}
              />
            )}

            {currentTab === 'study' && (
              <StudyPage
                questions={customStudySubset || allQuestions}
                onOpenWrongNote={() => handleSelectTab('wrong')}
                collectiveStats={collectiveStats}
                onAnswerLogged={handleProblemAnswerLogged}
              />
            )}

            {currentTab === 'test' && (
              <TestPage
                onCompleteTest={handleCompleteTest}
                onCancelTest={() => handleSelectTab('home')}
              />
            )}

            {currentTab === 'wrong' && (
              <WrongAnswerPage
                allQuestions={allQuestions}
                onStartRetest={handleRetestMistakes}
                onGoToStudy={handleStartStudy}
              />
            )}

            {currentTab === 'stats' && (
              <DashboardPage
                stats={stats}
                totalQuestions={allQuestions.length}
                allQuestions={allQuestions}
                collectiveStats={collectiveStats}
                spreadsheetUrl={spreadsheetUrl}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onResetStats={refreshData}
                onStartStudy={handleStartStudy}
                onSelectQuestionToStudy={handleStartStudyWithQuestion}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#05070B] py-8 text-center text-xs text-slate-500 font-mono">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="font-semibold text-slate-400">SKMS MASTER</span>
            <span>· 2020.02 14차 전면 개정 SKMS 공식 문서 기준</span>
          </div>
          <div>
            <span>Google Sheets DB 실시간 동기화 지원 · SUPEX Company 구현</span>
          </div>
        </div>
      </footer>

      {/* SKMC & Data Manager Modal */}
      <DataManagerModal
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
        onRefreshQuestions={refreshData}
        isExpandedMode={isExpandedMode}
        onToggleExpandedMode={handleToggleExpandedMode}
      />

      {/* User Auth & Google Sheets Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        currentAccessToken={accessToken}
        userStats={stats}
        onAuthChanged={(user, token) => {
          setCurrentUser(user);
          setToken(token);
          setAccessToken(token);
          if (token) loadCollectiveStats(token);
          refreshData();
        }}
        onSyncWithSheets={handleManualSyncWithSheets}
      />
    </div>
  );
}
