import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Heart, Play, RotateCcw, Timer, Trophy, XCircle } from 'lucide-react';
import { InlineMathText } from './MathExpr';

type GameMode = 'detective' | 'target';

type VerdictKey = 'same-exp' | 'basis-exception' | 'diff-basis-zero' | 'invalid';

interface DetectivePrompt {
  id: string;
  equation: string;
  correctVerdict: VerdictKey;
  explanation: string;
}

const VERDICT_OPTIONS: Array<{ key: VerdictKey; label: string; shortDesc: string }> = [
  {
    key: 'same-exp',
    label: 'Pasti m = n',
    shortDesc: 'Basis konstanta a > 0, a ≠ 1',
  },
  {
    key: 'basis-exception',
    label: 'Jebakan Syarat Basis',
    shortDesc: 'Basis 1, 0, -1 atau h(x) perlu uji kasus',
  },
  {
    key: 'diff-basis-zero',
    label: 'Basis Beda → Pangkat = 0',
    shortDesc: 'a^f(x) = b^f(x) dengan a ≠ b',
  },
  {
    key: 'invalid',
    label: 'Tak Terdefinisi',
    shortDesc: '0⁰ atau pembagian dengan nol',
  },
];

function createDetectiveRound(): DetectivePrompt[] {
  const pool: DetectivePrompt[] = [
    {
      id: 'd1',
      equation: '1^(2x + 3) = 1^(x - 5)',
      correctVerdict: 'basis-exception',
      explanation: 'Basisnya 1, sehingga semua x real memenuhi tanpa harus 2x + 3 = x - 5.',
    },
    {
      id: 'd2',
      equation: '2^(3x - 1) = 2^(x + 7)',
      correctVerdict: 'same-exp',
      explanation: 'Basis 2 memenuhi a > 0 dan a ≠ 1, maka pasti 3x - 1 = x + 7.',
    },
    {
      id: 'd3',
      equation: '3^(x - 4) = 7^(x - 4)',
      correctVerdict: 'diff-basis-zero',
      explanation: 'Basis 3 dan 7 berbeda (> 0, ≠ 1), sehingga satu-satunya solusi adalah x - 4 = 0.',
    },
    {
      id: 'd4',
      equation: '0^(x - 2) = 0^(-3)',
      correctVerdict: 'invalid',
      explanation: '0^(-3) = 1/0^3 yang tak terdefinisi karena membagi dengan nol.',
    },
    {
      id: 'd5',
      equation: '(-1)^(2x) = (-1)^6',
      correctVerdict: 'basis-exception',
      explanation: 'Basis -1 memiliki pangkat sama-sama genap, jadi tidak harus 2x = 6.',
    },
    {
      id: 'd6',
      equation: '(0,5)^(x + 2) = (0,5)^5',
      correctVerdict: 'same-exp',
      explanation: 'Basis 0,5 memenuhi 0 < a < 1 (injektif), maka pasti x + 2 = 5.',
    },
    {
      id: 'd7',
      equation: '(x - 2)^(x + 1) = (x - 2)^4',
      correctVerdict: 'basis-exception',
      explanation: 'Basis mengandung variabel x, wajib uji 4 kasus (f=g, h=1, h=0, h=-1).',
    },
    {
      id: 'd8',
      equation: '5^(2x - 6) = 11^(2x - 6)',
      correctVerdict: 'diff-basis-zero',
      explanation: 'Basis berbeda positif ≠ 1 → pangkatnya harus nol (2x - 6 = 0).',
    },
    {
      id: 'd9',
      equation: '0^0 = 0^3',
      correctVerdict: 'invalid',
      explanation: 'Bentuk 0^0 tak tentu sehingga tidak bisa diselesaikan seperti biasa.',
    },
    {
      id: 'd10',
      equation: '10^(x^2 - 1) = 10^8',
      correctVerdict: 'same-exp',
      explanation: 'Basis 10 > 0 dan ≠ 1, maka langsung berlaku x^2 - 1 = 8.',
    },
    {
      id: 'd11',
      equation: '0^4 = 0^9',
      correctVerdict: 'basis-exception',
      explanation: 'Kedua ruas bernilai 0 = 0 meskipun 4 ≠ 9 karena basisnya 0 dengan pangkat > 0.',
    },
    {
      id: 'd12',
      equation: '4^(x - 1) = 9^(x - 1)',
      correctVerdict: 'diff-basis-zero',
      explanation: 'Basis 4 dan 9 berbeda (> 0, ≠ 1), sehingga x - 1 = 0 ⇒ x = 1.',
    },
  ];
  return [...pool].sort(() => Math.random() - 0.5);
}

