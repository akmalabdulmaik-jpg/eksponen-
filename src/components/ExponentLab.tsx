import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Pause, Play, RotateCcw, StepForward } from 'lucide-react';
import {
  formatBaseDisplay,
  formatBaseParen,
  formatExactPower,
  formatIdNumber,
} from '../utils/mathFormat';

type LabViewMode = 'tree' | 'graph' | 'table';

interface ExponentLabProps {
  initialBase?: number;
  initialExp?: number;
}

const BASIS_PRESETS = [
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '½ (0,5)', value: 0.5 },
  { label: '-2', value: -2 },
];

export const ExponentLab: React.FC<ExponentLabProps> = ({
  initialBase = 2,
  initialExp = 4,
}) => {
  const [base, setBase] = useState<number>(initialBase);
  const [exponent, setExponent] = useState<number>(initialExp);
  const [viewMode, setViewMode] = useState<LabViewMode>('tree');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    setBase(initialBase);
  }, [initialBase]);

  useEffect(() => {
    setExponent(initialExp);
  }, [initialExp]);

  // Playback animation stepping exponent n from -2 to 5
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setExponent((prev) => {
        if (prev >= 5) {
          setIsPlaying(false);
          return 5;
        }
        return prev + 1;
      });
    }, 850);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const exact = useMemo(() => formatExactPower(base, exponent), [base, exponent]);
  const baseText = formatBaseParen(base);

  // Expanded multiplication tokens for positive integers up to 6
  const expandedTokens = useMemo(() => {
    if (exponent <= 0) return [];
    return Array.from({ length: exponent }, () => baseText);
  }, [baseText, exponent]);

  // Pattern explanation tailored to current parameters
  const conceptCallout = useMemo(() => {
    if (exact.isUndefined) {
      return {
        status: 'warning' as const,
        label: 'Kasus Khusus',
        text: exact.reason ?? 'Bentuk ini tidak terdefinisi pada himpunan bilangan real.',
      };
    }
    if (exponent === 0) {
      return {
        status: 'nominal' as const,
        label: 'Identitas Pangkat Nol',
        text: `Setiap kali pangkat berkurang 1, hasilnya dibagi ${formatBaseDisplay(base)}. Dari ${baseText}¹ = ${formatBaseDisplay(base)}, dibagi ${formatBaseDisplay(base)} menghasilkan ${baseText}⁰ = 1.`,
      };
    }
    if (exponent < 0) {
      const posPower = formatExactPower(base, Math.abs(exponent));
      return {
        status: 'nominal' as const,
        label: 'Pangkat Negatif (Kebalikan)',
        text: `Pangkat -${Math.abs(exponent)} bukan berarti hasil negatif, melainkan 1 dibagi ${baseText}^${Math.abs(exponent)} = 1 / (${posPower.decimalStr}).`,
      };
    }
    if (base > 0 && base < 1) {
      return {
        status: 'nominal' as const,
        label: 'Peluruhan Eksponensial',
        text: `Karena 0 < ${formatBaseDisplay(base)} < 1, setiap penambahan pangkat justru memperkecil nilai hasil mendekati 0.`,
      };
    }
    if (base < 0) {
      const isEven = exponent % 2 === 0;
      return {
        status: 'nominal' as const,
        label: isEven ? 'Basis Negatif · Pangkat Genap' : 'Basis Negatif · Pangkat Ganjil',
        text: isEven
          ? `Perkalian bilangan negatif sebanyak genap (${exponent} kali) menghasilkan nilai positif.`
          : `Perkalian bilangan negatif sebanyak ganjil (${exponent} kali) mempertahankan tanda negatif.`,
      };
    }
    if (base === 1) {
      return {
        status: 'nominal' as const,
        label: 'Basis Identitas (1)',
        text: 'Angka 1 dikalikan dengan dirinya sendiri berapa kali pun akan tetap menghasilkan 1.',
      };
    }
    return {
      status: 'nominal' as const,
      label: 'Pertumbuhan Eksponensial',
      text: `Basis ${formatBaseDisplay(base)} > 1 menyebabkan nilai bertambah berlipat ganda sebesar faktor ${formatBaseDisplay(base)} setiap kenaikan 1 pangkat.`,
    };
  }, [base, baseText, exact.isUndefined, exact.reason, exponent]);

  // Coordinate graph builder for y = a^x
  const graphData = useMemo(() => {
    const xMin = -3;
    const xMax = 5;
    const yMax = Math.max(10, Math.min(64, base > 1 ? Math.pow(base, 4) : 10));
    const width = 560;
    const height = 290;
    const padL = 48;
    const padR = 20;
    const padT = 20;
    const padB = 34;

    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    const toSvgX = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
    const toSvgY = (y: number) => {
      const clamped = Math.max(-2, Math.min(yMax, y));
      return padT + plotH - (clamped / yMax) * plotH;
    };

    const curvePoints: string[] = [];
    if (base > 0) {
      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * (xMax - xMin);
        const y = Math.pow(base, x);
        if (y <= yMax * 1.15) {
          curvePoints.push(`${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`);
        }
      }
    }

    const integerPoints = [-3, -2, -1, 0, 1, 2, 3, 4, 5].map((x) => {
      const y = base === 0 && x <= 0 ? null : Math.pow(base, x);
      return { x, y };
    });

    return {
      width,
      height,
      padL,
      padR,
      padT,
      padB,
      xMin,
      xMax,
      yMax,
      toSvgX,
      toSvgY,
      curvePath: curvePoints.length > 1 ? `M ${curvePoints.join(' L ')}` : null,
      integerPoints,
    };
  }, [base]);

  return (
    <section className="bg-white border border-[#e4e9f2] rounded-2xl p-6 sm:p-8 shadow-[0_5px_18px_rgba(23,37,84,0.04)]">
      {/* Section Header + View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e4e9f2]">
        <div>
          <h2 className="text-2xl font-bold text-[#172554]">
            Laboratorium Eksponen Interaktif
          </h2>
          <p className="text-sm text-[#5a657a] mt-1">
            Ubah bilangan pokok dan pangkat untuk mengamati perkalian berulang, grafik fungsi, dan pola nilai.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#f5f7fb] border border-[#e4e9f2] rounded-xl self-start md:self-auto">
          {(
            [
              { id: 'tree', label: 'Struktur Pangkat' },
              { id: 'graph', label: 'Grafik y = aˣ' },
              { id: 'table', label: 'Tabel Pola' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewMode(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === tab.id
                  ? 'bg-[#3858d6] text-white'
                  : 'text-[#172554] hover:bg-[#e8ecf7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Zone Sandbox Layout (Left/Top Stage 62%, Right/Bottom Control Deck 38%) */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT ZONE: Interactive Visual Stage */}
        <div className="lg:col-span-7 bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-5 sm:p-6">
          {/* Live Readout Strip */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 border-b border-[#e4e9f2]">
            <div className="font-math text-3xl sm:text-4xl font-bold text-[#172554] tabular-nums flex items-baseline gap-2">
              <span>
                {baseText}
                <sup className="text-[0.6em] text-[#3858d6] ml-0.5">{exponent}</sup>
              </span>
              <span className="text-[#5a657a] font-normal">=</span>
              <span className={exact.isUndefined ? 'text-[#b45309] text-2xl' : 'text-[#3858d6]'}>
                {exact.fractionStr ? exact.fractionStr : exact.decimalStr}
              </span>
            </div>

            {exact.fractionStr && !exact.isUndefined && (
              <span className="font-math text-sm text-[#5a657a] tabular-nums">
                Desimal: ≈ {exact.decimalStr}
              </span>
            )}
          </div>

          {/* STAGE MODE 1: Struktur Pangkat & Perkalian Berulang */}
          {viewMode === 'tree' && (
            <div className="mt-5 space-y-5">
              {/* Step-by-step expanded product */}
              <div>
                <div className="text-xs font-semibold text-[#5a657a] mb-2">
                  Penjabaran Faktor Pengali
                </div>

                {exact.isUndefined ? (
                  <div className="bg-white border border-[#f5d0a9] rounded-xl p-4 text-sm text-[#7c2d12]">
                    {exact.reason}
                  </div>
                ) : exponent === 0 ? (
                  <div className="bg-white border border-[#e4e9f2] rounded-xl p-4 space-y-2">
                    <div className="font-math text-base font-semibold text-[#172554] tabular-nums">
                      {baseText}⁰ = {baseText}¹ ÷ {baseText} = {formatBaseDisplay(base)} ÷{' '}
                      {formatBaseDisplay(base)} = 1
                    </div>
                    <p className="text-xs text-[#5a657a]">
                      Tidak ada faktor {baseText} yang tersisa, menyisakan elemen identitas perkalian yaitu 1.
                    </p>
                  </div>
                ) : exponent < 0 ? (
                  <div className="bg-white border border-[#e4e9f2] rounded-xl p-4 space-y-3">
                    <div className="font-math text-base font-semibold text-[#172554] tabular-nums flex flex-wrap items-center gap-2">
                      <span>
                        {baseText}
                        <sup className="text-[#3858d6]">{exponent}</sup>
                      </span>
                      <span>=</span>
                      <span className="inline-flex flex-col items-center px-2 py-1 bg-[#f5f7fb] rounded-lg border border-[#e4e9f2]">
                        <span className="border-b border-[#172554] px-2 pb-0.5">1</span>
                        <span className="pt-0.5 text-sm">
                          {Array.from({ length: Math.abs(exponent) }, () => baseText).join(' × ')}
                        </span>
                      </span>
                      <span>=</span>
                      <span className="text-[#3858d6]">
                        {exact.fractionStr ?? exact.decimalStr}
                      </span>
                    </div>
                    <p className="text-xs text-[#5a657a]">
                      Tanda minus pada eksponen membalikkan perkalian berulang ke posisi penyebut.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-[#e4e9f2] rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-2 font-math text-lg font-semibold text-[#172554] tabular-nums">
                      {expandedTokens.map((tok, i) => (
                        <React.Fragment key={i}>
                          <span className="px-2.5 py-1 rounded-lg bg-[#eef2ff] text-[#172554] border border-[#dce4f9]">
                            {tok}
                          </span>
                          {i < expandedTokens.length - 1 && (
                            <span className="text-[#5a657a]">×</span>
                          )}
                        </React.Fragment>
                      ))}
                      <span className="text-[#5a657a] mx-1">=</span>
                      <span className="px-3 py-1 rounded-lg bg-[#e1f8f4] text-[#172554] border border-[#b9f1ea]">
                        {exact.fractionStr ?? exact.decimalStr}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Visual Scaling Bar Chart across steps 0..n (or negative steps) */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#5a657a] mb-2">
                  <span>Jejak Perubahan Nilai per Kenaikan Pangkat</span>
                  <span className="tabular-nums">n dari -2 hingga 5</span>
                </div>
                <div className="bg-white border border-[#e4e9f2] rounded-xl p-4 space-y-2">
                  {[-2, -1, 0, 1, 2, 3, 4, 5].map((k) => {
                    const rowExact = formatExactPower(base, k);
                    const val = base === 0 && k <= 0 ? 0 : Math.pow(base, k);
                    const absMax = Math.max(
                      1,
                      ...[-2, -1, 0, 1, 2, 3, 4, 5].map((j) =>
                        base === 0 && j <= 0 ? 0 : Math.abs(Math.pow(base, j))
                      )
                    );
                    const pct = rowExact.isUndefined
                      ? 0
                      : Math.max(3, (Math.abs(val) / absMax) * 100);
                    const isCurrent = k === exponent;

                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setExponent(k)}
                        className={`w-full grid grid-cols-12 items-center gap-3 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                          isCurrent ? 'bg-[#eef2ff]' : 'hover:bg-[#f8faff]'
                        }`}
                      >
                        <span
                          className={`col-span-3 font-math text-xs tabular-nums ${
                            isCurrent ? 'font-bold text-[#3858d6]' : 'text-[#172554]'
                          }`}
                        >
                          {baseText}
                          <sup>{k}</sup>
                        </span>
                        <div className="col-span-6 h-2.5 bg-[#f1f4fa] rounded-full overflow-hidden">
                          {!rowExact.isUndefined && (
                            <div
                              style={{ width: `${Math.min(100, pct)}%` }}
                              className={`h-full rounded-full transition-all ${
                                isCurrent
                                  ? 'bg-[#3858d6]'
                                  : val < 0
                                  ? 'bg-[#e11d48]/60'
                                  : 'bg-[#94aae8]'
                              }`}
                            />
                          )}
                        </div>
                        <span
                          className={`col-span-3 font-math text-xs text-right tabular-nums truncate ${
                            isCurrent ? 'font-bold text-[#172554]' : 'text-[#5a657a]'
                          }`}
                        >
                          {rowExact.isUndefined
                            ? 'Tak tentu'
                            : rowExact.fractionStr ?? rowExact.decimalStr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STAGE MODE 2: Live Coordinate Graph y = a^x */}
          {viewMode === 'graph' && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#5a657a]">
                <span>Kurva Fungsi Eksponensial y = {baseText}ˣ</span>
                <span className="font-math tabular-nums">
                  Titik aktif: ({exponent}, {exact.isUndefined ? '—' : exact.fractionStr ?? exact.decimalStr})
                </span>
              </div>

              <div className="bg-white border border-[#e4e9f2] rounded-xl p-3 overflow-hidden">
                <svg
                  viewBox={`0 0 ${graphData.width} ${graphData.height}`}
                  className="w-full h-auto"
                  role="img"
                  aria-label={`Grafik fungsi eksponensial y = ${base}^x`}
                >
                  {/* Grid horizontal lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
                    const yVal = frac * graphData.yMax;
                    const yPos = graphData.toSvgY(yVal);
                    return (
                      <g key={idx}>
                        <line
                          x1={graphData.padL}
                          y1={yPos}
                          x2={graphData.width - graphData.padR}
                          y2={yPos}
                          stroke={frac === 0 ? '#94a3b8' : '#e8edf6'}
                          strokeWidth={frac === 0 ? 1.5 : 1}
                          strokeDasharray={frac === 0 ? undefined : '4 4'}
                        />
                        <text
                          x={graphData.padL - 8}
                          y={yPos + 4}
                          textAnchor="end"
                          className="fill-[#64748b] text-[10px] font-mono"
                        >
                          {formatIdNumber(yVal, 1)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical x-axis grid & x = 0 axis */}
                  {[-3, -2, -1, 0, 1, 2, 3, 4, 5].map((xVal) => {
                    const xPos = graphData.toSvgX(xVal);
                    return (
                      <g key={xVal}>
                        <line
                          x1={xPos}
                          y1={graphData.padT}
                          x2={xPos}
                          y2={graphData.height - graphData.padB}
                          stroke={xVal === 0 ? '#94a3b8' : '#f1f4fa'}
                          strokeWidth={xVal === 0 ? 1.5 : 1}
                        />
                        <text
                          x={xPos}
                          y={graphData.height - 12}
                          textAnchor="middle"
                          className={`text-[11px] font-mono ${
                            xVal === exponent ? 'fill-[#3858d6] font-bold' : 'fill-[#64748b]'
                          }`}
                        >
                          {xVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Continuous curve when base > 0 */}
                  {graphData.curvePath && (
                    <path
                      d={graphData.curvePath}
                      fill="none"
                      stroke="#3858d6"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Integer points */}
                  {graphData.integerPoints.map((pt) => {
                    if (pt.y === null || pt.y > graphData.yMax || pt.y < -2) return null;
                    const cx = graphData.toSvgX(pt.x);
                    const cy = graphData.toSvgY(pt.y);
                    const isCurrent = pt.x === exponent;
                    return (
                      <g key={pt.x}>
                        {isCurrent && (
                          <line
                            x1={cx}
                            y1={cy}
                            x2={cx}
                            y2={graphData.toSvgY(0)}
                            stroke="#3858d6"
                            strokeWidth={1.2}
                            strokeDasharray="3 3"
                          />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isCurrent ? 6.5 : 3.5}
                          fill={isCurrent ? '#16865b' : '#ffffff'}
                          stroke={isCurrent ? '#ffffff' : '#3858d6'}
                          strokeWidth={2}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {base <= 0 && (
                <p className="text-xs text-[#7c2d12] bg-white border border-[#f5d0a9] rounded-lg px-3 py-2">
                  Catatan: Untuk basis ≤ 0, grafik hanya terdefinisi pada titik-titik pangkat bulat
                  (diskrit), tidak membentuk kurva kontinu di bilangan real.
                </p>
              )}
            </div>
          )}

          {/* STAGE MODE 3: Tabular Pattern */}
          {viewMode === 'table' && (
            <div className="mt-5">
              <div className="bg-white border border-[#e4e9f2] rounded-xl overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f8faff] border-b border-[#e4e9f2] text-left text-xs font-semibold text-[#5a657a]">
                      <th className="py-2.5 px-4">Pangkat (n)</th>
                      <th className="py-2.5 px-4">Bentuk</th>
                      <th className="py-2.5 px-4 text-right">Nilai Pecahan</th>
                      <th className="py-2.5 px-4 text-right">Desimal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf1f7] tabular-nums">
                    {[-3, -2, -1, 0, 1, 2, 3, 4, 5].map((n) => {
                      const row = formatExactPower(base, n);
                      const active = n === exponent;
                      return (
                        <tr
                          key={n}
                          onClick={() => setExponent(n)}
                          className={`cursor-pointer transition-colors ${
                            active ? 'bg-[#eef2ff] font-semibold' : 'hover:bg-[#f8faff]'
                          }`}
                        >
                          <td className="py-2 px-4 font-math text-[#172554]">n = {n}</td>
                          <td className="py-2 px-4 font-math text-[#3858d6]">
                            {baseText}
                            <sup>{n}</sup>
                          </td>
                          <td className="py-2 px-4 font-math text-right text-[#172554]">
                            {row.isUndefined ? '—' : row.fractionStr ?? row.decimalStr}
                          </td>
                          <td className="py-2 px-4 font-math text-right text-[#5a657a]">
                            {row.isUndefined ? 'Tak tentu' : row.decimalStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT ZONE: Control & Concept Deck */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-5 space-y-5">
            {/* Basis Presets */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#172554] mb-2">
                <span>Pilih Cepat Bilangan Pokok (a)</span>
                <span className="font-math text-[#3858d6] tabular-nums">
                  a = {formatBaseDisplay(base)}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-1.5">
                {BASIS_PRESETS.map((preset) => {
                  const active = base === preset.value;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBase(preset.value)}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-math font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#3858d6] text-white'
                          : 'bg-white border border-[#dce3f0] text-[#172554] hover:bg-[#e8ecf7]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider Basis */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#172554] mb-2">
                <label htmlFor="lab-base-slider">Bilangan Pokok (a)</label>
                <span className="font-math tabular-nums text-[#3858d6]">
                  {formatBaseDisplay(base)}
                </span>
              </div>
              <input
                id="lab-base-slider"
                type="range"
                min={-3}
                max={10}
                step={0.5}
                value={base}
                onChange={(e) => setBase(Number(e.target.value))}
                className="edu-slider"
              />
              <div className="flex justify-between text-[11px] font-math text-[#5a657a] mt-1 tabular-nums">
                <span>-3</span>
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Slider Eksponen */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#172554] mb-2">
                <label htmlFor="lab-exp-slider">Eksponen / Pangkat (n)</label>
                <span className="font-math tabular-nums text-[#3858d6]">{exponent}</span>
              </div>
              <input
                id="lab-exp-slider"
                type="range"
                min={-3}
                max={6}
                step={1}
                value={exponent}
                onChange={(e) => {
                  setIsPlaying(false);
                  setExponent(Number(e.target.value));
                }}
                className="edu-slider"
              />
              <div className="flex justify-between text-[11px] font-math text-[#5a657a] mt-1 tabular-nums">
                <span>-3</span>
                <span>0</span>
                <span>3</span>
                <span>6</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="pt-2 border-t border-[#e4e9f2] flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isPlaying && exponent >= 5) setExponent(-2);
                  setIsPlaying((p) => !p);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3858d6] text-white text-xs font-semibold hover:bg-[#2d49b8] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                    Jeda
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    Putar Pertumbuhan
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setExponent((e) => (e < 6 ? e + 1 : -3));
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#dce3f0] text-[#172554] text-xs font-semibold hover:bg-[#e8ecf7] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <StepForward className="w-3.5 h-3.5" aria-hidden="true" />
                Langkah +1
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setBase(2);
                  setExponent(4);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#dce3f0] text-[#5a657a] text-xs font-semibold hover:text-[#172554] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          {/* Contextual Concept Callout (No thick left border, explicit icon + text label) */}
          <div
            className={`rounded-2xl border p-5 ${
              conceptCallout.status === 'warning'
                ? 'bg-[#fffbeb] border-[#f5d0a9]'
                : 'bg-[#f4fbf8] border-[#c8eadc]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {conceptCallout.status === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#16865b] shrink-0" aria-hidden="true" />
              )}
              <span
                className={`text-xs font-bold tracking-wide ${
                  conceptCallout.status === 'warning' ? 'text-[#b45309]' : 'text-[#16865b]'
                }`}
              >
                {conceptCallout.label}
              </span>
            </div>
            <p className="text-sm text-[#172033] leading-relaxed">{conceptCallout.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
