export interface RationalFraction {
  num: number;
  den: number;
}

/**
 * Formats a number using Indonesian locale conventions while avoiding noisy floating point artifacts.
 */
export function formatIdNumber(value: number, maxDecimals = 4): string {
  if (!Number.isFinite(value)) return 'Tak terdefinisi';
  if (Math.abs(value) < 1e-12) return '0';
  const rounded = Number(value.toFixed(maxDecimals));
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: maxDecimals,
  }).format(rounded);
}

/**
 * Converts a finite decimal (with step 0.5 or integer) to a clean simplified fraction.
 */
export function toSimpleFraction(value: number): RationalFraction | null {
  if (!Number.isFinite(value)) return null;
  if (Number.isInteger(value)) return { num: value, den: 1 };
  // Handle halves, quarters, eighths, tenths cleanly
  const precision = 10000;
  const scaled = Math.round(value * precision);
  const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  const divisor = gcd(scaled, precision);
  return {
    num: scaled / divisor,
    den: precision / divisor,
  };
}

/**
 * Computes exact string representation of a^n for small integer exponents n.
 */
export function formatExactPower(base: number, exp: number): {
  decimalStr: string;
  fractionStr: string | null;
  isUndefined: boolean;
  reason?: string;
} {
  if (base === 0 && exp === 0) {
    return {
      decimalStr: 'Tak tentu (0⁰)',
      fractionStr: null,
      isUndefined: true,
      reason: 'Dalam aljabar dasar, 0⁰ tidak didefinisikan karena aturan a⁰ = 1 bertentangan dengan 0ⁿ = 0.',
    };
  }
  if (base === 0 && exp < 0) {
    return {
      decimalStr: 'Tak terdefinisi',
      fractionStr: null,
      isUndefined: true,
      reason: 'Pangkat negatif berarti membagi dengan 0ⁿ = 0. Pembagian dengan nol tidak terdefinisi.',
    };
  }

  const val = Math.pow(base, exp);
  const decimalStr = formatIdNumber(val, 6);

  // Build exact rational form when base is integer or 0.5 multiple
  const baseFrac = toSimpleFraction(base);
  if (baseFrac && Number.isInteger(exp) && Math.abs(exp) <= 8) {
    if (exp === 0) {
      return { decimalStr: '1', fractionStr: null, isUndefined: false };
    }
    const absExp = Math.abs(exp);
    const numBase = exp > 0 ? baseFrac.num : baseFrac.den;
    const denBase = exp > 0 ? baseFrac.den : baseFrac.num;

    const rawNum = Math.pow(numBase, absExp);
    const rawDen = Math.pow(denBase, absExp);
    const sign = rawDen < 0 ? -1 : 1;
    const finalNum = rawNum * sign;
    const finalDen = Math.abs(rawDen);

    if (finalDen === 1) {
      return {
        decimalStr: formatIdNumber(finalNum, 0),
        fractionStr: null,
        isUndefined: false,
      };
    }

    return {
      decimalStr,
      fractionStr: `${formatIdNumber(finalNum, 0)}/${formatIdNumber(finalDen, 0)}`,
      isUndefined: false,
    };
  }

  return { decimalStr, fractionStr: null, isUndefined: false };
}

export function formatBaseDisplay(base: number): string {
  if (base === 0.5) return '½';
  if (base === -0.5) return '-½';
  return formatIdNumber(base, 2);
}

export function formatBaseParen(base: number): string {
  const display = formatBaseDisplay(base);
  if (base < 0 || !Number.isInteger(base)) {
    return `(${display})`;
  }
  return display;
}

export interface MissionQuestion {
  id: string;
  tier: 1 | 2 | 3;
  contextLabel: string;
  prompt: string;
  mathLatexLike?: {
    base?: string;
    exp?: string;
    expression?: string;
  };
  options: string[];
  correctIndex: number;
  hint: string;
  steps: string[];
}

