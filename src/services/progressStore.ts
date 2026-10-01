import { UserAnswerRecord, WrongAnswerRecord, TestSession, UserStats } from '../types/question';

const STORAGE_KEY_USER_ANSWERS = 'skms_user_answers_v1';
const STORAGE_KEY_WRONG_ANSWERS = 'skms_wrong_answers_v1';
const STORAGE_KEY_TEST_SESSIONS = 'skms_test_sessions_v1';
const STORAGE_KEY_BOOKMARKS = 'skms_bookmarks_v1';
const STORAGE_KEY_LAST_STUDIED = 'skms_last_studied_date_v1';
const STORAGE_KEY_STREAK = 'skms_streak_days_v1';

export class ProgressStoreService {
  // Read all user answers
  public static getUserAnswers(): Record<string, UserAnswerRecord> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER_ANSWERS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  // Record an answer in Practice mode
  public static recordAnswer(
    questionId: string,
    selectedAnswer: 1 | 2 | 3 | 4,
    isCorrect: boolean
  ): void {
    const answers = this.getUserAnswers();
    answers[questionId] = {
      questionId,
      selectedAnswer,
      isCorrect,
      answeredAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY_USER_ANSWERS, JSON.stringify(answers));

    // Update wrong answers
    const wrongAnswers = this.getWrongAnswers();
    if (!isCorrect) {
      const existing = wrongAnswers[questionId];
      wrongAnswers[questionId] = {
        questionId,
        wrongCount: existing ? existing.wrongCount + 1 : 1,
        lastWrongAt: Date.now()
      };
    } else {
      // If answered correctly in review, optionally reduce wrongCount or resolve
      if (wrongAnswers[questionId]) {
        // Decrease wrong count or remove if resolved
        if (wrongAnswers[questionId].wrongCount <= 1) {
          delete wrongAnswers[questionId];
        } else {
          wrongAnswers[questionId].wrongCount -= 1;
        }
      }
    }
    localStorage.setItem(STORAGE_KEY_WRONG_ANSWERS, JSON.stringify(wrongAnswers));

    // Update study streak
    this.updateStreak();
  }

  // Wrong Answers
  public static getWrongAnswers(): Record<string, WrongAnswerRecord> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WRONG_ANSWERS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  public static removeWrongAnswer(questionId: string): void {
    const wrongAnswers = this.getWrongAnswers();
    if (wrongAnswers[questionId]) {
      delete wrongAnswers[questionId];
      localStorage.setItem(STORAGE_KEY_WRONG_ANSWERS, JSON.stringify(wrongAnswers));
    }
  }

  // Test Sessions
  public static getTestSessions(): TestSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TEST_SESSIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static saveTestSession(session: TestSession): void {
    const sessions = this.getTestSessions();
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEY_TEST_SESSIONS, JSON.stringify(sessions));

    // Also update wrong answer log for each missed question in the test
    const wrongAnswers = this.getWrongAnswers();
    session.questions.forEach((q) => {
      const userChoice = session.userAnswers[q.id];
      if (userChoice !== q.answer) {
        const existing = wrongAnswers[q.id];
        wrongAnswers[q.id] = {
          questionId: q.id,
          wrongCount: existing ? existing.wrongCount + 1 : 1,
          lastWrongAt: Date.now()
        };
      }
    });
    localStorage.setItem(STORAGE_KEY_WRONG_ANSWERS, JSON.stringify(wrongAnswers));

    this.updateStreak();
  }

  // Bookmarks
  public static getBookmarks(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static toggleBookmark(questionId: string): boolean {
    let bookmarks = this.getBookmarks();
    let isBookmarked = false;
    if (bookmarks.includes(questionId)) {
      bookmarks = bookmarks.filter((id) => id !== questionId);
      isBookmarked = false;
    } else {
      bookmarks.push(questionId);
      isBookmarked = true;
    }
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
    return isBookmarked;
  }

  // Streak & Activity
  private static updateStreak(): void {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem(STORAGE_KEY_LAST_STUDIED);
    let streak = parseInt(localStorage.getItem(STORAGE_KEY_STREAK) || '1', 10);

    if (!lastDate) {
      streak = 1;
    } else if (lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
    }

    localStorage.setItem(STORAGE_KEY_LAST_STUDIED, today);
    localStorage.setItem(STORAGE_KEY_STREAK, String(streak));
  }

  // Aggregate user stats
  public static getUserStats(totalAvailableQuestions: number): UserStats {
    const answers = Object.values(this.getUserAnswers());
    const totalSolved = answers.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const wrongCount = totalSolved - correctCount;
    const accuracy = totalSolved > 0 ? (correctCount / totalSolved) * 100 : 0;
    const streakDays = parseInt(localStorage.getItem(STORAGE_KEY_STREAK) || '0', 10);
    const lastStudiedDate = localStorage.getItem(STORAGE_KEY_LAST_STUDIED) || '오늘 아직 미풀이';
    const bookmarks = this.getBookmarks();

    return {
      totalSolved,
      correctCount,
      wrongCount,
      accuracy: Math.round(accuracy * 10) / 10,
      streakDays: totalSolved > 0 ? Math.max(1, streakDays) : 0,
      lastStudiedDate,
      bookmarkedQuestionIds: bookmarks
    };
  }

  // Clear all study data
  public static resetAllProgress(): void {
    localStorage.removeItem(STORAGE_KEY_USER_ANSWERS);
    localStorage.removeItem(STORAGE_KEY_WRONG_ANSWERS);
    localStorage.removeItem(STORAGE_KEY_TEST_SESSIONS);
    localStorage.removeItem(STORAGE_KEY_BOOKMARKS);
    localStorage.removeItem(STORAGE_KEY_LAST_STUDIED);
    localStorage.removeItem(STORAGE_KEY_STREAK);
  }
}
