import React, { useState } from 'react';
import { ArrowRight, Play, RotateCcw } from 'lucide-react';
import { formatIdNumber } from '../utils/mathFormat';

type AnatomyPart = 'base' | 'exponent' | 'result';
type ContextId = 'bacteria' | 'paper' | 'decay';

interface ConceptHeroProps {
  onOpenLab: (presetBase?: number, presetExp?: number) => void;
  onOpenMissions: () => void;
}

const ANATOMY_INFO: Record<
  AnatomyPart,
  { title: string; symbol: string; summary: string; example: string }
> = {
  base: {
    title: 'Bilangan Pokok (Basis)',
    symbol: 'a',
    summary:
      'Bilangan yang dikalikan secara berulang. Nilai basis menentukan apakah pola bertumbuh (a > 1) atau meluruh (0 < a < 1).',
    example: 'Pada 2⁴, angka 2 adalah bilangan pokok yang terus dikalikan.',
  },
  exponent: {
    title: 'Eksponen (Pangkat)',
    symbol: 'n',
    summary:
      'Menunjukkan berapa kali bilangan pokok muncul sebagai faktor perkalian. Jika n = 0 (untuk a ≠ 0), hasilnya selalu 1.',
    example: 'Pada 2⁴, pangkat 4 berarti ada empat faktor: 2 × 2 × 2 × 2.',
  },
  result: {
    title: 'Hasil Perpangkatan',
    symbol: 'aⁿ',
    summary:
      'Nilai akhir dari perkalian berulang atau kebalikan pecahannya. Pertumbuhan eksponensial meningkat jauh lebih cepat daripada penjumlahan.',
    example: '2⁴ = 16, sedangkan perkalian biasa 2 × 4 hanya menghasilkan 8.',
  },
};

const REAL_CONTEXTS: Array<{
  id: ContextId;
  title: string;
  formulaLabel: string;
  unit: string;
  stepUnit: string;
  base: number;
  initial: number;
  maxStep: number;
  description: string;
}> = [
  {
    id: 'bacteria',
    title: 'Pembelahan Sel Bakteri',
    formulaLabel: 'N(t) = 1 × 2ᵗ',
    unit: 'sel',
    stepUnit: 'fase pembelahan',
    base: 2,
    initial: 1,
    maxStep: 8,
    description:
      'Satu sel membelah menjadi dua di setiap fase. Pada fase ke-8 jumlahnya mencapai 256 sel.',
  },
  {
    id: 'paper',
    title: 'Lipatan Kertas Berlapis',
    formulaLabel: 'L(n) = 1 × 2ⁿ',
    unit: 'lapisan',
    stepUnit: 'lipatan',
    base: 2,
    initial: 1,
    maxStep: 7,
    description:
      'Setiap kali kertas dilipat dua, jumlah lapisannya menjadi dua kali lipat dari sebelumnya.',
  },
  {
    id: 'decay',
    title: 'Peluruhan Massa Zat',
    formulaLabel: 'M(t) = 64 × (½)ᵗ',
    unit: 'gram',
    stepUnit: 'waktu paruh',
    base: 0.5,
    initial: 64,
    maxStep: 6,
    description:
      'Basis pecahan antara 0 dan 1 membuat nilai berkurang setengahnya secara teratur tanpa menyentuh nol.',
  },
];

