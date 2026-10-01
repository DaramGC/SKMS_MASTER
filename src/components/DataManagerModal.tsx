import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Plus, 
  Check, 
  AlertCircle, 
  Download, 
  Trash2, 
  SlidersHorizontal,
  Database
} from 'lucide-react';
import { Question, Category, Difficulty, QuestionType } from '../types/question';
import { QuestionDatabaseService } from '../services/questionDb';

interface DataManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshQuestions: () => void;
  isExpandedMode: boolean;
  onToggleExpandedMode: (expanded: boolean) => void;
}

export const DataManagerModal: React.FC<DataManagerModalProps> = ({
  isOpen,
  onClose,
  onRefreshQuestions,
  isExpandedMode,
  onToggleExpandedMode
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'manual' | 'list'>('import');
  
  // Import state
  const [importText, setImportText] = useState<string>('');
  const [importReport, setImportReport] = useState<{
    validCount: number;
    errors: string[];
  } | null>(null);

  // Manual Add Form State
  const [newQuestion, setNewQuestion] = useState<{
    question: string;
    option_1: string;
    option_2: string;
    option_3: string;
    option_4: string;
    answer: 1 | 2 | 3 | 4;
    explanation: string;
    category: Category;
    topic: string;
    difficulty: Difficulty;
    source: string;
  }>({
    question: '',
    option_1: '',
    option_2: '',
    option_3: '',
    option_4: '',
    answer: 1,
    explanation: '',
    category: '경영철학',
    topic: '',
    difficulty: 'NORMAL',
    source: 'SKMS PDF 2020.02'
  });

  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  // Custom questions list
  const customQuestions = QuestionDatabaseService.getCustomQuestions();

  if (!isOpen) return null;

  const handleParseAndImport = () => {
    if (!importText.trim()) return;

    const result = QuestionDatabaseService.parseSkmcOrJson(importText);
    if (result.valid.length > 0) {
      const existing = QuestionDatabaseService.getCustomQuestions();
      QuestionDatabaseService.saveCustomQuestions([...result.valid, ...existing]);
      onRefreshQuestions();
    }

    setImportReport({
      validCount: result.valid.length,
      errors: result.errors
    });
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.question || !newQuestion.option_1 || !newQuestion.option_2 || !newQuestion.option_3 || !newQuestion.option_4) {
      alert('문제와 4개의 보기를 모두 입력해주세요.');
      return;
    }

    QuestionDatabaseService.addCustomQuestion({
      ...newQuestion,
      type: 'CONCEPT',
      source_page: 1,
      tags: ['사용자추가']
    });

    onRefreshQuestions();
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);

    // Reset form
    setNewQuestion({
      question: '',
      option_1: '',
      option_2: '',
      option_3: '',
      option_4: '',
      answer: 1,
      explanation: '',
      category: '경영철학',
      topic: '',
      difficulty: 'NORMAL',
      source: 'SKMS PDF 2020.02'
    });
  };

  const handleDeleteCustom = (id: string) => {
    QuestionDatabaseService.deleteCustomQuestion(id);
    onRefreshQuestions();
  };

  const handleExportJson = () => {
    const all = QuestionDatabaseService.getAllQuestions();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(all, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `skms_questions_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const categories: Category[] = [
    'SK와 SKMS',
    '경영철학',
    '실행원리',
    'VWBE 문화',
    'SUPEX Company',
    'SKMS 정립의 의의',
    'SKMS 보완 내력'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-cyan-900/50 bg-[#0C1222] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                SKMC 연동 및 문제 데이터베이스 관리
              </h3>
              <p className="text-xs text-slate-400">
                1,000문항 풀 확장 설정 및 SKMC / CSV / JSON 데이터 가져오기
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

        {/* Global Scale Setting Toggle */}
        <div className="bg-slate-900/80 px-6 py-3.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">
              문제 풀 규모 설정:
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {isExpandedMode ? '1,000문항 풀 확장 모드 (Active)' : '기본 핵심 문항 모드'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleExpandedMode(false)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                !isExpandedMode
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              기본 풀
            </button>
            <button
              onClick={() => onToggleExpandedMode(true)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                isExpandedMode
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1,000문항 확장
            </button>
            <button
              onClick={handleExportJson}
              title="전체 문제 데이터 JSON 내보내기"
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-300 border border-slate-800 rounded-lg bg-slate-950 hover:bg-slate-800 transition-colors ml-2"
            >
              <Download className="h-3 w-3" />
              <span>JSON 내보내기</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-slate-800 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('import')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'import' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            SKMC / CSV / JSON 가져오기
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'manual' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            개별 문제 직접 등록
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'list' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            추가된 문제 목록 ({customQuestions.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-cyan-400 block mb-1">지원 포맷 안내:</span>
                1. <strong>JSON 배열</strong>: <code className="text-cyan-300 font-mono">[{'{'}"question":"...","option_1":"...","answer":2,"explanation":"..."{'}'}]</code><br />
                2. <strong>CSV / TSV</strong>: 문제, 보기1, 보기2, 보기3, 보기4, 정답번호(1~4), 해설, 카테고리
              </div>

              <div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`여기에 SKMC 파일 데이터, JSON 문자열, 또는 CSV 형식의 텍스트를 붙여넣으세요.`}
                  rows={8}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400 font-mono">
                  데이터 유효성(보기 4개, 정답 1~4) 자동 검증 수행
                </div>

                <button
                  onClick={handleParseAndImport}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-600/20"
                >
                  <Upload className="h-4 w-4" />
                  <span>데이터 검증 및 문제 등록</span>
                </button>
              </div>

              {/* Import Report */}
              {importReport && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs">
                  <div className="font-bold text-emerald-400 mb-2">
                    성공적으로 등록된 문항: {importReport.validCount}개
                  </div>
                  {importReport.errors.length > 0 && (
                    <div className="space-y-1 text-rose-400">
                      <div className="font-semibold">검토 필요 항목 ({importReport.errors.length}건):</div>
                      {importReport.errors.slice(0, 5).map((err, i) => (
                        <div key={i} className="font-mono text-[11px]">• {err}</div>
                      ))}
                      {importReport.errors.length > 5 && (
                        <div className="text-slate-500 text-[10px]">외 {importReport.errors.length - 5}건 생략</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <form onSubmit={handleAddManual} className="space-y-4">
              {formSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 p-3 text-xs text-emerald-300">
                  <Check className="h-4 w-4" />
                  <span>문제가 데이터베이스에 성공적으로 추가되었습니다.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  문제 내용 (Question) *
                </label>
                <input
                  type="text"
                  required
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  placeholder="예: SKMS에서 정의하는 '사회적 가치'의 의미로 가장 적절한 것은?"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      보기 {num} *
                    </label>
                    <input
                      type="text"
                      required
                      value={newQuestion[`option_${num}` as 'option_1' | 'option_2' | 'option_3' | 'option_4']}
                      onChange={(e) => setNewQuestion({
                        ...newQuestion,
                        [`option_${num}`]: e.target.value
                      })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    정답 번호 (1 ~ 4) *
                  </label>
                  <select
                    value={newQuestion.answer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, answer: parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                  >
                    <option value={1}>1번</option>
                    <option value={2}>2번</option>
                    <option value={3}>3번</option>
                    <option value={4}>4번</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    카테고리
                  </label>
                  <select
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value as Category })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    난이도
                  </label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as Difficulty })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                  >
                    <option value="EASY">쉬움 (EASY)</option>
                    <option value="NORMAL">보통 (NORMAL)</option>
                    <option value="HARD">어려움 (HARD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  정답 해설 (Explanation)
                </label>
                <textarea
                  rows={3}
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  placeholder="SKMS PDF 원문에 근거한 상세 해설을 작성하세요."
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-600/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>문제 등록하기</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'list' && (
            <div className="space-y-3">
              {customQuestions.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  직접 추가하거나 SKMC 파일에서 가져온 사용자 정의 문제가 없습니다.
                </div>
              ) : (
                customQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex-1">
                      <div className="text-xs text-cyan-400 font-mono mb-1">
                        {q.category} · 정답: {q.answer}번 · {q.source}
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mb-2">
                        {q.question}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1">
                        해설: {q.explanation}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCustom(q.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