interface PowerCard {
  id: string;
  label: string;
  value: number;
}

interface TargetPuzzle {
  target: number;
  cards: PowerCard[];
  hint: string;
}

function generateTargetPuzzle(): TargetPuzzle {
  const pool: PowerCard[] = [
    { id: 'c1', label: '2^3', value: 8 },
    { id: 'c2', label: '3^2', value: 9 },
    { id: 'c3', label: '5^0', value: 1 },
    { id: 'c4', label: '2^4', value: 16 },
    { id: 'c5', label: '(-2)^2', value: 4 },
    { id: 'c6', label: '3^3', value: 27 },
    { id: 'c7', label: '4^2', value: 16 },
    { id: 'c8', label: '(1/2)^(-1)', value: 2 },
    { id: 'c9', label: '2^5', value: 32 },
    { id: 'c10', label: '(-3)^2', value: 9 },
  ];
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
  const a = shuffled[0];
  const b = shuffled[1];
  const useMultiply = Math.random() > 0.55;
  const target = useMultiply ? a.value * b.value : a.value + b.value;
  return {
    target,
    cards: shuffled,
    hint: useMultiply
      ? `Coba kalikan dua kartu yang bernilai ${a.value} dan ${b.value}.`
      : `Coba jumlahkan dua kartu yang bernilai ${a.value} dan ${b.value}.`,
  };
}