function shuffleWithCorrect(correct: string, distractors: string[]): {
  options: string[];
  correctIndex: number;
} {
  const uniqueDistractors = Array.from(new Set(distractors.filter((d) => d !== correct))).slice(0, 3);
  const all = [correct, ...uniqueDistractors];
  // Deterministic-feeling Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return {
    options: all,
    correctIndex: all.indexOf(correct),
  };
}

export function generateMissionSet(tier: 1 | 2 | 3): MissionQuestion[] {
  if (tier === 1) {
    const bases = [2, 3, 4, 5];
    const b1 = bases[Math.floor(Math.random() * bases.length)];
    const e1 = Math.floor(Math.random() * 3) + 3; // 3..5
    const ans1 = Math.pow(b1, e1);
    const q1Shuffled = shuffleWithCorrect(formatIdNumber(ans1), [
      formatIdNumber(b1 * e1),
      formatIdNumber(Math.pow(b1, e1 - 1)),
      formatIdNumber(Math.pow(e1, b1)),
    ]);

    const b2 = Math.floor(Math.random() * 7) + 3; // 3..9
    const q2Shuffled = shuffleWithCorrect('1', ['0', formatIdNumber(b2), '-1']);

    const b3 = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
    const e3 = Math.floor(Math.random() * 2) + 2; // 2..3 -> negative -2..-3
    const denom3 = Math.pow(b3, e3);
    const q3Shuffled = shuffleWithCorrect(`1/${denom3}`, [
      `-${denom3}`,
      `-1/${denom3}`,
      `1/${b3 * e3}`,
    ]);

    const b4 = [2, 3][Math.floor(Math.random() * 2)];
    const e4 = 3;
    const ans4 = Math.pow(-b4, e4);
    const q4Shuffled = shuffleWithCorrect(formatIdNumber(ans4), [
      formatIdNumber(Math.abs(ans4)),
      formatIdNumber(-b4 * e4),
      formatIdNumber(-Math.pow(b4, 2)),
    ]);

    const b5 = [2, 3, 5][Math.floor(Math.random() * 3)];
    const q5Shuffled = shuffleWithCorrect(formatIdNumber(-Math.pow(b5, 2)), [
      formatIdNumber(Math.pow(b5, 2)),
      formatIdNumber(-b5 * 2),
      formatIdNumber(b5 * 2),
    ]);

    return [
      {
        id: `t1-q1-${Date.now()}`,
        tier: 1,
        contextLabel: 'Definisi Pangkat Bulat Positif',
        prompt: `Hitung nilai dari ${b1}^${e1}.`,
        mathLatexLike: { expression: `${b1}^${e1}` },
        ...q1Shuffled,
        hint: `Pangkat ${e1} berarti mengalikan bilangan pokok ${b1} secara berulang sebanyak ${e1} kali, bukan ${b1} × ${e1}.`,
        steps: [
          `${b1}^${e1} = ${Array(e1).fill(b1).join(' × ')}`,
          `Hasil perkalian berulang tersebut adalah ${formatIdNumber(ans1)}.`,
        ],
      },
      {
        id: `t1-q2-${Date.now()}`,
        tier: 1,
        contextLabel: 'Sifat Pangkat Nol',
        prompt: `Berapakah nilai dari (${b2}x)^0 untuk x ≠ 0?`,
        mathLatexLike: { expression: `(${b2}x)^0` },
        ...q2Shuffled,
        hint: 'Setiap bilangan bukan nol yang dipangkatkan 0 selalu bernilai sama.',
        steps: [
          `Karena x ≠ 0, maka ${b2}x ≠ 0.`,
          `Berdasarkan aturan a^0 = 1 untuk setiap a ≠ 0, maka (${b2}x)^0 = 1.`,
        ],
      },
      {
        id: `t1-q3-${Date.now()}`,
        tier: 1,
        contextLabel: 'Pangkat Bulat Negatif',
        prompt: `Nyatakan ${b3}^(-${e3}) dalam bentuk pecahan positif.`,
        mathLatexLike: { expression: `${b3}^-${e3}` },
        ...q3Shuffled,
        hint: 'Pangkat negatif bukan berarti hasilnya negatif, melainkan kebalikan (1 per pangkat positifnya).',
        steps: [
          `Gunakan aturan a^(-n) = 1 / a^n.`,
          `${b3}^(-${e3}) = 1 / ${b3}^${e3} = 1 / ${denom3}.`,
        ],
      },
      {
        id: `t1-q4-${Date.now()}`,
        tier: 1,
        contextLabel: 'Basis Bilangan Negatif',
        prompt: `Tentukan hasil dari (-${b4})^${e4}.`,
        mathLatexLike: { expression: `(-${b4})^${e4}` },
        ...q4Shuffled,
        hint: `Tanda kurung berarti bilangan pokoknya adalah -${b4}, lalu dikalikan sebanyak ${e4} kali (pangkat ganjil).`,
        steps: [
          `(-${b4})^${e4} = (-${b4}) × (-${b4}) × (-${b4})`,
          `(-${b4}) × (-${b4}) = +${b4 * b4}, lalu dikalikan (-${b4}) menghasilkan ${ans4}.`,
        ],
      },
      {
        id: `t1-q5-${Date.now()}`,
        tier: 1,
        contextLabel: 'Urutan Operasi & Tanda Minus',
        prompt: `Hati-hati dengan tanda kurung! Berapakah nilai dari -${b5}^2?`,
        mathLatexLike: { expression: `-${b5}^2` },
        ...q5Shuffled,
        hint: `Tanpa tanda kurung, pangkat bekerja lebih dulu pada ${b5}, baru kemudian dikalikan tanda negatif.`,
        steps: [
          `-${b5}^2 berarti -( ${b5} × ${b5} ), bukan (-${b5}) × (-${b5}).`,
          `Jadi -${b5}^2 = -(${b5 * b5}) = -${b5 * b5}.`,
        ],
      },
    ];
  }

  if (tier === 2) {
    const a1 = [2, 3, 5][Math.floor(Math.random() * 3)];
    const m1 = Math.floor(Math.random() * 3) + 2; // 2..4
    const n1 = Math.floor(Math.random() * 3) + 3; // 3..5
    const q1 = shuffleWithCorrect(`${a1}^${m1 + n1}`, [
      `${a1}^${m1 * n1}`,
      `${a1 * 2}^${m1 + n1}`,
      `${a1}^${Math.abs(m1 - n1)}`,
    ]);

    const a2 = [3, 4, 7][Math.floor(Math.random() * 3)];
    const m2 = Math.floor(Math.random() * 3) + 6; // 6..8
    const n2 = Math.floor(Math.random() * 3) + 2; // 2..4
    const q2 = shuffleWithCorrect(`${a2}^${m2 - n2}`, [
      `${a2}^${m2 + n2}`,
      `1^${m2 - n2}`,
      `${a2}^${Math.round(m2 / n2)}`,
    ]);

    const a3 = [2, 5, 6][Math.floor(Math.random() * 3)];
    const m3 = Math.floor(Math.random() * 2) + 2; // 2..3
    const n3 = Math.floor(Math.random() * 2) + 3; // 3..4
    const q3 = shuffleWithCorrect(`${a3}^${m3 * n3}`, [
      `${a3}^${m3 + n3}`,
      `${a3}^${Math.pow(m3, n3)}`,
      `${a3 * n3}^${m3}`,
    ]);

    const q4 = shuffleWithCorrect('8x^6', ['6x^6', '8x^5', '2x^6']);

    const p5 = 4;
    const q5 = shuffleWithCorrect(`${p5}^1`, [`${p5}^7`, `${p5}^12`, `${p5}^-1`]);

    return [
      {
        id: `t2-q1-${Date.now()}`,
        tier: 2,
        contextLabel: 'Hukum Perkalian Basis Sama',
        prompt: `Sederhanakan bentuk ${a1}^${m1} × ${a1}^${n1}.`,
        mathLatexLike: { expression: `${a1}^${m1} × ${a1}^${n1}` },
        ...q1,
        hint: 'Jika bilangan pokoknya sama dan operasinya perkalian, jumlahkan pangkatnya.',
        steps: [
          `Gunakan sifat a^m × a^n = a^(m + n).`,
          `${a1}^${m1} × ${a1}^${n1} = ${a1}^(${m1} + ${n1}) = ${a1}^${m1 + n1}.`,
        ],
      },
      {
        id: `t2-q2-${Date.now()}`,
        tier: 2,
        contextLabel: 'Hukum Pembagian Basis Sama',
        prompt: `Sederhanakan bentuk ${a2}^${m2} ÷ ${a2}^${n2}.`,
        mathLatexLike: { expression: `${a2}^${m2} ÷ ${a2}^${n2}` },
        ...q2,
        hint: 'Pada pembagian dengan basis yang sama, pangkat pembilang dikurangi pangkat penyebut.',
        steps: [
          `Gunakan sifat a^m ÷ a^n = a^(m - n).`,
          `${a2}^${m2} ÷ ${a2}^${n2} = ${a2}^(${m2} - ${n2}) = ${a2}^${m2 - n2}.`,
        ],
      },
      {
        id: `t2-q3-${Date.now()}`,
        tier: 2,
        contextLabel: 'Pangkat dari Pangkat',
        prompt: `Bentuk sederhana dari (${a3}^${m3})^${n3} adalah...`,
        mathLatexLike: { expression: `(${a3}^${m3})^${n3}` },
        ...q3,
        hint: 'Pangkat yang dipangkatkan lagi berarti eksponennya dikalikan, bukan dijumlahkan.',
        steps: [
          `Gunakan sifat (a^m)^n = a^(m × n).`,
          `(${a3}^${m3})^${n3} = ${a3}^(${m3} × ${n3}) = ${a3}^${m3 * n3}.`,
        ],
      },
      {
        id: `t2-q4-${Date.now()}`,
        tier: 2,
        contextLabel: 'Pangkat dari Perkalian Aljabar',
        prompt: 'Sederhanakan ekspresi (2x^2)^3.',
        mathLatexLike: { expression: '(2x^2)^3' },
        ...q4,
        hint: 'Pangkat 3 di luar tanda kurung berlaku untuk koefisien 2 maupun variabel x^2.',
        steps: [
          `(2x^2)^3 = 2^3 × (x^2)^3`,
          `2^3 = 8 dan (x^2)^3 = x^(2 × 3) = x^6.`,
          `Jadi hasilnya 8x^6.`,
        ],
      },
      {
        id: `t2-q5-${Date.now()}`,
        tier: 2,
        contextLabel: 'Gabungan Sifat Eksponen',
        prompt: `Sederhanakan (${p5}^3 × ${p5}^(-2)).`,
        mathLatexLike: { expression: `${p5}^3 × ${p5}^(-2)` },
        ...q5,
        hint: 'Tetap gunakan aturan penjumlahan eksponen meskipun salah satu pangkat bernilai negatif.',
        steps: [
          `${p5}^3 × ${p5}^(-2) = ${p5}^(3 + (-2))`,
          `3 + (-2) = 1, sehingga hasilnya ${p5}^1 (atau ${p5}).`,
        ],
      },
    ];
  }

  // Tier 3: Persamaan & Aplikasi Eksponen
  const xTarget1 = Math.floor(Math.random() * 3) + 4; // 4..6
  const val1 = Math.pow(2, xTarget1);
  const q1 = shuffleWithCorrect(`x = ${xTarget1}`, [
    `x = ${xTarget1 - 1}`,
    `x = ${xTarget1 + 1}`,
    `x = ${val1 / 2}`,
  ]);

  const xTarget2 = Math.floor(Math.random() * 2) + 2; // 2..3
  const rhsExp = 2 * xTarget2 + 1;
  const q2 = shuffleWithCorrect(`x = ${xTarget2}`, [
    `x = ${xTarget2 + 1}`,
    `x = ${rhsExp}`,
    `x = ${xTarget2 - 1}`,
  ]);

  const n0 = [5, 10, 20][Math.floor(Math.random() * 3)];
  const cycles = 4;
  const bacteriaFinal = n0 * Math.pow(2, cycles);
  const q3 = shuffleWithCorrect(`${bacteriaFinal} sel`, [
    `${n0 * cycles * 2} sel`,
    `${n0 * Math.pow(2, cycles - 1)} sel`,
    `${n0 + Math.pow(2, cycles)} sel`,
  ]);

  const q4 = shuffleWithCorrect('27', ['9', '18', '81']);
  const q5 = shuffleWithCorrect('25 gram', ['50 gram', '12,5 gram', '100 gram']);

  return [
    {
      id: `t3-q1-${Date.now()}`,
      tier: 3,
      contextLabel: 'Persamaan Eksponen Sederhana',
      prompt: `Tentukan nilai x yang memenuhi persamaan 2^x = ${val1}.`,
      mathLatexLike: { expression: `2^x = ${val1}` },
      ...q1,
      hint: `Ubah ${val1} menjadi bilangan berpangkat dengan basis 2.`,
      steps: [
        `Ubah ruas kanan ke basis 2: ${val1} = 2^${xTarget1}.`,
        `Sehingga 2^x = 2^${xTarget1}. Karena basis sudah sama, maka x = ${xTarget1}.`,
      ],
    },
    {
      id: `t3-q2-${Date.now()}`,
      tier: 3,
      contextLabel: 'Persamaan Linear dalam Pangkat',
      prompt: `Jika 3^(2x + 1) = 3^${rhsExp}, maka nilai x adalah...`,
      mathLatexLike: { expression: `3^(2x + 1) = 3^${rhsExp}` },
      ...q2,
      hint: 'Karena bilangan pokok di kedua ruas sudah sama (basis 3), samakan kedua pangkatnya.',
      steps: [
        `Samakan pangkat: 2x + 1 = ${rhsExp}`,
        `2x = ${rhsExp - 1}`,
        `x = ${(rhsExp - 1) / 2}`,
      ],
    },
    {
      id: `t3-q3-${Date.now()}`,
      tier: 3,
      contextLabel: 'Model Pertumbuhan Bakteri',
      prompt: `Koloni awal berisi ${n0} bakteri dan membelah menjadi dua setiap 30 menit. Berapa jumlah bakteri setelah 2 jam?`,
      ...q3,
      hint: '2 jam = 120 menit. Hitung berapa kali pembelahan terjadi setiap 30 menit (n = 120 / 30).',
      steps: [
        `Banyak fase pembelahan: 120 menit ÷ 30 menit = ${cycles} kali.`,
        `Gunakan model N = ${n0} × 2^${cycles} = ${n0} × ${Math.pow(2, cycles)} = ${bacteriaFinal} sel.`,
      ],
    },
    {
      id: `t3-q4-${Date.now()}`,
      tier: 3,
      contextLabel: 'Eksponen Pecahan (Rasional)',
      prompt: 'Hitung nilai dari 9^(3/2).',
      mathLatexLike: { expression: '9^(3/2)' },
      ...q4,
      hint: 'Ingat sifat a^(m/n) = (akar pangkat n dari a)^m. Hitung akar kuadrat dari 9 terlebih dahulu.',
      steps: [
        `9^(3/2) = (√9)^3`,
        `√9 = 3, lalu 3^3 = 27.`,
      ],
    },
    {
      id: `t3-q5-${Date.now()}`,
      tier: 3,
      contextLabel: 'Peluruhan Eksponensial (Waktu Paruh)',
      prompt: 'Massa awal zat adalah 200 gram dan meluruh menjadi setengahnya setiap hari. Berapa massa tersisa setelah 3 hari?',
      ...q5,
      hint: 'Gunakan rumus peluruhan M = 200 × (1/2)^3.',
      steps: [
        `Setelah 3 hari: M = 200 × (1/2)^3`,
        `(1/2)^3 = 1/8, sehingga M = 200 ÷ 8 = 25 gram.`,
      ],
    },
  ];
}