export const ConceptHero: React.FC<ConceptHeroProps> = ({
  onOpenLab,
  onOpenMissions,
}) => {
  const [selectedPart, setSelectedPart] = useState<AnatomyPart>('exponent');
  const [activeContext, setActiveContext] = useState<ContextId>('bacteria');
  const [contextStep, setContextStep] = useState<number>(4);

  const anatomy = ANATOMY_INFO[selectedPart];
  const currentCtx = REAL_CONTEXTS.find((c) => c.id === activeContext) ?? REAL_CONTEXTS[0];
  const safeStep = Math.min(contextStep, currentCtx.maxStep);
  const currentValue = currentCtx.initial * Math.pow(currentCtx.base, safeStep);

  return (
    <section className="space-y-8">
      {/* Main Editorial Hero Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-gradient-to-br from-[#e1f8f4] via-[#eef4ff] to-[#ffffff] border border-[#dce4f3] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#3858d6] mb-3">
              Matematika Fase E · Bilangan Berpangkat & Pertumbuhan
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.15] text-[#172554] max-w-2xl">
              Pahami eksponen sebagai mesin pengali berulang, bukan sekadar hafalan rumus.
            </h1>
            <p className="mt-4 text-base text-[#42506b] max-w-xl leading-relaxed">
              Eksponen meringkas perkalian bilangan yang sama secara ringkas. Jelajahi anatomi
              pangkat, uji sifat aljabarnya di laboratorium visual, lalu selesaikan tiga misi
              tantangan.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenLab(2, 4)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3858d6] text-white font-semibold text-sm hover:bg-[#2d49b8] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172554]"
            >
              Buka Laboratorium Eksponen
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onOpenMissions}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#d6deee] text-[#172554] font-semibold text-sm hover:bg-[#f8faff] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172554]"
            >
              Langsung ke Misi Latihan
            </button>
          </div>
        </div>

        {/* Interactive Formula Anatomy Stage */}
        <div className="lg:col-span-5 bg-white border border-[#e4e9f2] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_5px_18px_rgba(23,37,84,0.04)]">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-[#172554]">
                Anatomi Bentuk Pangkat
              </h2>
              <span className="text-xs text-[#5a657a]">Klik bagian rumus</span>
            </div>

            {/* Clickable interactive formula */}
            <div className="py-6 px-4 rounded-xl bg-[#f5f7fb] border border-[#e4e9f2] flex items-center justify-center gap-3 select-none">
              <div className="font-math inline-flex items-baseline text-5xl sm:text-6xl font-bold tabular-nums">
                <button
                  type="button"
                  onClick={() => setSelectedPart('base')}
                  aria-pressed={selectedPart === 'base'}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#172554] ${
                    selectedPart === 'base'
                      ? 'bg-[#3858d6] text-white shadow-sm'
                      : 'text-[#172554] hover:bg-[#e8ecf7]'
                  }`}
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPart('exponent')}
                  aria-pressed={selectedPart === 'exponent'}
                  className={`-translate-y-5 ml-1 px-2 py-0.5 rounded-lg text-2xl sm:text-3xl transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#172554] ${
                    selectedPart === 'exponent'
                      ? 'bg-[#16865b] text-white shadow-sm'
                      : 'bg-[#b9f1ea] text-[#172554] hover:brightness-95'
                  }`}
                >
                  4
                </button>
              </div>
              <span className="font-math text-3xl sm:text-4xl text-[#5a657a] mx-1">=</span>
              <button
                type="button"
                onClick={() => setSelectedPart('result')}
                aria-pressed={selectedPart === 'result'}
                className={`font-math text-4xl sm:text-5xl font-bold tabular-nums px-3 py-1 rounded-xl transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#172554] ${
                  selectedPart === 'result'
                    ? 'bg-[#172554] text-white shadow-sm'
                    : 'text-[#3858d6] hover:bg-[#e8ecf7]'
                }`}
              >
                16
              </button>
            </div>
          </div>

          {/* Explanation area */}
          <div className="mt-5 pt-5 border-t border-[#e4e9f2]">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-base font-semibold text-[#172554]">{anatomy.title}</h3>
              <span className="font-math text-sm font-semibold text-[#3858d6]">
                Simbol: {anatomy.symbol}
              </span>
            </div>
            <p className="mt-2 text-sm text-[#42506b] leading-relaxed">{anatomy.summary}</p>
            <p className="mt-2 text-xs font-medium text-[#172554] bg-[#f5f7fb] px-3 py-2 rounded-lg border border-[#e4e9f2]">
              {anatomy.example}
            </p>
          </div>
        </div>
      </div>

      {/* Real-World Exponential Context Simulator */}
      <div className="bg-white border border-[#e4e9f2] rounded-2xl p-6 sm:p-7 shadow-[0_5px_18px_rgba(23,37,84,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#e4e9f2]">
          <div>
            <h2 className="text-xl font-semibold text-[#172554]">
              Eksponen di Dunia Nyata
            </h2>
            <p className="text-sm text-[#5a657a] mt-1">
              Pilih fenomena untuk melihat bagaimana pangkat menggerakkan pertumbuhan atau peluruhan.
            </p>
          </div>

          {/* Interactive segmented filter */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f5f7fb] border border-[#e4e9f2] rounded-xl">
            {REAL_CONTEXTS.map((ctx) => {
              const active = ctx.id === activeContext;
              return (
                <button
                  key={ctx.id}
                  type="button"
                  onClick={() => {
                    setActiveContext(ctx.id);
                    setContextStep(Math.min(4, ctx.maxStep));
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#3858d6] text-white'
                      : 'text-[#172554] hover:bg-[#e8ecf7]'
                  }`}
                >
                  {ctx.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-math text-sm font-semibold text-[#3858d6]">
                Model: {currentCtx.formulaLabel}
              </span>
              <span className="text-xs text-[#5a657a] tabular-nums">
                Langkah: {safeStep} {currentCtx.stepUnit}
              </span>
            </div>

            <p className="text-sm text-[#42506b] leading-relaxed">{currentCtx.description}</p>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#172554] mb-2">
                <label htmlFor="context-step-slider">
                  Atur {currentCtx.stepUnit}
                </label>
                <span className="font-math tabular-nums text-[#3858d6]">
                  n = {safeStep}
                </span>
              </div>
              <input
                id="context-step-slider"
                type="range"
                min={0}
                max={currentCtx.maxStep}
                step={1}
                value={safeStep}
                onChange={(e) => setContextStep(Number(e.target.value))}
                className="edu-slider"
              />
              <div className="flex justify-between text-[11px] font-math text-[#5a657a] mt-1 tabular-nums">
                <span>0</span>
                <span>{Math.floor(currentCtx.maxStep / 2)}</span>
                <span>{currentCtx.maxStep}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setContextStep((prev) => (prev < currentCtx.maxStep ? prev + 1 : 0))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8ecf7] text-[#172554] text-xs font-semibold hover:bg-[#dce3f5] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  Tambah 1 Langkah
                </button>
                <button
                  type="button"
                  onClick={() => setContextStep(0)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f5f7fb] border border-[#e4e9f2] text-[#5a657a] text-xs font-semibold hover:text-[#172554] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Reset
                </button>
              </div>
              <button
                type="button"
                onClick={() => onOpenLab(currentCtx.base, safeStep)}
                className="text-xs font-semibold text-[#3858d6] hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Simulasikan di Lab
              </button>
            </div>
          </div>

          {/* Visual Bar Progression */}
          <div className="lg:col-span-7 bg-[#f5f7fb] border border-[#e4e9f2] rounded-xl p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <span className="text-xs font-semibold text-[#5a657a]">
                Hasil pada langkah ke-{safeStep}
              </span>
              <span className="font-math text-2xl font-bold text-[#172554] tabular-nums">
                {formatIdNumber(currentValue, 4)} {currentCtx.unit}
              </span>
            </div>

            <div className="grid grid-cols-9 gap-2 items-end h-36 pt-4">
              {Array.from({ length: currentCtx.maxStep + 1 }, (_, i) => {
                const stepVal = currentCtx.initial * Math.pow(currentCtx.base, i);
                const maxVal =
                  currentCtx.base >= 1
                    ? currentCtx.initial * Math.pow(currentCtx.base, currentCtx.maxStep)
                    : currentCtx.initial;
                const ratio = Math.max(0.06, stepVal / maxVal);
                const isSelected = i === safeStep;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setContextStep(i)}
                    aria-label={`Langkah ${i}: ${formatIdNumber(stepVal)} ${currentCtx.unit}`}
                    className="group flex flex-col items-center justify-end h-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#172554] rounded"
                  >
                    <div
                      style={{ height: `${Math.round(ratio * 100)}%` }}
                      className={`w-full rounded-t-md transition-all ${
                        isSelected
                          ? 'bg-[#3858d6]'
                          : i < safeStep
                          ? 'bg-[#94aae8]'
                          : 'bg-[#dce3f2] group-hover:bg-[#b8c6ea]'
                      }`}
                    />
                    <span
                      className={`mt-1.5 font-math text-[11px] tabular-nums ${
                        isSelected ? 'font-bold text-[#3858d6]' : 'text-[#5a657a]'
                      }`}
                    >
                      {i}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
