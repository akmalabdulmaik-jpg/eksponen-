import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Timer,
  XCircle,
} from 'lucide-react';
import {
  BankQuestion,
  CURATED_QUESTION_BANK,
  generateDynamicRaceQuestions,
  TOPIC_LABELS,
  TopicKey,
} from '../data/questionBank';
import { InlineMathText } from './MathExpr';

type SubView = 'test' | 'bank';

export const TestAndBank: React.FC = () => {
  const [subView, setSubView] = useState<SubView>('test');

  // --- TES MANDIRI STATE ---
  const [testTopic, setTestTopic] = useState<'all' | TopicKey>('all');
  const [testCount, setTestCount] = useState<10 | 20 | 30>(10);
  const [testActive, setTestActive] = useState<boolean>(false);
  const [testFinished, setTestFinished] = useState<boolean>(false);
  const [testQuestions, setTestQuestions] = useState<BankQuestion[]>([]);
  const [testIndex, setTestIndex] = useState<number>(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [timerHandle, setTimerHandle] = useState<number | null>(null);

  // --- BANK 125+ SOAL STATE ---
  const [bankFilterTopic, setBankFilterTopic] = useState<'all' | TopicKey>('all');
  const [bankSearch, setBankSearch] = useState<string>('');
  const [bankPage, setBankPage] = useState<number>(1);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [quickAttempt, setQuickAttempt] = useState<Record<string, number>>({});
  const [dynamicPracticeList, setDynamicPracticeList] = useState<BankQuestion[]>([]);

  const combinedBank = useMemo(
    () => [...CURATED_QUESTION_BANK, ...dynamicPracticeList],
    [dynamicPracticeList]
  );

  const startTest = () => {
    const pool =
      testTopic === 'all'
        ? combinedBank
        : combinedBank.filter((q) => q.topic === testTopic);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(testCount, pool.length));
    setTestQuestions(shuffled);
    setTestAnswers({});
    setTestIndex(0);
    setSecondsElapsed(0);
    setTestFinished(false);
    setTestActive(true);

    if (timerHandle) window.clearInterval(timerHandle);
    const handle = window.setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    setTimerHandle(handle);
  };

  const finishTest = () => {
    if (timerHandle) {
      window.clearInterval(timerHandle);
      setTimerHandle(null);
    }
    setTestActive(false);
    setTestFinished(true);
  };

  const testReport = useMemo(() => {
    if (!testFinished || testQuestions.length === 0) return null;
    let correct = 0;
    const byTopic: Record<string, { label: string; correct: number; total: number }> = {};

    for (const q of testQuestions) {
      if (!byTopic[q.topic]) {
        byTopic[q.topic] = { label: q.topicLabel, correct: 0, total: 0 };
      }
      byTopic[q.topic].total += 1;
      const chosen = testAnswers[q.id];
      if (chosen === q.correctIndex) {
        correct += 1;
        byTopic[q.topic].correct += 1;
      }
    }

    const scorePct = Math.round((correct / testQuestions.length) * 100);
    const basisStat = byTopic['syarat-basis'];
    const basisWeak = basisStat && basisStat.correct < basisStat.total;

    return {
      correct,
      total: testQuestions.length,
      scorePct,
      byTopic: Object.entries(byTopic),
      basisWeak,
    };
  }, [testAnswers, testFinished, testQuestions]);

  // --- BANK FILTERING ---
  const filteredBank = useMemo(() => {
    const qLower = bankSearch.trim().toLowerCase();
    return combinedBank.filter((q) => {
      if (bankFilterTopic !== 'all' && q.topic !== bankFilterTopic) return false;
      if (qLower && !q.prompt.toLowerCase().includes(qLower) && !q.topicLabel.toLowerCase().includes(qLower)) {
        return false;
      }
      return true;
    });
  }, [bankFilterTopic, bankSearch, combinedBank]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredBank.length / pageSize));
  const safePage = Math.min(bankPage, totalPages);
  const pagedBank = filteredBank.slice((safePage - 1) * pageSize, safePage * pageSize);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <section className="bg-white border border-[#e4e9f2] rounded-2xl p-6 sm:p-8 shadow-[0_5px_18px_rgba(23,37,84,0.04)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e4e9f2]">
        <div>
          <p className="text-xs font-semibold text-[#3858d6]">
            Bank {combinedBank.length} Soal Terkurasi + Tes Diagnostik
          </p>
          <h2 className="text-2xl font-bold text-[#172554] mt-1">
            Tes Evaluasi & Bank 125+ Soal Eksponen
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#f5f7fb] border border-[#e4e9f2] rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setSubView('test')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              subView === 'test' ? 'bg-[#3858d6] text-white' : 'text-[#172554] hover:bg-[#e8ecf7]'
            }`}
          >
            Tes Evaluasi Mandiri
          </button>
          <button
            type="button"
            onClick={() => setSubView('bank')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              subView === 'bank' ? 'bg-[#3858d6] text-white' : 'text-[#172554] hover:bg-[#e8ecf7]'
            }`}
          >
            Jelajahi {combinedBank.length} Soal
          </button>
        </div>
      </div>

      {/* VIEW 1: TES MANDIRI */}
      {subView === 'test' && (
        <div className="mt-6">
          {!testActive && !testFinished && (
            <div className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-2">
                    1. Pilih Fokus Materi Tes
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setTestTopic('all')}
                      className={`text-left px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                        testTopic === 'all'
                          ? 'bg-[#3858d6] text-white border-[#3858d6]'
                          : 'bg-white text-[#172554] border-[#dce3f0] hover:bg-[#eef2ff]'
                      }`}
                    >
                      Semua Materi ({combinedBank.length} soal tersedia)
                    </button>
                    {(Object.keys(TOPIC_LABELS) as TopicKey[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTestTopic(key)}
                        className={`text-left px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                          testTopic === key
                            ? 'bg-[#3858d6] text-white border-[#3858d6]'
                            : 'bg-white text-[#172554] border-[#dce3f0] hover:bg-[#eef2ff]'
                        }`}
                      >
                        {TOPIC_LABELS[key]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#172554] mb-2">
                      2. Jumlah Soal Acak
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([10, 20, 30] as const).map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setTestCount(cnt)}
                          className={`py-2.5 rounded-xl border font-math text-sm font-bold cursor-pointer ${
                            testCount === cnt
                              ? 'bg-[#3858d6] text-white border-[#3858d6]'
                              : 'bg-white text-[#172554] border-[#dce3f0] hover:bg-[#eef2ff]'
                          }`}
                        >
                          {cnt} Soal
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-[#e4e9f2] rounded-xl p-4 text-xs text-[#42506b] space-y-1.5">
                    <div className="font-bold text-[#172554]">Diagnosis Otomatis Setelah Tes:</div>
                    <p>
                      Sistem akan mengacak soal baru dari bank {combinedBank.length}+ soal dan menganalisis apakah kamu masih terjebak pada syarat basis (a = 1, a = 0, a = -1).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={startTest}
                    className="w-full py-3 rounded-xl bg-[#16865b] text-white text-sm font-semibold hover:brightness-95 transition-colors cursor-pointer"
                  >
                    Mulai Tes Sekarang
                  </button>
                </div>
              </div>
            </div>
          )}

          {testActive && testQuestions[testIndex] && (
            <div className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-[#172554] tabular-nums">
                <span>
                  Soal {testIndex + 1} dari {testQuestions.length} · {testQuestions[testIndex].topicLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-[#3858d6]" aria-hidden="true" />
                  {formatTimer(secondsElapsed)}
                </span>
              </div>

              {/* Number Navigator */}
              <div className="flex flex-wrap gap-1.5">
                {testQuestions.map((q, i) => {
                  const answered = typeof testAnswers[q.id] === 'number';
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setTestIndex(i)}
                      className={`w-8 h-8 rounded-lg border font-math text-xs font-bold cursor-pointer ${
                        i === testIndex
                          ? 'bg-[#3858d6] text-white border-[#3858d6]'
                          : answered
                          ? 'bg-[#e1f8f4] text-[#172554] border-[#16865b]'
                          : 'bg-white text-[#5a657a] border-[#dce3f0]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="bg-white border border-[#e4e9f2] rounded-xl p-5">
                <h3 className="text-lg font-bold text-[#172554]">
                  <InlineMathText text={testQuestions[testIndex].prompt} />
                </h3>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {testQuestions[testIndex].options.map((opt, oIdx) => {
                    const chosen = testAnswers[testQuestions[testIndex].id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() =>
                          setTestAnswers((prev) => ({
                            ...prev,
                            [testQuestions[testIndex].id]: oIdx,
                          }))
                        }
                        className={`text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer flex items-center gap-3 ${
                          chosen
                            ? 'bg-[#eef2ff] border-[#3858d6] text-[#172554] font-semibold'
                            : 'bg-[#f8faff] border-[#dce3f0] text-[#172554] hover:bg-[#eef2ff]'
                        }`}
                      >
                        <span className="font-math text-xs font-bold w-6 h-6 rounded-md bg-white border border-[#dce3f0] flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="font-math text-sm">
                          <InlineMathText text={opt} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={testIndex === 0}
                    onClick={() => setTestIndex((i) => Math.max(0, i - 1))}
                    className="px-4 py-2 rounded-xl bg-white border border-[#dce3f0] text-xs font-semibold text-[#172554] disabled:opacity-40 cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  {testIndex < testQuestions.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setTestIndex((i) => i + 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3858d6] text-white text-xs font-semibold cursor-pointer"
                    >
                      Berikutnya
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={finishTest}
                  className="px-5 py-2 rounded-xl bg-[#16865b] text-white text-xs font-semibold hover:brightness-95 cursor-pointer"
                >
                  Selesai & Nilai Tes ({Object.keys(testAnswers).length}/{testQuestions.length})
                </button>
              </div>
            </div>
          )}

          {testFinished && testReport && (
            <div className="space-y-5">
              <div className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-semibold text-[#5a657a]">
                    Hasil Tes Mandiri · Waktu {formatTimer(secondsElapsed)}
                  </div>
                  <div className="mt-1 font-math text-4xl font-bold text-[#172554] tabular-nums">
                    Nilai: {testReport.scorePct}
                    <span className="text-base font-normal text-[#5a657a] ml-2">
                      ({testReport.correct}/{testReport.total} benar)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={startTest}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3858d6] text-white text-xs font-semibold hover:bg-[#2d49b8] cursor-pointer self-start"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Ulangi Tes dengan Soal Acak Baru
                </button>
              </div>

              {testReport.basisWeak && (
                <div className="bg-[#fffbeb] border border-[#f5d0a9] rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-sm text-[#7c2d12]">
                    <strong>Rekomendasi Belajar:</strong> Masih ada kesalahan pada topik{' '}
                    <strong>Syarat Basis & Kesamaan Pangkat</strong>. Coba kembali Alat Peraga Timbangan Basis untuk menguji kapan a = 1, 0, dan -1 membuat pangkat tidak harus sama.
                  </div>
                </div>
              )}

              {/* Topic Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {testReport.byTopic.map(([key, stat]) => {
                  const pct = Math.round((stat.correct / stat.total) * 100);
                  return (
                    <div key={key} className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-xl p-4">
                      <div className="text-xs font-semibold text-[#5a657a]">{stat.label}</div>
                      <div className="mt-1 font-math text-lg font-bold text-[#172554] tabular-nums">
                        {stat.correct}/{stat.total} ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pembahasan Lengkap */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#172554]">Pembahasan Jawaban</h3>
                {testQuestions.map((q, i) => {
                  const chosen = testAnswers[q.id];
                  const isRight = chosen === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className={`rounded-xl border p-4 space-y-2 ${
                        isRight ? 'bg-[#f4fbf8] border-[#c8eadc]' : 'bg-[#fff1f2] border-[#fecdd3]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-bold text-[#172554]">
                          {i + 1}. <InlineMathText text={q.prompt} />
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold shrink-0 ${
                            isRight ? 'text-[#16865b]' : 'text-[#be123c]'
                          }`}
                        >
                          {isRight ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Benar
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" aria-hidden="true" /> Salah
                            </>
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-[#42506b]">
                        Kunci: <strong className="font-math text-[#172554]"><InlineMathText text={q.options[q.correctIndex]} /></strong>
                        {typeof chosen === 'number' && !isRight && (
                          <> · Jawabanmu: <span className="font-math"><InlineMathText text={q.options[chosen]} /></span></>
                        )}
                      </div>
                      <ul className="text-xs text-[#172033] space-y-0.5 list-disc list-inside">
                        {q.steps.map((s, si) => (
                          <li key={si}>
                            <InlineMathText text={s} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: BANK 125+ SOAL */}
      {subView === 'bank' && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#f5f7fb] border border-[#e4e9f2] rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setBankFilterTopic('all');
                  setBankPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  bankFilterTopic === 'all' ? 'bg-[#3858d6] text-white' : 'bg-white border border-[#dce3f0] text-[#172554]'
                }`}
              >
                Semua ({combinedBank.length})
              </button>
              {(Object.keys(TOPIC_LABELS) as TopicKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setBankFilterTopic(key);
                    setBankPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    bankFilterTopic === key ? 'bg-[#3858d6] text-white' : 'bg-white border border-[#dce3f0] text-[#172554]'
                  }`}
                >
                  {TOPIC_LABELS[key]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-[#5a657a] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => {
                    setBankSearch(e.target.value);
                    setBankPage(1);
                  }}
                  placeholder="Cari soal..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#dce3f0] text-xs text-[#172554] focus:outline-2 focus:outline-[#3858d6]"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setDynamicPracticeList((prev) => [...generateDynamicRaceQuestions(10), ...prev])
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16865b] text-white text-xs font-semibold hover:brightness-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                +10 Soal Acak Baru
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {pagedBank.map((q) => {
              const isOpen = expandedQuestionId === q.id;
              const picked = quickAttempt[q.id];
              return (
                <div
                  key={q.id}
                  className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-semibold text-[#5a657a]">
                        {q.id} · {q.topicLabel} · Tingkat {q.difficulty}
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#172554]">
                        <InlineMathText text={q.prompt} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedQuestionId(isOpen ? null : q.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#3858d6] hover:underline cursor-pointer shrink-0"
                    >
                      {isOpen ? (
                        <>
                          Tutup <ChevronUp className="w-4 h-4" aria-hidden="true" />
                        </>
                      ) : (
                        <>
                          Latih & Bahas <ChevronDown className="w-4 h-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="pt-2 border-t border-[#e4e9f2] space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, idx) => {
                          const hasPicked = typeof picked === 'number';
                          const isThis = picked === idx;
                          const isKey = idx === q.correctIndex;
                          let cls = 'bg-white border-[#dce3f0] text-[#172554] hover:bg-[#eef2ff]';
                          if (hasPicked) {
                            if (isKey) cls = 'bg-[#f4fbf8] border-[#16865b] text-[#16865b] font-semibold';
                            else if (isThis) cls = 'bg-[#fff1f2] border-[#be123c] text-[#be123c]';
                          }
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setQuickAttempt((p) => ({ ...p, [q.id]: idx }))}
                              className={`text-left px-3 py-2 rounded-lg border text-xs font-math cursor-pointer ${cls}`}
                            >
                              {String.fromCharCode(65 + idx)}. <InlineMathText text={opt} />
                            </button>
                          );
                        })}
                      </div>

                      {typeof picked === 'number' && (
                        <div className="bg-white border border-[#e4e9f2] rounded-lg p-3 text-xs text-[#172033] space-y-1">
                          <div className="font-bold text-[#172554]">Pembahasan:</div>
                          {q.steps.map((s, si) => (
                            <div key={si}>
                              • <InlineMathText text={s} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#5a657a] tabular-nums">
            <span>
              Menampilkan {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredBank.length)} dari {filteredBank.length} soal
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setBankPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-[#f5f7fb] border border-[#dce3f0] font-semibold text-[#172554] disabled:opacity-40 cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="font-math font-semibold text-[#172554]">
                Hal {safePage}/{totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setBankPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-[#f5f7fb] border border-[#dce3f0] font-semibold text-[#172554] disabled:opacity-40 cursor-pointer"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
