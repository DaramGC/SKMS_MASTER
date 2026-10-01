import { User } from 'firebase/auth';
import { UserStats, TestSession, Question } from '../types/question';

const STORAGE_KEY_SPREADSHEET_ID = 'skms_google_spreadsheet_id_v1';
const SPREADSHEET_TITLE = 'SKMS MASTER - 학습 기록 데이터베이스';

export interface ProblemLogPayload {
  logId: string;
  userId: string;
  email: string;
  questionId: string;
  category: string;
  topic: string;
  selectedOption: number;
  correctAnswer: number;
  isCorrect: boolean;
  difficulty: string;
  timestamp: string;
}

export interface QuestionAccuracyStat {
  questionId: string;
  category: string;
  topic: string;
  difficulty: string;
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
  accuracyRate: number; // percentage
  lastUpdated: string;
}

export class GoogleSheetsDbService {
  public static getStoredSpreadsheetId(): string | null {
    return localStorage.getItem(STORAGE_KEY_SPREADSHEET_ID);
  }

  public static setStoredSpreadsheetId(id: string): void {
    localStorage.setItem(STORAGE_KEY_SPREADSHEET_ID, id);
  }

  public static getSpreadsheetUrl(): string | null {
    const id = this.getStoredSpreadsheetId();
    return id ? `https://docs.google.com/spreadsheets/d/${id}/edit` : null;
  }

