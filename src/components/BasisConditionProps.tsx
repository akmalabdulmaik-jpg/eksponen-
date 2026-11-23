import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Scale } from 'lucide-react';
import { formatBaseDisplay, formatExactPower, formatIdNumber } from '../utils/mathFormat';
import { InlineMathText } from './MathExpr';

const BASIS_OPTIONS = [
  { label: '-2', value: -2 },
  { label: '-1', value: -1 },
  { label: '0', value: 0 },
  { label: '½', value: 0.5 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
];

interface FuncEqPreset {
  id: string;
  label: string;
  hExpr: string;
  fExpr: string;
  gExpr: string;
  hFn: (x: number) => number;
  fFn: (x: number) => number;
  gFn: (x: number) => number;
  checks: Array<{
    step: string;
    rule: string;
    detail: string;
    accepted: boolean;
    xVal?: number;
  }>;
  solutionSet: string;
  defaultTestX: number;
}

const FUNC_PRESETS: FuncEqPreset[] = [
  {
    id: 'p1',
    label: '(x - 3)^(x + 1) = (x - 3)^5',
    hExpr: 'x - 3',
    fExpr: 'x + 1',
    gExpr: '5',
    hFn: (x) => x - 3,
    fFn: (x) => x + 1,
    gFn: () => 5,
    checks: [
      {
        step: '1. Pangkat Sama: f(x) = g(x)',
        rule: 'x + 1 = 5 ⇒ x = 4',
        detail: 'Basis (4 - 3) = 1? Bukan, 4 - 3 = 1! Ternyata di x = 4 menghasilkan 1^5 = 1^5 = 1.',
        accepted: true,
        xVal: 4,
      },
      {
        step: '2. Syarat Basis = 1: h(x) = 1',
        rule: 'x - 3 = 1 ⇒ x = 4',
        detail: 'Kebetulan sama dengan x = 4. Untuk x = 4, kedua ruas bernilai 1^5 = 1.',
        accepted: true,
        xVal: 4,
      },
      {
        step: '3. Syarat Basis = 0: h(x) = 0',
        rule: 'x - 3 = 0 ⇒ x = 3',
        detail: 'Uji pangkat: f(3) = 4 > 0 dan g(3) = 5 > 0. Karena keduanya positif, 0^4 = 0^5 = 0 (Sah!).',
        accepted: true,
        xVal: 3,
      },
      {
        step: '4. Syarat Basis = -1: h(x) = -1',
        rule: 'x - 3 = -1 ⇒ x = 2',
        detail: 'Uji paritas: f(2) = 3 (ganjil) dan g(2) = 5 (ganjil). (-1)^3 = (-1)^5 = -1 (Sah!).',
        accepted: true,
        xVal: 2,
      },
    ],
    solutionSet: '{2, 3, 4}',
    defaultTestX: 2,
  },
  {
    id: 'p2',
    label: '(x - 1)^(x - 3) = (x - 1)^2',
    hExpr: 'x - 1',
    fExpr: 'x - 3',
    gExpr: '2',
    hFn: (x) => x - 1,
    fFn: (x) => x - 3,
    gFn: () => 2,
    checks: [
      {
        step: '1. Pangkat Sama: f(x) = g(x)',
        rule: 'x - 3 = 2 ⇒ x = 5',
        detail: 'Pada x = 5: 4^2 = 4^2 = 16 (Sah!).',
        accepted: true,
        xVal: 5,
      },
      {
        step: '2. Syarat Basis = 1: h(x) = 1',
        rule: 'x - 1 = 1 ⇒ x = 2',
        detail: 'Pada x = 2: 1^(-1) = 1^2 = 1 (Sah!).',
        accepted: true,
        xVal: 2,
      },
      {
        step: '3. Syarat Basis = 0: h(x) = 0',
        rule: 'x - 1 = 0 ⇒ x = 1',
        detail: 'Uji pangkat: f(1) = 1 - 3 = -2 ≤ 0. Terbentuk 0^(-2) yang tak terdefinisi (Ditolak!).',
        accepted: false,
        xVal: 1,
      },
      {
        step: '4. Syarat Basis = -1: h(x) = -1',
        rule: 'x - 1 = -1 ⇒ x = 0',
        detail: 'Uji paritas: f(0) = -3 (ganjil) ≠ g(0) = 2 (genap). (-1)^(-3) = -1 ≠ 1 (Ditolak!).',
        accepted: false,
        xVal: 0,
      },
    ],
    solutionSet: '{2, 5}',
    defaultTestX: 1,
  },
  {
    id: 'p3',
    label: '(x + 1)^(x - 2) = (x + 1)^4',
    hExpr: 'x + 1',
    fExpr: 'x - 2',
    gExpr: '4',
    hFn: (x) => x + 1,
    fFn: (x) => x - 2,
    gFn: () => 4,
    checks: [
      {
        step: '1. Pangkat Sama: f(x) = g(x)',
        rule: 'x - 2 = 4 ⇒ x = 6',
        detail: 'Pada x = 6: 7^4 = 7^4 (Sah!).',
        accepted: true,
        xVal: 6,
      },
      {
        step: '2. Syarat Basis = 1: h(x) = 1',
        rule: 'x + 1 = 1 ⇒ x = 0',
        detail: 'Pada x = 0: 1^(-2) = 1^4 = 1 (Sah!).',
        accepted: true,
        xVal: 0,
      },
      {
        step: '3. Syarat Basis = 0: h(x) = 0',
        rule: 'x + 1 = 0 ⇒ x = -1',
        detail: 'Uji pangkat: f(-1) = -3 ≤ 0. Terbentuk 0^(-3) tak terdefinisi (Ditolak!).',
        accepted: false,
        xVal: -1,
      },
      {
        step: '4. Syarat Basis = -1: h(x) = -1',
        rule: 'x + 1 = -1 ⇒ x = -2',
        detail: 'Uji paritas: f(-2) = -4 (genap) dan g(-2) = 4 (genap). (-1)^(-4) = (-1)^4 = 1 (Sah!).',
        accepted: true,
        xVal: -2,
      },
    ],
    solutionSet: '{-2, 0, 6}',
    defaultTestX: -2,
  },
];

export const BasisConditionProps: React.FC = () => {
  const [basis, setBasis] = useState<number>(1);
  const [expM, setExpM] = useState<number>(2);
  const [expN, setExpN] = useState<number>(5);

  const [presetId, setPresetId] = useState<string>('p1');
  const [testX, setTestX] = useState<number>(2);

  const leftRes = useMemo(() => formatExactPower(basis, expM), [basis, expM]);
  const rightRes = useMemo(() => formatExactPower(basis, expN), [basis, expN]);

  const leftNum = basis === 0 && expM <= 0 ? NaN : Math.pow(basis, expM);
  const rightNum = basis === 0 && expN <= 0 ? NaN : Math.pow(basis, expN);
  const bothDefined = !leftRes.isUndefined && !rightRes.isUndefined;
  const valuesEqual = bothDefined && Math.abs(leftNum - rightNum) < 1e-9;
  const exponentsEqual = expM === expN;

  const isOneToOneBasis = basis > 0 && basis !== 1;

  // Diagnostic verdict for Alat Peraga A
  const diagnosis = useMemo(() => {
    if (!bothDefined) {
      return {
        tone: 'warning' as const,
        title: 'Ada Ruas yang Tak Terdefinisi',
        body: 'Basis 0 dengan pangkat ≤ 0 menghasilkan 0⁰ (tak tentu) atau pembagian dengan nol. Persamaan gagal pada syarat terdefinisi.',
      };
    }
    if (valuesEqual && !exponentsEqual) {
      return {
        tone: 'trap' as const,
        title: 'Terbukti! aᵐ = aⁿ Benar Walaupun m ≠ n',
        body:
          basis === 1
            ? `Karena basis a = 1, maka 1^(${expM}) = 1 dan 1^(${expN}) = 1. Menyimpulkan ${expM} = ${expN} dari persamaan ini adalah KELIRU.`
            : basis === -1
            ? `Karena basis a = -1 dan kedua pangkat memiliki paritas sama, (-1)^(${expM}) = (-1)^(${expN}) = ${leftRes.decimalStr} walau ${expM} ≠ ${expN}.`
            : `Karena basis a = 0 dan kedua pangkat positif, 0^(${expM}) = 0^(${expN}) = 0 walau ${expM} ≠ ${expN}.`,
      };
    }
    if (valuesEqual && exponentsEqual) {
      return {
        tone: 'ok' as const,
        title: isOneToOneBasis
          ? 'Syarat Basis Terpenuhi (a > 0, a ≠ 1)'
          : 'Kedua Ruas Sama Karena m = n',
        body: isOneToOneBasis
          ? `Untuk basis ${formatBaseDisplay(basis)}, satu-satunya cara agar kedua ruas seimbang adalah pangkat kiri = pangkat kanan (m = n).`
          : `Saat m = n tentu kedua ruas sama, tetapi coba geser pangkat n agar berbeda—untuk basis ${formatBaseDisplay(basis)}, keseimbangan tetap bisa terjadi!`,
      };
    }
    return {
      tone: 'neutral' as const,
      title: 'Timbangan Tidak Seimbang (aᵐ ≠ aⁿ)',
      body: isOneToOneBasis
        ? `Karena basis ${formatBaseDisplay(basis)} > 0 dan ≠ 1 bersifat satu-ke-satu, pangkat yang berbeda (${expM} ≠ ${expN}) pasti menghasilkan nilai berbeda.`
        : `Pada basis ${formatBaseDisplay(basis)}, kombinasi pangkat ${expM} dan ${expN} kebetulan menghasilkan nilai berbeda.`,
    };
  }, [basis, bothDefined, expM, expN, exponentsEqual, isOneToOneBasis, leftRes.decimalStr, valuesEqual]);

  const activePreset = FUNC_PRESETS.find((p) => p.id === presetId) ?? FUNC_PRESETS[0];
  const evalH = activePreset.hFn(testX);
  const evalF = activePreset.fFn(testX);
  const evalG = activePreset.gFn(testX);
  const lhsEval = formatExactPower(evalH, evalF);
  const rhsEval = formatExactPower(evalH, evalG);
  const evalMatch =
    !lhsEval.isUndefined &&
    !rhsEval.isUndefined &&
    Math.abs(Math.pow(evalH, evalF) - Math.pow(evalH, evalG)) < 1e-9;

  return (
    <section className="space-y-6">
      {/* ALAT PERAGA 1: Timbangan Syarat Basis & Uji Injektivitas */}
      <div className="bg-white border border-[#e4e9f2] rounded-2xl p-6 sm:p-8 shadow-[0_5px_18px_rgba(23,37,84,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#e4e9f2]">
          <div>
            <p className="text-xs font-semibold text-[#3858d6]">
              Alat Peraga 01 · Investigasi Kesalahan Umum Siswa
            </p>
            <h2 className="text-2xl font-bold text-[#172554] mt-1">
              Timbangan Kesamaan Pangkat: Mengapa Syarat Basis Menentukan?
            </h2>
            <p className="text-sm text-[#5a657a] mt-1">
              Banyak siswa langsung mencoret basis pada aᵐ = aⁿ lalu menulis m = n. Uji sendiri kapan aturan itu benar dan kapan jebakan muncul.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#f5f7fb] border border-[#e4e9f2] text-[#172554]">
            <Scale className="w-4 h-4 text-[#3858d6]" aria-hidden="true" />
            <span>{isOneToOneBasis ? 'Basis Injektif (a > 0, a ≠ 1)' : 'Basis Khusus (Pengecualian)'}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Visual Scale + Graph */}
          <div className="lg:col-span-7 bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-5 sm:p-6 space-y-5">
            {/* Balance Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
              <div className="sm:col-span-5 bg-white border border-[#e4e9f2] rounded-xl p-4 text-center">
                <div className="text-xs font-semibold text-[#5a657a]">Ruas Kiri (aᵐ)</div>
                <div className="mt-2 font-math text-3xl font-bold text-[#172554] tabular-nums">
                  ({formatBaseDisplay(basis)})
                  <sup className="text-[#3858d6] text-lg ml-0.5">{expM}</sup>
                </div>
                <div className="mt-2 font-math text-lg font-semibold text-[#3858d6] tabular-nums">
                  = {leftRes.fractionStr ?? leftRes.decimalStr}
                </div>
              </div>

              <div className="sm:col-span-1 flex items-center justify-center">
                <span
                  className={`font-math text-2xl font-bold px-3 py-1 rounded-lg border ${
                    !bothDefined
                      ? 'bg-[#fffbeb] border-[#f5d0a9] text-[#b45309]'
                      : valuesEqual
                      ? 'bg-[#e1f8f4] border-[#16865b] text-[#16865b]'
                      : 'bg-[#fff1f2] border-[#fecdd3] text-[#be123c]'
                  }`}
                >
                  {!bothDefined ? '?' : valuesEqual ? '=' : '≠'}
                </span>
              </div>

              <div className="sm:col-span-5 bg-white border border-[#e4e9f2] rounded-xl p-4 text-center">
                <div className="text-xs font-semibold text-[#5a657a]">Ruas Kanan (aⁿ)</div>
                <div className="mt-2 font-math text-3xl font-bold text-[#172554] tabular-nums">
                  ({formatBaseDisplay(basis)})
                  <sup className="text-[#3858d6] text-lg ml-0.5">{expN}</sup>
                </div>
                <div className="mt-2 font-math text-lg font-semibold text-[#3858d6] tabular-nums">
                  = {rightRes.fractionStr ?? rightRes.decimalStr}
                </div>
              </div>
            </div>

            {/* Visual Beam Tilt SVG */}
            <div className="bg-white border border-[#e4e9f2] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-[#5a657a] mb-2">
                <span>Simulasi Keseimbangan Nilai</span>
                <span className="font-math tabular-nums">
                  m = {expM} · n = {expN}
                </span>
              </div>
              <svg viewBox="0 0 420 110" className="w-full h-24" role="img" aria-label="Timbangan perbandingan pangkat">
                {/* Fulcrum */}
                <polygon points="210,72 194,100 226,100" fill="#172554" />
                {(() => {
                  let tilt = 0;
                  if (bothDefined && !valuesEqual) {
                    tilt = leftNum > rightNum ? -9 : 9;
                  }
                  return (
                    <g transform={`rotate(${tilt} 210 70)`} style={{ transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
                      <line x1="60" y1="70" x2="360" y2="70" stroke="#3858d6" strokeWidth="5" strokeLinecap="round" />
                      <circle cx="210" cy="70" r="6" fill="#ffffff" stroke="#172554" strokeWidth="2.5" />
                      <rect x="44" y="34" width="84" height="30" rx="8" fill="#eef2ff" stroke="#3858d6" strokeWidth="1.5" />
                      <text x="86" y="53" textAnchor="middle" className="fill-[#172554] text-[12px] font-mono font-bold">
                        {leftRes.isUndefined ? 'Tak tentu' : leftRes.fractionStr ?? leftRes.decimalStr}
                      </text>
                      <rect x="292" y="34" width="84" height="30" rx="8" fill="#eef2ff" stroke="#3858d6" strokeWidth="1.5" />
                      <text x="334" y="53" textAnchor="middle" className="fill-[#172554] text-[12px] font-mono font-bold">
                        {rightRes.isUndefined ? 'Tak tentu' : rightRes.fractionStr ?? rightRes.decimalStr}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Diagnostic Banner */}
            <div
              className={`rounded-xl border p-4 ${
                diagnosis.tone === 'trap'
                  ? 'bg-[#fffbeb] border-[#f5d0a9]'
                  : diagnosis.tone === 'ok'
                  ? 'bg-[#f4fbf8] border-[#c8eadc]'
                  : diagnosis.tone === 'warning'
                  ? 'bg-[#fff1f2] border-[#fecdd3]'
                  : 'bg-white border-[#e4e9f2]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {diagnosis.tone === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16865b] shrink-0" aria-hidden="true" />
                ) : diagnosis.tone === 'trap' || diagnosis.tone === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0" aria-hidden="true" />
                ) : (
                  <Info className="w-4 h-4 text-[#3858d6] shrink-0" aria-hidden="true" />
                )}
                <span className="text-xs font-bold text-[#172554]">{diagnosis.title}</span>
              </div>
              <p className="text-sm text-[#42506b] leading-relaxed">{diagnosis.body}</p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="lg:col-span-5 bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#172554] mb-2">
                <span>Pilih Basis (a)</span>
                <span className="font-math text-[#3858d6]">a = {formatBaseDisplay(basis)}</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-4 gap-1.5">
                {BASIS_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setBasis(opt.value)}
                    className={`py-2 px-2 rounded-lg font-math text-xs font-bold transition-colors cursor-pointer ${
                      basis === opt.value
                        ? 'bg-[#3858d6] text-white'
                        : 'bg-white border border-[#dce3f0] text-[#172554] hover:bg-[#e8ecf7]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#172554] mb-1.5">
                <label htmlFor="prop-m-slider">Pangkat Ruas Kiri (m)</label>
                <span className="font-math text-[#3858d6] tabular-nums">m = {expM}</span>
              </div>
              <input
                id="prop-m-slider"
                type="range"
                min={-2}
                max={5}
                step={1}
                value={expM}
                onChange={(e) => setExpM(Number(e.target.value))}
                className="edu-slider"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#172554] mb-1.5">
                <label htmlFor="prop-n-slider">Pangkat Ruas Kanan (n)</label>
                <span className="font-math text-[#3858d6] tabular-nums">n = {expN}</span>
              </div>
              <input
                id="prop-n-slider"
                type="range"
                min={-2}
                max={5}
                step={1}
                value={expN}
                onChange={(e) => setExpN(Number(e.target.value))}
                className="edu-slider"
              />
            </div>

            <div className="pt-3 border-t border-[#e4e9f2] space-y-2">
              <div className="text-xs font-bold text-[#172554]">Eksperimen Cepat Jebakan Siswa:</div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setBasis(1);
                    setExpM(2);
                    setExpN(5);
                  }}
                  className="text-left px-3 py-2 rounded-lg bg-white border border-[#dce3f0] text-xs font-medium text-[#172554] hover:bg-[#eef2ff] transition-colors cursor-pointer"
                >
                  Uji Basis 1: 1² = 1⁵ (Pangkat beda tapi hasil sama)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBasis(-1);
                    setExpM(2);
                    setExpN(4);
                  }}
                  className="text-left px-3 py-2 rounded-lg bg-white border border-[#dce3f0] text-xs font-medium text-[#172554] hover:bg-[#eef2ff] transition-colors cursor-pointer"
                >
                  Uji Basis -1: (-1)² = (-1)⁴ (Paritas genap sama)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBasis(0);
                    setExpM(1);
                    setExpN(4);
                  }}
                  className="text-left px-3 py-2 rounded-lg bg-white border border-[#dce3f0] text-xs font-medium text-[#172554] hover:bg-[#eef2ff] transition-colors cursor-pointer"
                >
                  Uji Basis 0: 0¹ = 0⁴ (Sama-sama 0 asal pangkat &gt; 0)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ALAT PERAGA 2: Bedah 4 Syarat Persamaan h(x)^f(x) = h(x)^g(x) */}
      <div className="bg-white border border-[#e4e9f2] rounded-2xl p-6 sm:p-8 shadow-[0_5px_18px_rgba(23,37,84,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#e4e9f2]">
          <div>
            <p className="text-xs font-semibold text-[#3858d6]">
              Alat Peraga 02 · Penguji Solusi Persamaan h(x)^f(x) = h(x)^g(x)
            </p>
            <h3 className="text-xl font-bold text-[#172554] mt-1">
              Bedah 4 Kemungkinan Saat Basis Mengandung Variabel x
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FUNC_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPresetId(p.id);
                  setTestX(p.defaultTestX);
                }}
                className={`px-3 py-1.5 rounded-lg font-math text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  presetId === p.id
                    ? 'bg-[#3858d6] text-white border-[#3858d6]'
                    : 'bg-[#f5f7fb] text-[#172554] border-[#dce3f0] hover:bg-[#e8ecf7]'
                }`}
              >
                <InlineMathText text={p.label} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 4 Cases Breakdown */}
          <div className="lg:col-span-7 space-y-2.5">
            {activePreset.checks.map((c, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  c.accepted
                    ? 'bg-[#f4fbf8] border-[#c8eadc]'
                    : 'bg-[#fff1f2] border-[#fecdd3]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#172554]">{c.step}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        c.accepted ? 'text-[#16865b]' : 'text-[#be123c]'
                      }`}
                    >
                      {c.accepted ? 'Memenuhi' : 'Ditolak'}
                    </span>
                    {typeof c.xVal === 'number' && (
                      <button
                        type="button"
                        onClick={() => setTestX(c.xVal!)}
                        className="px-2.5 py-1 rounded-md bg-white border border-[#dce3f0] text-[11px] font-math font-semibold text-[#3858d6] hover:bg-[#eef2ff] cursor-pointer"
                      >
                        Uji x = {c.xVal}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-1 font-math text-sm font-semibold text-[#172554]">
                  {c.rule}
                </div>
                <p className="mt-1 text-xs text-[#42506b]">{c.detail}</p>
              </div>
            ))}
          </div>

          {/* Interactive Live Substitution Tester */}
          <div className="lg:col-span-5 bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-5 space-y-4">
            <div>
              <div className="text-xs font-semibold text-[#5a657a]">Uji Substitusi Langsung</div>
              <div className="mt-1 font-math text-lg font-bold text-[#172554]">
                <InlineMathText text={activePreset.label} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#172554] mb-1.5">
                <label htmlFor="subst-x-slider">Geser nilai x uji coba</label>
                <span className="font-math text-[#3858d6] tabular-nums">x = {testX}</span>
              </div>
              <input
                id="subst-x-slider"
                type="range"
                min={-3}
                max={7}
                step={1}
                value={testX}
                onChange={(e) => setTestX(Number(e.target.value))}
                className="edu-slider"
              />
              <div className="flex justify-between text-[11px] font-math text-[#5a657a] mt-1 tabular-nums">
                <span>-3</span>
                <span>0</span>
                <span>4</span>
                <span>7</span>
              </div>
            </div>

            <div className="bg-white border border-[#e4e9f2] rounded-xl p-4 space-y-2 text-sm tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#5a657a]">Basis h({testX}) =</span>
                <span className="font-math font-bold text-[#172554]">{evalH}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a657a]">Ruas Kiri ({evalH})^{evalF} =</span>
                <span className="font-math font-bold text-[#3858d6]">
                  {lhsEval.isUndefined ? 'Tak terdefinisi' : lhsEval.fractionStr ?? formatIdNumber(Math.pow(evalH, evalF))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a657a]">Ruas Kanan ({evalH})^{evalG} =</span>
                <span className="font-math font-bold text-[#3858d6]">
                  {rhsEval.isUndefined ? 'Tak terdefinisi' : rhsEval.fractionStr ?? formatIdNumber(Math.pow(evalH, evalG))}
                </span>
              </div>
            </div>

            <div
              className={`rounded-xl border px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
                evalMatch
                  ? 'bg-[#f4fbf8] border-[#c8eadc] text-[#16865b]'
                  : 'bg-[#fff1f2] border-[#fecdd3] text-[#be123c]'
              }`}
            >
              {evalMatch ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                {evalMatch
                  ? `x = ${testX} adalah PENYELESAIAN (kedua ruas sama).`
                  : `x = ${testX} BUKAN penyelesaian.`}
              </span>
            </div>

            <div className="pt-2 border-t border-[#e4e9f2] text-xs text-[#5a657a]">
              Himpunan penyelesaian lengkap:{' '}
              <strong className="font-math text-[#172554]">{activePreset.solutionSet}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