export const BasisGame: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('detective');

  // Game 1: Detective state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [deck, setDeck] = useState<DetectivePrompt[]>(() => createDetectiveRound());
  const [idx, setIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [lastFeedback, setLastFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);

  // Game 2: Target Builder state
  const [puzzle, setPuzzle] = useState<TargetPuzzle>(() => generateTargetPuzzle());
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [op, setOp] = useState<'+' | '×'>('+');
  const [puzzleScore, setPuzzleScore] = useState<number>(0);
  const [puzzleMsg, setPuzzleMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!isPlaying || gameMode !== 'detective') return;
    if (timeLeft <= 0 || lives <= 0) {
      setIsPlaying(false);
      setBestScore((prev) => Math.max(prev, score));
      return;
    }
    const t = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [isPlaying, gameMode, timeLeft, lives, score]);

  const startDetective = () => {
    setDeck(createDetectiveRound());
    setIdx(0);
    setScore(0);
    setLives(3);
    setCombo(0);
    setTimeLeft(60);
    setLastFeedback(null);
    setIsPlaying(true);
  };

  const currentPrompt = deck[idx % deck.length];

  const handleDetectivePick = (choice: VerdictKey) => {
    if (!isPlaying) return;
    const isCorrect = choice === currentPrompt.correctVerdict;
    if (isCorrect) {
      const nextCombo = combo + 1;
      const gained = 100 + Math.min(100, (nextCombo - 1) * 25);
      setCombo(nextCombo);
      setScore((s) => s + gained);
      setLastFeedback({
        correct: true,
        message: `Tepat (+${gained} poin): ${currentPrompt.explanation}`,
      });
    } else {
      setCombo(0);
      setLives((l) => Math.max(0, l - 1));
      setLastFeedback({
        correct: false,
        message: `Kurang tepat: ${currentPrompt.explanation}`,
      });
    }

    if (idx + 1 >= deck.length) {
      setDeck(createDetectiveRound());
      setIdx(0);
    } else {
      setIdx((i) => i + 1);
    }
  };

  // Target Builder computations
  const chosenCardObjects = useMemo(
    () => selectedCards.map((id) => puzzle.cards.find((c) => c.id === id)).filter(Boolean) as PowerCard[],
    [puzzle.cards, selectedCards]
  );

  const currentBuildValue = useMemo(() => {
    if (chosenCardObjects.length === 0) return 0;
    if (chosenCardObjects.length === 1) return chosenCardObjects[0].value;
    return op === '+'
      ? chosenCardObjects.reduce((acc, c) => acc + c.value, 0)
      : chosenCardObjects.reduce((acc, c) => acc * c.value, 1);
  }, [chosenCardObjects, op]);

  const toggleCard = (id: string) => {
    setPuzzleMsg(null);
    setSelectedCards((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const checkTargetMatch = () => {
    if (chosenCardObjects.length < 2) {
      setPuzzleMsg({ ok: false, text: 'Pilih 2 kartu eksponen terlebih dahulu.' });
      return;
    }
    if (currentBuildValue === puzzle.target) {
      setPuzzleScore((s) => s + 100);
      setPuzzleMsg({
        ok: true,
        text: `Berhasil! ${chosenCardObjects[0].label} ${op} ${chosenCardObjects[1].label} = ${puzzle.target}.`,
      });
      window.setTimeout(() => {
        setPuzzle(generateTargetPuzzle());
        setSelectedCards([]);
        setPuzzleMsg(null);
      }, 1300);
    } else {
      setPuzzleMsg({
        ok: false,
        text: `Hasilmu ${currentBuildValue}, targetnya ${puzzle.target}. ${puzzle.hint}`,
      });
    }
  };

  return (
    <section className="bg-white border border-[#e4e9f2] rounded-2xl p-6 sm:p-8 shadow-[0_5px_18px_rgba(23,37,84,0.04)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e4e9f2]">
        <div>
          <p className="text-xs font-semibold text-[#3858d6]">
            Permainan Edukatif · Latih Ketajaman Syarat Basis & Hitung Cepat
          </p>
          <h2 className="text-2xl font-bold text-[#172554] mt-1">
            Arena Permainan Eksponen
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#f5f7fb] border border-[#e4e9f2] rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setGameMode('detective')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              gameMode === 'detective' ? 'bg-[#3858d6] text-white' : 'text-[#172554] hover:bg-[#e8ecf7]'
            }`}
          >
            Detektif Syarat Basis
          </button>
          <button
            type="button"
            onClick={() => setGameMode('target')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              gameMode === 'target' ? 'bg-[#3858d6] text-white' : 'text-[#172554] hover:bg-[#e8ecf7]'
            }`}
          >
            Rakit Target Pangkat
          </button>
        </div>
      </div>

      {/* GAME 1: DETEKTIF SYARAT BASIS */}
      {gameMode === 'detective' && (
        <div className="mt-6 space-y-5">
          {/* Status bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f5f7fb] border border-[#e4e9f2] rounded-xl px-4 py-3 text-xs font-semibold text-[#172554] tabular-nums">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#3858d6]" aria-hidden="true" />
                Skor: {score}
              </span>
              <span>Kombo: {combo}x</span>
              <span>Rekor: {Math.max(bestScore, score)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 text-[#be123c]">
                <Heart className="w-4 h-4 fill-[#be123c]" aria-hidden="true" />
                Nyawa: {lives}/3
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#172554]">
                <Timer className="w-4 h-4 text-[#3858d6]" aria-hidden="true" />
                {timeLeft} detik
              </span>
            </div>
          </div>

          {!isPlaying ? (
            <div className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-8 text-center space-y-4">
              <h3 className="text-xl font-bold text-[#172554]">
                {lives <= 0 || timeLeft <= 0
                  ? `Permainan Selesai — Skor Akhir: ${score}`
                  : 'Siap Menguji Ketelitian Syarat Basis?'}
              </h3>
              <p className="text-sm text-[#42506b] max-w-lg mx-auto">
                Kamu punya 60 detik dan 3 nyawa. Klasifikasikan setiap persamaan eksponen: apakah aman langsung menyamakan pangkat, atau ada jebakan basis 1, 0, -1, maupun basis berbeda!
              </p>
              <button
                type="button"
                onClick={startDetective}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3858d6] text-white text-sm font-semibold hover:bg-[#2d49b8] transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" aria-hidden="true" />
                {lives <= 0 || timeLeft <= 0 ? 'Main Lagi' : 'Mulai Permainan'}
              </button>
            </div>
          ) : (
            <div className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-6 space-y-5">
              <div className="text-center py-4 bg-white border border-[#e4e9f2] rounded-xl">
                <div className="text-xs font-semibold text-[#5a657a]">
                  Analisis Persamaan Berikut:
                </div>
                <div className="mt-2 font-math text-2xl sm:text-3xl font-bold text-[#172554]">
                  <InlineMathText text={currentPrompt.equation} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VERDICT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleDetectivePick(opt.key)}
                    className="text-left p-4 rounded-xl bg-white border border-[#dce3f0] hover:border-[#3858d6] hover:bg-[#eef2ff] transition-colors cursor-pointer"
                  >
                    <div className="text-sm font-bold text-[#172554]">{opt.label}</div>
                    <div className="text-xs text-[#5a657a] mt-0.5">{opt.shortDesc}</div>
                  </button>
                ))}
              </div>

              {lastFeedback && (
                <div
                  className={`rounded-xl border px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
                    lastFeedback.correct
                      ? 'bg-[#f4fbf8] border-[#c8eadc] text-[#16865b]'
                      : 'bg-[#fff1f2] border-[#fecdd3] text-[#be123c]'
                  }`}
                >
                  {lastFeedback.correct ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>{lastFeedback.message}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* GAME 2: RAKIT TARGET PANGKAT */}
      {gameMode === 'target' && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f5f7fb] border border-[#e4e9f2] rounded-xl px-4 py-3 text-xs font-semibold text-[#172554] tabular-nums">
            <span>Skor Rakit Pangkat: {puzzleScore}</span>
            <button
              type="button"
              onClick={() => {
                setPuzzle(generateTargetPuzzle());
                setSelectedCards([]);
                setPuzzleMsg(null);
              }}
              className="inline-flex items-center gap-1.5 text-[#3858d6] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Acak Target Baru
            </button>
          </div>

          <div className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e4e9f2] rounded-xl p-5">
              <div>
                <div className="text-xs font-semibold text-[#5a657a]">Target Nilai</div>
                <div className="font-math text-4xl font-bold text-[#3858d6] tabular-nums">
                  {puzzle.target}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#5a657a]">Operasi:</span>
                <button
                  type="button"
                  onClick={() => setOp('+')}
                  className={`px-3.5 py-1.5 rounded-lg font-math text-sm font-bold border cursor-pointer ${
                    op === '+'
                      ? 'bg-[#3858d6] text-white border-[#3858d6]'
                      : 'bg-[#f5f7fb] text-[#172554] border-[#dce3f0]'
                  }`}
                >
                  + (Tambah)
                </button>
                <button
                  type="button"
                  onClick={() => setOp('×')}
                  className={`px-3.5 py-1.5 rounded-lg font-math text-sm font-bold border cursor-pointer ${
                    op === '×'
                      ? 'bg-[#3858d6] text-white border-[#3858d6]'
                      : 'bg-[#f5f7fb] text-[#172554] border-[#dce3f0]'
                  }`}
                >
                  × (Kali)
                </button>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-[#5a657a]">Hasil Rakitmu</div>
                <div className="font-math text-2xl font-bold text-[#172554] tabular-nums">
                  {chosenCardObjects.length === 0
                    ? '—'
                    : chosenCardObjects.length === 1
                    ? `${chosenCardObjects[0].label} = ${currentBuildValue}`
                    : `${chosenCardObjects[0].label} ${op} ${chosenCardObjects[1].label} = ${currentBuildValue}`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {puzzle.cards.map((card) => {
                const picked = selectedCards.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => toggleCard(card.id)}
                    className={`py-4 px-3 rounded-xl border font-math text-lg font-bold transition-colors cursor-pointer ${
                      picked
                        ? 'bg-[#3858d6] text-white border-[#3858d6]'
                        : 'bg-white text-[#172554] border-[#dce3f0] hover:bg-[#eef2ff]'
                    }`}
                  >
                    <InlineMathText text={card.label} />
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={checkTargetMatch}
                className="px-5 py-2.5 rounded-xl bg-[#16865b] text-white text-sm font-semibold hover:brightness-95 transition-colors cursor-pointer"
              >
                Periksa Kombinasi
              </button>

              {puzzleMsg && (
                <div
                  className={`text-xs font-semibold flex items-center gap-1.5 ${
                    puzzleMsg.ok ? 'text-[#16865b]' : 'text-[#be123c]'
                  }`}
                >
                  {puzzleMsg.ok ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>{puzzleMsg.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
