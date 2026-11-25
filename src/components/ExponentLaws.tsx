import React, { useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { formatIdNumber } from '../utils/mathFormat';
import { InlineMathText } from './MathExpr';

type LawId =
  | 'product'
  | 'quotient'
  | 'power-of-power'
  | 'power-of-product'
  | 'power-of-fraction'
  | 'zero-negative'
  | 'fractional';

interface LawDefinition {
  id: LawId;
  indexLabel: string;
  name: string;
  formula: string;
  condition: string;
  summary: string;
}

const LAWS: LawDefinition[] = [
  {
    id: 'product',
    indexLabel: '01',
    name: 'Perkalian Basis Sama',
    formula: 'a^m × a^n = a^(m + n)',
    condition: 'Berlaku untuk semua a bilangan real dan m, n bilangan bulat.',
    summary: 'Menggabungkan faktor berulang dari basis yang sama berarti menjumlahkan banyak faktornya.',
  },
  {
    id: 'quotient',
    indexLabel: '02',
    name: 'Pembagian Basis Sama',
    formula: 'a^m ÷ a^n = a^(m - n)',
    condition: 'Syarat wajib: a ≠ 0 agar tidak terjadi pembagian dengan nol.',
    summary: 'Faktor yang sama pada pembilang dan penyebut saling menyederhanakan sehingga pangkat dikurangi.',
  },
  {
    id: 'power-of-power',
    indexLabel: '03',
    name: 'Pangkat dari Pangkat',
    formula: '(a^m)^n = a^(m × n)',
    condition: 'Pangkat bertingkat dengan tanda kurung.',
    summary: 'Kelompok a^m diulang sebanyak n kali, sehingga total faktornya adalah m × n.',
  },
  {
    id: 'power-of-product',
    indexLabel: '04',
    name: 'Pangkat dari Perkalian',
    formula: '(a × b)^n = a^n × b^n',
    condition: 'Hati-hati: sifat ini berlaku untuk perkalian, bukan penjumlahan (a + b)^n.',
    summary: 'Setiap faktor di dalam tanda kurung menerima eksponen n masing-masing.',
  },
  {
    id: 'power-of-fraction',
    indexLabel: '05',
    name: 'Pangkat dari Pecahan',
    formula: '(a / b)^n = a^n / b^n',
    condition: 'Syarat wajib: b ≠ 0.',
    summary: 'Pembilang dan penyebut masing-masing dipangkatkan dengan eksponen yang sama.',
  },
  {
    id: 'zero-negative',
    indexLabel: '06',
    name: 'Pangkat Nol & Negatif',
    formula: 'a^0 = 1 dan a^(-n) = 1 / a^n',
    condition: 'Syarat wajib: a ≠ 0.',
    summary: 'Mengurangi eksponen berarti membagi dengan basis; pangkat negatif memindahkan faktor ke penyebut.',
  },
  {
    id: 'fractional',
    indexLabel: '07',
    name: 'Pangkat Rasional (Akar)',
    formula: 'a^(m/n) = (ⁿ√a)^m',
    condition: 'Untuk akar pangkat genap (n genap), disyaratkan a ≥ 0.',
    summary: 'Penyebut pada eksponen pecahan menyatakan indeks akar, sedangkan pembilang adalah pangkatnya.',
  },
];

const MISCONCEPTIONS = [
  {
    id: 'sign',
    wrong: '-3^2 = 9',
    right: '-3^2 = -9, sedangkan (-3)^2 = 9',
    why: 'Tanpa tanda kurung, pangkat 2 hanya mengikat angka 3, bukan tanda negatifnya.',
  },
  {
    id: 'sum',
    wrong: '(2 + 3)^2 = 2^2 + 3^2',
    right: '(2 + 3)^2 = 5^2 = 25 (bukan 4 + 9 = 13)',
    why: 'Pangkat tidak bisa didistribusikan ke operasi penjumlahan atau pengurangan.',
  },
  {
    id: 'mult',
    wrong: '2^3 × 2^4 = 2^12 atau 4^7',
    right: '2^3 × 2^4 = 2^(3 + 4) = 2^7 = 128',
    why: 'Basis tetap sama (2) dan eksponen dijumlahkan, bukan dikalikan.',
  },
];

export const ExponentLaws: React.FC = () => {
  const [selectedLaw, setSelectedLaw] = useState<LawId>('product');
  const [paramA, setParamA] = useState<number>(2);
  const [paramB, setParamB] = useState<number>(3);
  const [paramM, setParamM] = useState<number>(3);
  const [paramN, setParamN] = useState<number>(2);
  const [showMisconceptions, setShowMisconceptions] = useState<boolean>(false);

  const activeLaw = LAWS.find((l) => l.id === selectedLaw) ?? LAWS[0];

  // Numerical side-by-side verification for the selected law
  const verification = useMemo(() => {
    switch (selectedLaw) {
      case 'product': {
        const leftA = Math.pow(paramA, paramM);
        const leftB = Math.pow(paramA, paramN);
        const leftVal = leftA * leftB;
        const rightVal = Math.pow(paramA, paramM + paramN);
        return {
          leftExpr: `${paramA}^${paramM} × ${paramA}^${paramN}`,
          leftBreakdown: `${formatIdNumber(leftA)} × ${formatIdNumber(leftB)} = ${formatIdNumber(leftVal)}`,
          rightExpr: `${paramA}^(${paramM} + ${paramN}) = ${paramA}^${paramM + paramN}`,
          rightBreakdown: `${formatIdNumber(rightVal)}`,
          equal: Math.abs(leftVal - rightVal) < 1e-9,
        };
      }
      case 'quotient': {
        const leftA = Math.pow(paramA, paramM);
        const leftB = Math.pow(paramA, paramN);
        const leftVal = leftA / leftB;
        const rightVal = Math.pow(paramA, paramM - paramN);
        return {
          leftExpr: `${paramA}^${paramM} ÷ ${paramA}^${paramN}`,
          leftBreakdown: `${formatIdNumber(leftA)} ÷ ${formatIdNumber(leftB)} = ${formatIdNumber(leftVal)}`,
          rightExpr: `${paramA}^(${paramM} - ${paramN}) = ${paramA}^${paramM - paramN}`,
          rightBreakdown: `${formatIdNumber(rightVal)}`,
          equal: Math.abs(leftVal - rightVal) < 1e-9,
        };
      }
      case 'power-of-power': {
        const inner = Math.pow(paramA, paramM);
        const leftVal = Math.pow(inner, paramN);
        const rightVal = Math.pow(paramA, paramM * paramN);
        return {
          leftExpr: `(${paramA}^${paramM})^${paramN}`,
          leftBreakdown: `(${formatIdNumber(inner)})^${paramN} = ${formatIdNumber(leftVal)}`,
          rightExpr: `${paramA}^(${paramM} × ${paramN}) = ${paramA}^${paramM * paramN}`,
          rightBreakdown: `${formatIdNumber(rightVal)}`,
          equal: Math.abs(leftVal - rightVal) < 1e-9,
        };
      }
      case 'power-of-product': {
        const leftVal = Math.pow(paramA * paramB, paramN);
        const rightVal = Math.pow(paramA, paramN) * Math.pow(paramB, paramN);
        return {
          leftExpr: `(${paramA} × ${paramB})^${paramN}`,
          leftBreakdown: `${paramA * paramB}^${paramN} = ${formatIdNumber(leftVal)}`,
          rightExpr: `${paramA}^${paramN} × ${paramB}^${paramN}`,
          rightBreakdown: `${formatIdNumber(Math.pow(paramA, paramN))} × ${formatIdNumber(Math.pow(paramB, paramN))} = ${formatIdNumber(rightVal)}`,
          equal: Math.abs(leftVal - rightVal) < 1e-9,
        };
      }
      case 'power-of-fraction': {
        const leftVal = Math.pow(paramA / paramB, paramN);
        const rightVal = Math.pow(paramA, paramN) / Math.pow(paramB, paramN);
        return {
          leftExpr: `(${paramA} / ${paramB})^${paramN}`,
          leftBreakdown: `${formatIdNumber(paramA / paramB, 3)}^${paramN} = ${formatIdNumber(leftVal, 4)}`,
          rightExpr: `${paramA}^${paramN} / ${paramB}^${paramN}`,
          rightBreakdown: `${formatIdNumber(Math.pow(paramA, paramN))} / ${formatIdNumber(Math.pow(paramB, paramN))} = ${formatIdNumber(rightVal, 4)}`,
          equal: Math.abs(leftVal - rightVal) < 1e-9,
        };
      }
      case 'zero-negative': {
        const negVal = Math.pow(paramA, -paramN);
        const fracVal = 1 / Math.pow(paramA, paramN);
        return {
          leftExpr: `${paramA}^(-${paramN})`,
          leftBreakdown: `${formatIdNumber(negVal, 5)}`,
          rightExpr: `1 / ${paramA}^${paramN}`,
          rightBreakdown: `1 / ${formatIdNumber(Math.pow(paramA, paramN))} = ${formatIdNumber(fracVal, 5)}`,
          equal: Math.abs(negVal - fracVal) < 1e-9,
        };
      }
      case 'fractional': {
        // Use clean perfect square / cube demo based on paramA
        const baseClean = paramA * paramA; // ensures integer square root
        const leftVal = Math.pow(baseClean, paramM / 2);
        const rightVal = Math.pow(Math.sqrt(baseClean), paramM);
        return {
          leftExpr: `${baseClean}^(${paramM}/2)`,
          leftBreakdown: `${formatIdNumber(leftVal)}`,
          rightExpr: `(√${baseClean})^${paramM} = ${paramA}^${paramM}`,
          rightBreakdown: `${formatIdNumber(rightVal)}`,
          equal: Math.abs(leftVal - rightVal) < 1e-9,
        };
      }
    }
  }, [paramA, paramB, paramM, paramN, selectedLaw]);

  return (
    <section className="space-y-6">
      <div className="bg-white border border-[#e4e9f2] rounded-2xl p-6 sm:p-8 shadow-[0_5px_18px_rgba(23,37,84,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e4e9f2]">
          <div>
            <h2 className="text-2xl font-bold text-[#172554]">
              7 Sifat Eksponen & Bukti Numerik
            </h2>
            <p className="text-sm text-[#5a657a] mt-1">
              Pilih salah satu aturan di sebelah kiri, lalu uji dengan angka untuk membuktikan kedua ruas selalu setara.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMisconceptions((prev) => !prev)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              showMisconceptions
                ? 'bg-[#172554] text-white border-[#172554]'
                : 'bg-[#f5f7fb] text-[#172554] border-[#dce3f0] hover:bg-[#e8ecf7]'
            }`}
          >
            {showMisconceptions ? 'Tutup Jebakan Umum' : 'Lihat Jebakan Umum'}
          </button>
        </div>

        {/* Toggleable Common Misconceptions Panel */}
        {showMisconceptions && (
          <div className="mt-6 bg-[#fffbeb] border border-[#f5d0a9] rounded-2xl p-5">
            <h3 className="text-base font-bold text-[#7c2d12] mb-3">
              Tiga Kesalahan Eksponen yang Sering Terjadi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MISCONCEPTIONS.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#f2dec1] rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#be123c]">
                    <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Keliru</span>
                  </div>
                  <div className="font-math text-sm text-[#be123c] line-through">
                    <InlineMathText text={item.wrong} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#16865b] pt-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Benar</span>
                  </div>
                  <div className="font-math text-sm font-semibold text-[#172554]">
                    <InlineMathText text={item.right} />
                  </div>
                  <p className="text-xs text-[#5a657a] pt-1 leading-relaxed">{item.why}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-column Law Selector + Proof Sandbox */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Law List */}
          <div className="lg:col-span-5 space-y-2">
            {LAWS.map((law) => {
              const active = law.id === selectedLaw;
              return (
                <button
                  key={law.id}
                  type="button"
                  onClick={() => setSelectedLaw(law.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                    active
                      ? 'bg-[#eef2ff] border-[#3858d6] text-[#172554]'
                      : 'bg-white border-[#e4e9f2] text-[#172554] hover:bg-[#f8faff]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#5a657a]">
                      {law.indexLabel}. {law.name}
                    </div>
                    <div className="font-math text-sm font-semibold text-[#172554] mt-0.5 truncate">
                      <InlineMathText text={law.formula} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Interactive Proof Sandbox */}
          <div className="lg:col-span-7 bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-5 sm:p-6 space-y-5">
            <div>
              <div className="text-xs font-semibold text-[#3858d6]">
                Sifat {activeLaw.indexLabel} · {activeLaw.name}
              </div>
              <div className="mt-2 font-math text-2xl sm:text-3xl font-bold text-[#172554]">
                <InlineMathText text={activeLaw.formula} />
              </div>
              <p className="mt-2 text-sm text-[#42506b] leading-relaxed">{activeLaw.summary}</p>
              <p className="mt-1.5 text-xs text-[#5a657a]">{activeLaw.condition}</p>
            </div>

            {/* Adjustable Variables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#e4e9f2]">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#172554] mb-1.5">
                  <label htmlFor="law-a">Nilai a</label>
                  <span className="font-math text-[#3858d6] tabular-nums">{paramA}</span>
                </div>
                <input
                  id="law-a"
                  type="range"
                  min={2}
                  max={10}
                  step={1}
                  value={paramA}
                  onChange={(e) => setParamA(Number(e.target.value))}
                  className="edu-slider"
                />
              </div>

              {(selectedLaw === 'power-of-product' || selectedLaw === 'power-of-fraction') && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#172554] mb-1.5">
                    <label htmlFor="law-b">Nilai b</label>
                    <span className="font-math text-[#3858d6] tabular-nums">{paramB}</span>
                  </div>
                  <input
                    id="law-b"
                    type="range"
                    min={2}
                    max={10}
                    step={1}
                    value={paramB}
                    onChange={(e) => setParamB(Number(e.target.value))}
                    className="edu-slider"
                  />
                </div>
              )}

              {(selectedLaw === 'product' ||
                selectedLaw === 'quotient' ||
                selectedLaw === 'power-of-power' ||
                selectedLaw === 'fractional') && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#172554] mb-1.5">
                    <label htmlFor="law-m">Pangkat m</label>
                    <span className="font-math text-[#3858d6] tabular-nums">{paramM}</span>
                  </div>
                  <input
                    id="law-m"
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={paramM}
                    onChange={(e) => setParamM(Number(e.target.value))}
                    className="edu-slider"
                  />
                </div>
              )}

              {selectedLaw !== 'fractional' && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#172554] mb-1.5">
                    <label htmlFor="law-n">Pangkat n</label>
                    <span className="font-math text-[#3858d6] tabular-nums">{paramN}</span>
                  </div>
                  <input
                    id="law-n"
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={paramN}
                    onChange={(e) => setParamN(Number(e.target.value))}
                    className="edu-slider"
                  />
                </div>
              )}
            </div>

            {/* Side-by-Side Proof Result */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-[#e4e9f2] rounded-xl p-4">
                <div className="text-xs font-semibold text-[#5a657a]">Ruas Kiri (Sebelum Disederhanakan)</div>
                <div className="mt-1.5 font-math text-base font-bold text-[#172554]">
                  <InlineMathText text={verification.leftExpr} />
                </div>
                <div className="mt-1 font-math text-xs text-[#3858d6] tabular-nums">
                  = {verification.leftBreakdown}
                </div>
              </div>

              <div className="bg-white border border-[#e4e9f2] rounded-xl p-4">
                <div className="text-xs font-semibold text-[#5a657a]">Ruas Kanan (Sifat Eksponen)</div>
                <div className="mt-1.5 font-math text-base font-bold text-[#172554]">
                  <InlineMathText text={verification.rightExpr} />
                </div>
                <div className="mt-1 font-math text-xs text-[#3858d6] tabular-nums">
                  = {verification.rightBreakdown}
                </div>
              </div>
            </div>

            {/* Verification Confirmation */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#16865b] bg-[#f4fbf8] border border-[#c8eadc] rounded-xl px-4 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                {verification.equal
                  ? 'Terbukti setara: Ruas Kiri dan Ruas Kanan menghasilkan nilai yang sama.'
                  : 'Periksa kembali nilai parameter.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