  // Ensures the database spreadsheet exists on the user's Google Drive
  public static async ensureSpreadsheet(accessToken: string): Promise<string> {
    const savedId = this.getStoredSpreadsheetId();
    if (savedId) {
      try {
        const verifyRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${savedId}?fields=spreadsheetId,properties.title`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (verifyRes.ok) {
          return savedId;
        }
      } catch (e) {
        console.warn('Verifying stored spreadsheet failed, searching drive...', e);
      }
    }

    // Try finding existing spreadsheet in Google Drive
    try {
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(SPREADSHEET_TITLE)}' and trashed=false&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.files && data.files.length > 0) {
          const foundId = data.files[0].id;
          this.setStoredSpreadsheetId(foundId);
          return foundId;
        }
      }
    } catch (e) {
      console.warn('Search Drive failed', e);
    }

    // Create a new spreadsheet with proper DB sheets
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: SPREADSHEET_TITLE
        },
        sheets: [
          { properties: { title: 'Users' } },
          { properties: { title: 'ProblemLogs' } },
          { properties: { title: 'TestSessions' } },
          { properties: { title: 'QuestionStats' } }
        ]
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || '스프레드시트 생성 실패');
    }

    const created = await createRes.json();
    const newId = created.spreadsheetId;
    this.setStoredSpreadsheetId(newId);

    // Seed headers
    await this.initializeHeaders(newId, accessToken);
    return newId;
  }

  private static async initializeHeaders(spreadsheetId: string, accessToken: string): Promise<void> {
    const headerPayload = {
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: 'Users!A1:J1',
          values: [
            ['User ID', 'Email', 'Display Name', 'Joined At', 'Last Active At', 'Total Solved', 'Correct Count', 'Wrong Count', 'Accuracy (%)', 'Streak Days']
          ]
        },
        {
          range: 'ProblemLogs!A1:K1',
          values: [
            ['Log ID', 'User ID', 'Email', 'Question ID', 'Category', 'Topic', 'Selected Option', 'Correct Answer', 'Is Correct', 'Difficulty', 'Timestamp']
          ]
        },
        {
          range: 'TestSessions!A1:I1',
          values: [
            ['Session ID', 'User ID', 'Email', 'Score', 'Total Questions', 'Accuracy (%)', 'Duration (s)', 'Pass/Fail', 'Completed At']
          ]
        },
        {
          range: 'QuestionStats!A1:I1',
          values: [
            ['Question ID', 'Category', 'Topic', 'Difficulty', 'Total Attempts', 'Correct Count', 'Wrong Count', 'Accuracy Rate (%)', 'Last Updated']
          ]
        }
      ]
    };

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(headerPayload)
    });
  }

  // 1. Sync User Profile in Google Sheets
  public static async syncUserProfile(
    user: User,
    stats: UserStats,
    accessToken: string
  ): Promise<void> {
    try {
      const spreadsheetId = await this.ensureSpreadsheet(accessToken);
      const now = new Date().toISOString();

      // Read existing users to check if user already exists
      const readRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Users!A2:J`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      let existingRowIndex = -1;
      if (readRes.ok) {
        const data = await readRes.json();
        const rows: any[][] = data.values || [];
        existingRowIndex = rows.findIndex((row) => row[0] === user.uid);
      }

      const rowValues = [
        user.uid,
        user.email || 'N/A',
        user.displayName || 'SKMS 학습자',
        user.metadata.creationTime || now,
        now,
        stats.totalSolved,
        stats.correctCount,
        stats.wrongCount,
        stats.accuracy,
        stats.streakDays
      ];

      if (existingRowIndex >= 0) {
        // Update existing row
        const rowNum = existingRowIndex + 2;
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Users!A${rowNum}:J${rowNum}?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: [rowValues] })
          }
        );
      } else {
        // Append new row
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Users!A:J:append?valueInputOption=USER_ENTERED`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: [rowValues] })
          }
        );
      }
    } catch (e) {
      console.error('Failed to sync user profile to Google Sheet', e);
    }
  }

  // 2. Log Individual Problem Solving to Google Sheet
  public static async logProblemAttempt(
    log: ProblemLogPayload,
    accessToken: string
  ): Promise<void> {
    try {
      const spreadsheetId = await this.ensureSpreadsheet(accessToken);

      const row = [
        log.logId,
        log.userId,
        log.email,
        log.questionId,
        log.category,
        log.topic,
        log.selectedOption,
        log.correctAnswer,
        log.isCorrect ? 'TRUE' : 'FALSE',
        log.difficulty,
        log.timestamp
      ];

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/ProblemLogs!A:K:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [row] })
        }
      );

      // Also increment collective question stats asynchronously
      this.updateQuestionStatRow(spreadsheetId, log, accessToken).catch((err) =>
        console.warn('Update question stat error', err)
      );
    } catch (e) {
      console.error('Failed to log problem attempt to Google Sheet', e);
    }
  }

  // 3. Log Test Session to Google Sheet
  public static async logTestSession(
    session: TestSession,
    user: User,
    accessToken: string
  ): Promise<void> {
    try {
      const spreadsheetId = await this.ensureSpreadsheet(accessToken);
      const isPass = session.accuracy >= 70;

      const row = [
        session.id,
        user.uid,
        user.email || 'N/A',
        session.score,
        session.totalQuestions,
        session.accuracy,
        session.durationSeconds,
        isPass ? 'PASS' : 'FAIL',
        new Date(session.completedAt).toISOString()
      ];

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/TestSessions!A:I:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [row] })
        }
      );
    } catch (e) {
      console.error('Failed to log test session to Google Sheet', e);
    }
  }

  // Update collective stats for a specific question
  private static async updateQuestionStatRow(
    spreadsheetId: string,
    log: ProblemLogPayload,
    accessToken: string
  ): Promise<void> {
    try {
      const readRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/QuestionStats!A2:I`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      let rows: any[][] = [];
      if (readRes.ok) {
        const data = await readRes.json();
        rows = data.values || [];
      }

      const qIndex = rows.findIndex((r) => r[0] === log.questionId);
      const now = new Date().toISOString();

      if (qIndex >= 0) {
        const existing = rows[qIndex];
        const attempts = parseInt(existing[4] || '0', 10) + 1;
        const correct = parseInt(existing[5] || '0', 10) + (log.isCorrect ? 1 : 0);
        const wrong = parseInt(existing[6] || '0', 10) + (log.isCorrect ? 0 : 1);
        const rate = Math.round((correct / attempts) * 1000) / 10;

        const updatedRow = [
          log.questionId,
          log.category,
          log.topic,
          log.difficulty,
          attempts,
          correct,
          wrong,
          rate,
          now
        ];

        const rowNum = qIndex + 2;
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/QuestionStats!A${rowNum}:I${rowNum}?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: [updatedRow] })
          }
        );
      } else {
        const newRow = [
          log.questionId,
          log.category,
          log.topic,
          log.difficulty,
          1,
          log.isCorrect ? 1 : 0,
          log.isCorrect ? 0 : 1,
          log.isCorrect ? 100 : 0,
          now
        ];

        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/QuestionStats!A:I:append?valueInputOption=USER_ENTERED`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: [newRow] })
          }
        );
      }
    } catch (e) {
      console.warn('Update question stat row failed', e);
    }
  }

  // Fetch all question collective accuracy statistics from Google Sheets
  public static async fetchCollectiveQuestionStats(
    accessToken: string
  ): Promise<Record<string, QuestionAccuracyStat>> {
    const spreadsheetId = await this.ensureSpreadsheet(accessToken);
    const result: Record<string, QuestionAccuracyStat> = {};

    try {
      const readRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/QuestionStats!A2:I`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (readRes.ok) {
        const data = await readRes.json();
        const rows: any[][] = data.values || [];
        rows.forEach((r) => {
          if (r[0]) {
            result[r[0]] = {
              questionId: r[0],
              category: r[1] || '',
              topic: r[2] || '',
              difficulty: r[3] || 'NORMAL',
              totalAttempts: parseInt(r[4] || '0', 10),
              correctCount: parseInt(r[5] || '0', 10),
              wrongCount: parseInt(r[6] || '0', 10),
              accuracyRate: parseFloat(r[7] || '0'),
              lastUpdated: r[8] || ''
            };
          }
        });
      }
    } catch (e) {
      console.error('Fetch collective stats error', e);
    }

    return result;
  }
}
