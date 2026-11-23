export type TopicKey =
  | 'syarat-basis'
  | 'dasar-nol-negatif'
  | 'sifat-eksponen'
  | 'persamaan-eksponen'
  | 'aplikasi-nyata';

export interface BankQuestion {
  id: string;
  topic: TopicKey;
  topicLabel: string;
  difficulty: 'Dasar' | 'Menengah' | 'Tantangan';
  prompt: string;
  options: string[];
  correctIndex: number;
  hint: string;
  steps: string[];
}

export const TOPIC_LABELS: Record<TopicKey, string> = {
  'syarat-basis': 'Syarat Basis & Kesamaan Pangkat',
  'dasar-nol-negatif': 'Definisi, Pangkat Nol & Negatif',
  'sifat-eksponen': 'Sifat-Sifat Operasi Eksponen',
  'persamaan-eksponen': 'Persamaan Eksponen',
  'aplikasi-nyata': 'Aplikasi Pertumbuhan & Peluruhan',
};

function shuffleOptions(correct: string, distractors: string[]): {
  options: string[];
  correctIndex: number;
} {
  const unique = Array.from(new Set(distractors.filter((d) => d !== correct))).slice(0, 3);
  while (unique.length < 3) {
    unique.push(`${unique.length + 7}`);
  }
  const all = [correct, ...unique];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return {
    options: all,
    correctIndex: all.indexOf(correct),
  };
}

function makeFixedItem(
  id: string,
  topic: TopicKey,
  difficulty: 'Dasar' | 'Menengah' | 'Tantangan',
  prompt: string,
  correct: string,
  distractors: [string, string, string],
  hint: string,
  steps: string[],
  deterministicOrder = 0
): BankQuestion {
  const all = [correct, ...distractors];
  const shift = deterministicOrder % 4;
  const rotated = [...all.slice(shift), ...all.slice(0, shift)];
  return {
    id,
    topic,
    topicLabel: TOPIC_LABELS[topic],
    difficulty,
    prompt,
    options: rotated,
    correctIndex: rotated.indexOf(correct),
    hint,
    steps,
  };
}

function buildCuratedBank(): BankQuestion[] {
  const items: BankQuestion[] = [];
  let seq = 1;

  // =========================================================================
  // 1. SYARAT BASIS & KESAMAAN PANGKAT (30 Soal Terkurasi)
  // =========================================================================
  items.push(
    makeFixedItem(
      `SB-${seq++}`,
      'syarat-basis',
      'Dasar',
      'Diketahui 1^x = 1^5. Kesimpulan yang benar tentang nilai x adalah...',
      'Semua bilangan real x memenuhi karena basisnya 1',
      ['Hanya x = 5 yang memenuhi', 'Hanya x = 1 yang memenuhi', 'Tidak ada nilai x yang memenuhi'],
      'Jika basis bernilai 1, pangkatnya tidak harus sama karena 1 dipangkatkan berapa pun selalu 1.',
      ['Basis persamaan adalah a = 1.', 'Aturan a^f(x) = a^g(x) ⇒ f(x) = g(x) HANYA berlaku jika a > 0 dan a ≠ 1.', 'Karena 1^x = 1 untuk semua x ∈ ℝ, maka semua bilangan real x memenuhi.'],
      1
    ),
    makeFixedItem(
      `SB-${seq++}`,
      'syarat-basis',
      'Dasar',
      'Syarat basis a agar persamaan a^f(x) = a^g(x) PASTI menghasilkan f(x) = g(x) untuk setiap fungsi real adalah...',
      'a > 0 dan a ≠ 1',
      ['a ≥ 0 untuk semua a', 'a ≠ 0 saja sudah cukup', 'a bilangan bulat positif termasuk 1'],
      'Fungsi y = a^x hanya bersifat satu-ke-satu (injektif) saat basis positif dan bukan 1.',
      ['Jika a = 1, garis grafik y = 1^x mendatar sehingga banyak x punya hasil sama.', 'Jika a = 0 atau a < 0, ada pengecualian atau tidak terdefinisi kontinu.', 'Jadi syarat wajib agar kesamaan pangkat tunggal berlaku adalah a > 0 dan a ≠ 1.'],
      2
    ),
    makeFixedItem(
      `SB-${seq++}`,
      'syarat-basis',
      'Dasar',
      'Manakah pernyataan yang SALAH mengenai persamaan (-1)^m = (-1)^n?',
      'Pasti berlaku m = n',
      ['Benar jika m = 2 dan n = 4', 'Benar jika m = 3 dan n = 7', 'Salah jika m = 2 dan n = 3'],
      'Basis -1 menghasilkan +1 untuk pangkat genap dan -1 untuk pangkat ganjil.',
      ['(-1)^2 = 1 dan (-1)^4 = 1, sehingga (-1)^2 = (-1)^4 benar walau 2 ≠ 4.', 'Begitu juga (-1)^3 = (-1)^7 = -1.', 'Artinya kesamaan pangkat tidak memaksa m = n saat basis = -1.'],
      3
    ),
    makeFixedItem(
      `SB-${seq++}`,
      'syarat-basis',
      'Dasar',
      'Agar persamaan 0^f(x) = 0^g(x) bernilai benar (0 = 0) tanpa harus f(x) = g(x), syarat pangkatnya adalah...',
      'f(x) > 0 dan g(x) > 0',
      ['f(x) ≥ 0 dan g(x) ≥ 0', 'f(x) < 0 dan g(x) < 0', 'Tidak perlu syarat apa pun'],
      'Ingat bahwa 0^0 tak tentu dan 0 pangkat negatif tidak terdefinisi.',
      ['Jika basis = 0 dan pangkat positif (> 0), hasilnya selalu 0.', 'Jika pangkat ≤ 0, bentuk 0^0 atau 1/0^k tidak terdefinisi.', 'Jadi syaratnya adalah f(x) > 0 dan g(x) > 0.'],
      0
    ),
    makeFixedItem(
      `SB-${seq++}`,
      'syarat-basis',
      'Menengah',
      'Tentukan semua nilai x yang memenuhi (x - 2)^(x + 1) = (x - 2)^4 dengan mempertimbangkan syarat basis = 1 dan pangkat sama.',
      'x = 3',
      ['x = 3 dan x = 2', 'Hanya x = 2', 'x = 3 dan x = 1'],
      'Uji pangkat sama (x + 1 = 4), lalu uji basis = 1, basis = 0, dan basis = -1.',
      ['1) Pangkat sama: x + 1 = 4 ⇒ x = 3.', '2) Basis = 1: x - 2 = 1 ⇒ x = 3 (nilai sama).', '3) Basis = 0: x = 2 ⇒ cek pangkat: 2+1=3 > 0 dan 4 > 0? Tunggu, 0^3 = 0^4 ⇒ x = 2 juga? Cek pilihan: x=3 vs lainnya—perhatikan soal fokus pada basis = 1 atau cek ulang opsi!'],
      1
    )
  );

  // Replace item 5 with mathematically unambiguous question and add 25 more precise Basis-Condition questions
  items.pop();
  seq--;

  const sbTemplates: Array<{
    diff: 'Dasar' | 'Menengah' | 'Tantangan';
    prompt: string;
    correct: string;
    distractors: [string, string, string];
    hint: string;
    steps: string[];
  }> = [
    {
      diff: 'Menengah',
      prompt: 'Tentukan himpunan penyelesaian dari (x - 1)^(2x - 4) = (x - 1)^(x + 1).',
      correct: '{0, 2, 5}',
      distractors: ['{5}', '{2, 5}', '{0, 1, 2, 5}'],
      hint: 'Periksa 4 kasus untuk h(x)^f(x) = h(x)^g(x): (1) f=g, (2) h=1, (3) h=0 dengan f,g>0, (4) h=-1 dengan paritas f,g sama.',
      steps: [
        '1) f(x) = g(x): 2x - 4 = x + 1 ⇒ x = 5.',
        '2) h(x) = 1: x - 1 = 1 ⇒ x = 2.',
        '3) h(x) = 0: x = 1 ⇒ f(1) = -2 (negatif, gagal karena 0^-2 tak terdefinisi).',
        '4) h(x) = -1: x = 0 ⇒ f(0) = -4 (genap) dan g(0) = 1 (ganjil) -> tunggu: (-1)^-4 = 1, (-1)^1 = -1 (gagal). Cek ulang untuk soal ini!',
      ],
    },
  ];
  // Wait—always verify every single step mathematically before adding! Let's replace with 100% verified algebraic problems.
  sbTemplates.length = 0;

  const verifiedBasisProblems: Array<{
    diff: 'Dasar' | 'Menengah' | 'Tantangan';
    prompt: string;
    correct: string;
    distractors: [string, string, string];
    hint: string;
    steps: string[];
  }> = [
    {
      diff: 'Menengah',
      prompt: 'Tentukan himpunan penyelesaian dari (x - 1)^(x + 2) = (x - 1)^6.',
      correct: '{0, 2, 4}',
      distractors: ['{4}', '{1, 2, 4}', '{2, 4}'],
      hint: 'Uji 4 kemungkinan: pangkat sama, basis = 1, basis = 0 (pangkat > 0), dan basis = -1 (paritas sama).',
      steps: [
        '1) Pangkat sama: x + 2 = 6 ⇒ x = 4.',
        '2) Basis = 1: x - 1 = 1 ⇒ x = 2.',
        '3) Basis = 0: x = 1 ⇒ 0^3 = 0^6 (benar? Wait: 1+2=3 > 0 dan 6 > 0! Maka x=1 juga memenuhi!).',
        'Jadi {0, 1, 2, 4} jika h=0 diizinkan! Mari gunakan basis (x - 1) dengan f(x) = x - 3 agar di x = 1 pangkatnya negatif!',
      ],
    },
  ];
  verifiedBasisProblems.length = 0;

  // Let's write a helper that algebraically computes & verifies h(x)^f(x) = h(x)^g(x) automatically in code!
  // For h(x) = x - k, f(x) = a1*x + b1, g(x) = a2*x + b2
  const basisCases: Array<{
    k: number;
    a1: number;
    b1: number;
    a2: number;
    b2: number;
    diff: 'Dasar' | 'Menengah' | 'Tantangan';
  }> = [
    { k: 3, a1: 1, b1: 1, a2: 0, b2: 5, diff: 'Menengah' }, // (x-3)^(x+1) = (x-3)^5
    { k: 2, a1: 2, b1: -3, a2: 1, b2: 2, diff: 'Menengah' }, // (x-2)^(2x-3) = (x-2)^(x+2)
    { k: 4, a1: 1, b1: -2, a2: 0, b2: 3, diff: 'Menengah' }, // (x-4)^(x-2) = (x-4)^3
    { k: 1, a1: 2, b1: 1, a2: 1, b2: 4, diff: 'Menengah' }, // (x-1)^(2x+1) = (x-1)^(x+4)
    { k: 5, a1: 1, b1: -4, a2: 0, b2: 2, diff: 'Tantangan' }, // (x-5)^(x-4) = (x-5)^2
    { k: -1, a1: 2, b1: 0, a2: 1, b2: 3, diff: 'Tantangan' }, // (x+1)^(2x) = (x+1)^(x+3)
    { k: -2, a1: 1, b1: 3, a2: 0, b2: 6, diff: 'Menengah' }, // (x+2)^(x+3) = (x+2)^6
    { k: 3, a1: 2, b1: -5, a2: 1, b2: 1, diff: 'Tantangan' }, // (x-3)^(2x-5) = (x-3)^(x+1)
    { k: 2, a1: 3, b1: -4, a2: 1, b2: 4, diff: 'Tantangan' }, // (x-2)^(3x-4) = (x-2)^(x+4)
    { k: 4, a1: 2, b1: -1, a2: 1, b2: 5, diff: 'Tantangan' }, // (x-4)^(2x-1) = (x-4)^(x+5)
  ];

  basisCases.forEach((c, idx) => {
    const h = (x: number) => x - c.k;
    const f = (x: number) => c.a1 * x + c.b1;
    const g = (x: number) => c.a2 * x + c.b2;

    const sols = new Set<number>();
    const steps: string[] = [];

    // 1. f(x) = g(x)
    const xSame = (c.b2 - c.b1) / (c.a1 - c.a2);
    if (Number.isInteger(xSame)) {
      if (!(h(xSame) === 0 && f(xSame) <= 0)) {
        sols.add(xSame);
      }
      steps.push(`1) Samakan pangkat: ${c.a1 === 1 ? 'x' : c.a1 + 'x'} ${c.b1 >= 0 ? '+ ' + c.b1 : '- ' + Math.abs(c.b1)} = ${c.a2 === 0 ? c.b2 : (c.a2 === 1 ? 'x' : c.a2 + 'x') + (c.b2 >= 0 ? ' + ' + c.b2 : ' - ' + Math.abs(c.b2))} ⇒ x = ${xSame}.`);
    }

    // 2. h(x) = 1
    const xOne = c.k + 1;
    sols.add(xOne);
    steps.push(`2) Syarat basis = 1: ${c.k >= 0 ? `x - ${c.k}` : `x + ${Math.abs(c.k)}`} = 1 ⇒ x = ${xOne} (memenuhi).`);

    // 3. h(x) = 0 (requires f > 0 and g > 0)
    const xZero = c.k;
    const f0 = f(xZero);
    const g0 = g(xZero);
    if (f0 > 0 && g0 > 0) {
      sols.add(xZero);
      steps.push(`3) Syarat basis = 0: x = ${xZero}, cek pangkat f(${xZero}) = ${f0} > 0 dan g(${xZero}) = ${g0} > 0 (memenuhi).`);
    } else {
      steps.push(`3) Syarat basis = 0: x = ${xZero}, cek pangkat f(${xZero}) = ${f0} dan g(${xZero}) = ${g0} (gagal karena ada pangkat ≤ 0).`);
    }

    // 4. h(x) = -1 (requires same parity)
    const xNegOne = c.k - 1;
    const fn = f(xNegOne);
    const gn = g(xNegOne);
    const sameParity = Math.abs(fn % 2) === Math.abs(gn % 2);
    if (sameParity) {
      sols.add(xNegOne);
      steps.push(`4) Syarat basis = -1: x = ${xNegOne}, pangkat f(${xNegOne}) = ${fn} dan g(${xNegOne}) = ${gn} berparitas sama (memenuhi).`);
    } else {
      steps.push(`4) Syarat basis = -1: x = ${xNegOne}, pangkat f(${xNegOne}) = ${fn} dan g(${xNegOne}) = ${gn} berparitas berbeda (gagal).`);
    }

    const sorted = Array.from(sols).sort((a, b) => a - b);
    const correctStr = `{${sorted.join(', ')}}`;
    const onlySame = `{${xSame}}`;
    const withZeroForced = `{${Array.from(new Set([...sorted, xZero])).sort((a, b) => a - b).join(', ')}}`;
    const withoutOne = `{${sorted.filter((v) => v !== xOne).join(', ') || xSame}}`;
    const withNegForced = `{${Array.from(new Set([...sorted, xNegOne])).sort((a, b) => a - b).join(', ')}}`;

    const dList = [onlySame, withZeroForced === correctStr ? withNegForced : withZeroForced, withoutOne === correctStr ? `{${xOne}, ${xSame}}` : withoutOne];
    // Guarantee 3 distinct distractors
    const finalDistractors: [string, string, string] = [
      dList[0] !== correctStr ? dList[0] : `{${xSame + 1}}`,
      dList[1] !== correctStr && dList[1] !== dList[0] ? dList[1] : `{${xZero}, ${xOne}}`,
      dList[2] !== correctStr && dList[2] !== dList[0] && dList[2] !== dList[1] ? dList[2] : `{${xSame}, ${xSame + 2}}`,
    ];

    const hStr = c.k >= 0 ? `(x - ${c.k})` : `(x + ${Math.abs(c.k)})`;
    const fStr = `${c.a1 === 1 ? 'x' : c.a1 + 'x'}${c.b1 === 0 ? '' : c.b1 > 0 ? ' + ' + c.b1 : ' - ' + Math.abs(c.b1)}`;
    const gStr =
      c.a2 === 0
        ? `${c.b2}`
        : `${c.a2 === 1 ? 'x' : c.a2 + 'x'}${c.b2 === 0 ? '' : c.b2 > 0 ? ' + ' + c.b2 : ' - ' + Math.abs(c.b2)}`;

    items.push(
      makeFixedItem(
        `SB-${seq++}`,
        'syarat-basis',
        c.diff,
        `Tentukan himpunan penyelesaian dari ${hStr}^(${fStr}) = ${hStr}^(${gStr}).`,
        correctStr,
        finalDistractors,
        'Gunakan 4 syarat basis untuk persamaan berbentuk h(x)^f(x) = h(x)^g(x).',
        steps,
        idx
      )
    );
  });

  // Add 16 more conceptual & trap Syarat Basis questions (total = 4 + 10 + 16 = 30)
  const extraSyaratBasis: Array<{
    diff: 'Dasar' | 'Menengah' | 'Tantangan';
    prompt: string;
    correct: string;
    distractors: [string, string, string];
    hint: string;
    steps: string[];
  }> = [
    {
      diff: 'Dasar',
      prompt: 'Mengapa dari persamaan 1^(2x - 3) = 1^(x + 5) kita TIDAK BOLEH langsung menyimpulkan 2x - 3 = x + 5?',
      correct: 'Karena basis 1 membuat kedua ruas selalu bernilai 1 untuk semua x real',
      distractors: [
        'Karena pangkatnya mengandung bilangan negatif',
        'Karena 1^x tidak terdefinisi pada bilangan real',
        'Karena variabel x tidak boleh berada di kedua ruas',
      ],
      hint: 'Uji sembarang nilai x, misalnya x = 0: apakah 1^(-3) sama dengan 1^5?',
      steps: [
        'Untuk x = 0: ruas kiri 1^(-3) = 1 dan ruas kanan 1^5 = 1.',
        'Aturan menyamakan pangkat hanya berlaku jika basis a > 0 dan a ≠ 1.',
      ],
    },
    {
      diff: 'Dasar',
      prompt: 'Pada persamaan 2^(3x - 1) = 2^(x + 5), apakah kita boleh langsung menyamakan pangkatnya?',
      correct: 'Boleh, karena basis 2 memenuhi syarat a > 0 dan a ≠ 1',
      distractors: [
        'Tidak boleh, harus menguji basis = 1 terlebih dahulu',
        'Tidak boleh, karena 2 bukan bilangan ganjil',
        'Boleh hanya jika x bernilai positif',
      ],
      hint: 'Cek apakah basis konstanta 2 memenuhi a > 0 dan a ≠ 1.',
      steps: [
        'Basisnya konstanta a = 2, jelas 2 > 0 dan 2 ≠ 1.',
        'Fungsi 2^u bersifat satu-ke-satu, sehingga 3x - 1 = x + 5 ⇒ x = 3 adalah satu-satunya solusi.',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Diketahui 3^(x - 2) = 5^(x - 2). Nilai x yang memenuhi persamaan tersebut adalah...',
      correct: 'x = 2',
      distractors: ['Tidak ada solusi karena 3 ≠ 5', 'x = 0', 'x = 1'],
      hint: 'Dua bilangan pokok positif yang berbeda (≠ 1) hanya menghasilkan nilai sama jika pangkatnya nol.',
      steps: [
        'Gunakan sifat a^f(x) = b^f(x) untuk a, b > 0, a ≠ b, a,b ≠ 1 ⇒ f(x) = 0.',
        'x - 2 = 0 ⇒ x = 2, karena 3^0 = 1 dan 5^0 = 1.',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Jika 7^(2x - 6) = 11^(2x - 6), maka nilai x adalah...',
      correct: 'x = 3',
      distractors: ['Tidak ada penyelesaian', 'x = 6', 'x = 7/11'],
      hint: 'Berapa pangkat yang membuat 7^p = 11^p = 1?',
      steps: [
        'Karena basis berbeda (7 ≠ 11) dan keduanya > 0, ≠ 1, maka pangkat harus 0.',
        '2x - 6 = 0 ⇒ x = 3.',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Pada persamaan (x - 5)^(x - 5) = (x - 5)^2, mengapa x = 5 BUKAN penyelesaian?',
      correct: 'Karena menghasilkan 0^0 yang tak tentu di ruas kiri',
      distractors: [
        'Karena x = 5 membuat ruas kanan bernilai 25',
        'Karena basis 0 tidak pernah boleh menjadi solusi',
        'Karena 5 adalah bilangan prima',
      ],
      hint: 'Substitusikan x = 5 ke ruas kiri dan kanan secara langsung.',
      steps: [
        'Jika x = 5, basis menjadi 5 - 5 = 0.',
        'Ruas kiri menjadi 0^(5-5) = 0^0 yang tak tentu, sehingga x = 5 ditolak.',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Apakah x = 4 memenuhi persamaan (x - 5)^(x + 2) = (x - 5)^4?',
      correct: 'Ya, karena menghasilkan (-1)^6 = (-1)^4 = 1',
      distractors: [
        'Tidak, karena basisnya negatif (-1)',
        'Tidak, karena 6 ≠ 4',
        'Ya, karena semua basis negatif selalu memenuhi',
      ],
      hint: 'Substitusikan x = 4 ke dalam kedua ruas lalu hitung nilainya.',
      steps: [
        'Basis: 4 - 5 = -1.',
        'Pangkat kiri: 4 + 2 = 6 (genap); pangkat kanan: 4 (genap).',
        '(-1)^6 = 1 dan (-1)^4 = 1, sehingga x = 4 memenuhi!',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Apakah x = 2 memenuhi persamaan (x - 3)^(x + 1) = (x - 3)^4?',
      correct: 'Tidak, karena (-1)^3 = -1 sedangkan (-1)^4 = 1',
      distractors: [
        'Ya, karena basisnya sama-sama -1',
        'Ya, karena -1^3 = 1',
        'Tidak, karena pangkatnya berbeda tanda',
      ],
      hint: 'Periksa paritas (genap atau ganjil) kedua pangkat saat x = 2.',
      steps: [
        'Pada x = 2, basisnya 2 - 3 = -1.',
        'Ruas kiri: (-1)^3 = -1; ruas kanan: (-1)^4 = +1.',
        'Karena -1 ≠ +1, maka x = 2 bukan penyelesaian.',
      ],
    },
    {
      diff: 'Dasar',
      prompt: 'Nilai x yang memenuhi (1/2)^(x + 1) = (1/2)^5 adalah...',
      correct: 'x = 4',
      distractors: [
        'Semua x real karena basis pecahan',
        'x = 6',
        'Tidak ada solusi karena basis < 1',
      ],
      hint: 'Apakah basis 1/2 memenuhi syarat a > 0 dan a ≠ 1?',
      steps: [
        'Basis a = 1/2 memenuhi 0 < 1/2 < ∞ dan 1/2 ≠ 1.',
        'Jadi fungsi (1/2)^x tetap injektif: x + 1 = 5 ⇒ x = 4.',
      ],
    },
    {
      diff: 'Tantangan',
      prompt: 'Banyak bilangan bulat x yang memenuhi (x^2 - 3)^(x + 1) = (x^2 - 3)^3 adalah...',
      correct: '4 bilangan (x = -2, -1, 2, 3? Cek: hitung tepat: -2, 2, 2? Mari hitung: x+1=3 -> x=2; x^2-3=1 -> x=±2; x^2-3=-1 -> x^2=2 tak bulat; x^2-3=0 tak bulat)',
      distractors: ['1 bilangan', '2 bilangan', '3 bilangan'],
      hint: 'Selesaikan x+1=3 dan x^2-3=1.',
      steps: ['...'],
    },
  ];
  // Replace last item cleanly with exact integer solution check!
  extraSyaratBasis.pop();

  extraSyaratBasis.push(
    {
      diff: 'Tantangan',
      prompt: 'Banyak nilai real x yang memenuhi (x^2 - 3)^(x + 1) = (x^2 - 3)^3 adalah...',
      correct: '2 nilai (x = -2 dan x = 2)',
      distractors: ['1 nilai (hanya x = 2)', '3 nilai', '4 nilai'],
      hint: 'Uji pangkat sama (x+1=3), basis = 1 (x^2-3=1), dan cek apakah basis = 0 atau -1 menghasilkan nilai sama.',
      steps: [
        '1) Pangkat sama: x + 1 = 3 ⇒ x = 2.',
        '2) Basis = 1: x^2 - 3 = 1 ⇒ x^2 = 4 ⇒ x = 2 atau x = -2.',
        '3) Basis = 0: x = ±√3 ⇒ pangkat kiri √3+1 > 0 dan -√3+1 < 0 (hanya √3 yang 0^+=0^+? Tunggu, ganti basis agar rasional bersih!).',
      ],
    }
  );
  extraSyaratBasis.pop();

  // Add 8 clean, 100% unambiguous extra Syarat Basis questions to reach 30 total
  const cleanExtras: typeof extraSyaratBasis = [
    {
      diff: 'Tantangan',
      prompt: 'Tentukan nilai x yang memenuhi (2x - 1)^(x - 3) = (2x - 1)^2 jika syarat basis = 1 juga dihitung.',
      correct: 'x = 1 dan x = 5',
      distractors: ['Hanya x = 5', 'x = 1/2, 1, dan 5', 'Hanya x = 1'],
      hint: 'Cek pangkat sama (x - 3 = 2), basis = 1 (2x - 1 = 1), basis = 0 (2x - 1 = 0), dan basis = -1 (2x - 1 = -1).',
      steps: [
        '1) Pangkat sama: x - 3 = 2 ⇒ x = 5.',
        '2) Basis = 1: 2x - 1 = 1 ⇒ x = 1.',
        '3) Basis = 0: x = 1/2 ⇒ pangkat kiri 1/2 - 3 = -2,5 < 0 (gagal).',
        '4) Basis = -1: x = 0 ⇒ pangkat kiri -3 (ganjil), kanan 2 (genap) ⇒ gagal. Jadi solusinya x = 1 dan x = 5.',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Siswa menuliskan: "Karena 1^(x^2) = 1^9, maka x = ±3". Kesalahan siswa tersebut adalah...',
      correct: 'Menerapkan kesamaan pangkat pada basis 1 yang tidak injektif',
      distractors: [
        'Akar dari 9 seharusnya hanya +3',
        '1^9 seharusnya bernilai 9',
        'Pangkat kuadrat tidak boleh disamakan dengan konstanta',
      ],
      hint: 'Apakah x = 0 juga membuat 1^(0^2) = 1^9 benar?',
      steps: [
        'Untuk basis a = 1, 1^(x^2) = 1 untuk SEMUA x ∈ ℝ.',
        'Jadi himpunan penyelesaiannya adalah seluruh bilangan real, bukan hanya ±3.',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Agar grafik y = a^x dapat digunakan untuk menyimpulkan a^p = a^q ⇒ p = q melalui uji garis horizontal, grafik tersebut harus...',
      correct: 'Monoton naik atau monoton turun (satu-ke-satu)',
      distractors: [
        'Memotong sumbu-x di titik (1, 0)',
        'Berbentuk garis mendatar y = 1',
        'Memiliki basis negatif agar simetris',
      ],
      hint: 'Uji garis horizontal memotong grafik paling banyak satu kali jika fungsi terus naik atau terus turun.',
      steps: [
        'Jika a > 1, fungsi monoton naik; jika 0 < a < 1, fungsi monoton turun.',
        'Keduanya memastikan tiap nilai y hanya berpasangan dengan tepat satu nilai x.',
      ],
    },
    {
      diff: 'Dasar',
      prompt: 'Nilai x yang memenuhi (0,25)^(2x - 2) = (0,25)^4 adalah...',
      correct: 'x = 3',
      distractors: ['Semua x real', 'x = 1', 'Tidak ada penyelesaian'],
      hint: 'Basis 0,25 bernilai positif dan bukan 1, jadi pangkat dapat langsung disamakan.',
      steps: [
        'Karena 0,25 > 0 dan 0,25 ≠ 1, maka 2x - 2 = 4.',
        '2x = 6 ⇒ x = 3.',
      ],
    },
    {
      diff: 'Tantangan',
      prompt: 'Manakah nilai x yang memenuhi (x - 4)^(x - 1) = (x - 4)^3 sekaligus berasal dari kasus basis = 0?',
      correct: 'x = 4',
      distractors: ['x = 5', 'x = 3', 'Tidak ada karena basis 0 selalu ditolak'],
      hint: 'Substitusikan x = 4 dan periksa apakah kedua pangkat bernilai positif.',
      steps: [
        'Saat x = 4, basis = 0.',
        'Pangkat kiri: 4 - 1 = 3 > 0; pangkat kanan: 3 > 0.',
        '0^3 = 0^3 bernilai 0 = 0, sehingga x = 4 memenuhi.',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Pada persamaan 4^(x + 1) = 8^(x - 1), langkah pertama sebelum menyamakan pangkat adalah...',
      correct: 'Menyamakan kedua basis menjadi basis positif ≠ 1, yaitu 2',
      distractors: [
        'Langsung menyamakan x + 1 = x - 1',
        'Menganggap x = 0 karena 4 ≠ 8',
        'Mengalikan pangkat dengan 4 dan 8',
      ],
      hint: '4 dan 8 sama-sama merupakan bilangan berpangkat dari basis 2.',
      steps: [
        'Ubah 4 = 2^2 dan 8 = 2^3 sehingga 2^(2x + 2) = 2^(3x - 3).',
        'Karena basis 2 > 0 dan ≠ 1, maka 2x + 2 = 3x - 3 ⇒ x = 5.',
      ],
    },
    {
      diff: 'Tantangan',
      prompt: 'Penyelesaian dari persamaan 5^(x^2 - 4) = 9^(x^2 - 4) adalah...',
      correct: 'x = -2 atau x = 2',
      distractors: ['Tidak ada solusi', 'Hanya x = 2', 'x = 0'],
      hint: 'Basis 5 dan 9 berbeda, positif, dan bukan 1. Kapan 5^p = 9^p?',
      steps: [
        '5^p = 9^p hanya benar saat p = 0.',
        'x^2 - 4 = 0 ⇒ x^2 = 4 ⇒ x = -2 atau x = 2.',
      ],
    },
    {
      diff: 'Dasar',
      prompt: 'Jika a = 0 dan n = -3, berapakah nilai a^n?',
      correct: 'Tak terdefinisi',
      distractors: ['0', '1', '-3'],
      hint: 'Ingat bahwa a^(-n) = 1 / a^n.',
      steps: [
        '0^(-3) = 1 / 0^3 = 1 / 0.',
        'Pembagian dengan nol tidak terdefinisi.',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Manakah pasangan (a, m, n) yang membuktikan bahwa a^m = a^n TIDAK selalu berarti m = n?',
      correct: 'a = -1, m = 2, n = 6',
      distractors: ['a = 2, m = 2, n = 6', 'a = 3, m = 1, n = 3', 'a = 0,5, m = 2, n = 4'],
      hint: 'Cari nilai a yang melanggar syarat a > 0 dan a ≠ 1 sekaligus menghasilkan nilai sama untuk m ≠ n.',
      steps: [
        '(-1)^2 = 1 dan (-1)^6 = 1, padahal 2 ≠ 6.',
        'Hal ini membuktikan basis -1 tidak injektif.',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Jika (x + 3)^(x - 1) = (x + 3)^2, berapakah nilai x yang diperoleh khusus dari syarat basis = 1?',
      correct: 'x = -2',
      distractors: ['x = 3', 'x = -3', 'x = -4'],
      hint: 'Buat basis x + 3 sama dengan 1.',
      steps: [
        'x + 3 = 1 ⇒ x = -2.',
        'Uji: (-2 + 3)^(-3) = 1^(-3) = 1 dan 1^2 = 1.',
      ],
    },
    {
      diff: 'Tantangan',
      prompt: 'Mengapa pada kasus basis h(x) = -1, kita harus memeriksa apakah f(x) dan g(x) sama-sama genap atau sama-sama ganjil?',
      correct: 'Karena (-1)^genap = +1 sedangkan (-1)^ganjil = -1',
      distractors: [
        'Karena bilangan negatif tidak boleh dipangkatkan bilangan ganjil',
        'Karena (-1)^0 = -1',
        'Agar nilai h(x) berubah menjadi +1',
      ],
      hint: 'Bandingkan nilai (-1)^2 dengan (-1)^3.',
      steps: [
        'Jika kedua pangkat sama-sama genap, kedua ruas bernilai +1 (sama).',
        'Jika kedua pangkat sama-sama ganjil, kedua ruas bernilai -1 (sama).',
        'Jika berbeda paritas, hasilnya +1 ≠ -1 sehingga gagal.',
      ],
    },
    {
      diff: 'Dasar',
      prompt: 'Pada persamaan 10^(x + 2) = 1000, apakah kita perlu memeriksa kasus basis = 1 atau basis = -1?',
      correct: 'Tidak perlu, karena basis 10 sudah tetap (> 0 dan ≠ 1)',
      distractors: [
        'Ya, wajib diuji semua 4 kasus',
        'Ya, wajib menguji basis = 0',
        'Tidak perlu hanya jika pangkatnya > 0',
      ],
      hint: 'Periksa apakah basis mengandung variabel x atau berupa konstanta tetap 10.',
      steps: [
        '1000 = 10^3, sehingga 10^(x+2) = 10^3.',
        'Basisnya konstanta 10 (> 0, ≠ 1), maka langsung x + 2 = 3 ⇒ x = 1.',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Berapa banyak solusi real dari persamaan 1^(x^2 - 5x + 6) = 1?',
      correct: 'Tak hingga banyaknya (semua x real)',
      distractors: ['2 solusi (x = 2 dan x = 3)', '1 solusi', 'Tidak ada solusi'],
      hint: 'Apakah nilai 1 dipangkatkan bilangan real apa pun pernah menghasilkan selain 1?',
      steps: [
        'Untuk setiap x ∈ ℝ, x^2 - 5x + 6 adalah bilangan real.',
        '1 dipangkatkan bilangan real berapa pun selalu 1.',
      ],
    },
    {
      diff: 'Tantangan',
      prompt: 'Diketahui (x - 2)^(x + 5) = (x - 2)^2. Nilai x yang berasal dari syarat basis = -1 adalah...',
      correct: 'Tidak memenuhi karena (-1)^6 = 1 ≠ (-1)^2? Tunggu: 1+5=6 genap, 2 genap -> x=1 memenuhi!',
      distractors: ['a', 'b', 'c'],
      hint: '',
      steps: [],
    },
  ];
  cleanExtras.pop(); // remove placeholder

  cleanExtras.push(
    {
      diff: 'Tantangan',
      prompt: 'Pada persamaan (x - 2)^(x + 5) = (x - 2)^2, periksa nilai x saat basis = -1 (yaitu x = 1). Apakah x = 1 merupakan solusi?',
      correct: 'Ya, karena menghasilkan (-1)^6 = 1 dan (-1)^2 = 1',
      distractors: [
        'Tidak, karena basisnya -1',
        'Tidak, karena 6 ≠ 2',
        'Ya, karena basis = -1 selalu menjadi solusi untuk semua pangkat',
      ],
      hint: 'Hitung nilai pangkat kiri pada x = 1, lalu bandingkan paritasnya dengan pangkat kanan (2).',
      steps: [
        'Basis = -1 ⇒ x - 2 = -1 ⇒ x = 1.',
        'Pangkat kiri = 1 + 5 = 6 (genap); pangkat kanan = 2 (genap).',
        'Karena sama-sama genap, (-1)^6 = (-1)^2 = 1, jadi x = 1 memenuhi.',
      ],
    },
    {
      diff: 'Menengah',
      prompt: 'Sebuah persamaan memiliki bentuk (x + 1)^(x - 2) = (x + 1)^4. Jika seorang siswa hanya menghitung x - 2 = 4 ⇒ x = 6, solusi apa yang terlewat?',
      correct: 'x = 0 (basis 1) dan x = -1 (basis 0)? Cek: di x = -1, pangkatnya -3 < 0! Jadi hanya x = 0 dan x = -2 (cek: -2-2=-4 genap, 4 genap -> (-1)^-4=1, (-1)^4=1)!',
      distractors: ['a', 'b', 'c'],
      hint: '',
      steps: [],
    }
  );
  cleanExtras.pop();

  cleanExtras.push(
    {
      diff: 'Menengah',
      prompt: 'Pada persamaan (x + 1)^(x - 2) = (x + 1)^4, jika siswa hanya menyelesaikan x - 2 = 4 ⇒ x = 6, maka nilai x dari syarat basis = 1 dan basis = -1 yang terlewat adalah...',
      correct: 'x = 0 dan x = -2',
      distractors: [
        'Hanya x = 0',
        'x = -1 dan x = 0',
        'x = -2, -1, dan 0',
      ],
      hint: 'Uji x + 1 = 1, x + 1 = 0 (ingat syarat pangkat > 0), dan x + 1 = -1 (paritas pangkat).',
      steps: [
        'Basis = 1: x = 0 ⇒ 1^(-2) = 1^4 = 1 (memenuhi).',
        'Basis = 0: x = -1 ⇒ pangkat kiri -3 < 0 (gagal).',
        'Basis = -1: x = -2 ⇒ (-1)^(-4) = 1 dan (-1)^4 = 1 (memenuhi).',
      ],
    },
    {
      diff: 'Dasar',
      prompt: 'Apakah 0^5 = 0^2 bernilai benar?',
      correct: 'Ya, kedua ruas bernilai 0 meskipun 5 ≠ 2',
      distractors: [
        'Salah, karena 5 ≠ 2',
        'Tak terdefinisi karena basisnya 0',
        'Salah, karena 0^5 = 5 dan 0^2 = 2',
      ],
      hint: '0 dikalikan dirinya sendiri sebanyak 5 kali atau 2 kali tetap menghasilkan 0.',
      steps: [
        '0^5 = 0 dan 0^2 = 0.',
        'Ini contoh nyata bahwa untuk basis 0 dengan pangkat positif, a^m = a^n tidak memaksa m = n.',
      ],
    }
  );

  cleanExtras.forEach((p, idx) => {
    items.push(
      makeFixedItem(
        `SB-${seq++}`,
        'syarat-basis',
        p.diff,
        p.prompt,
        p.correct,
        p.distractors,
        p.hint,
        p.steps,
        idx
      )
    );
  });

  // =========================================================================
  // 2. DEFINISI, PANGKAT NOL & NEGATIF (25 Soal Terkurasi)
  // =========================================================================
  const dPairs: Array<[number, number]> = [
    [2, 5], [2, 6], [3, 4], [4, 3], [5, 3], [6, 2], [2, 7], [3, 3],
  ];
  dPairs.forEach(([b, e], idx) => {
    const val = Math.pow(b, e);
    items.push(
      makeFixedItem(
        `DN-${seq++}`,
        'dasar-nol-negatif',
        'Dasar',
        `Hitung nilai dari ${b}^${e}.`,
        `${val}`,
        [`${b * e}`, `${Math.pow(b, e - 1)}`, `${Math.pow(e, b) === val ? val + b : Math.pow(e, b)}`],
        `Kalikan bilangan pokok ${b} dengan dirinya sendiri sebanyak ${e} kali.`,
        [`${b}^${e} = ${Array(e).fill(b).join(' × ')} = ${val}.`],
        idx
      )
    );
  });

  const negPairs: Array<[number, number]> = [
    [2, 3], [2, 4], [3, 2], [3, 3], [4, 2], [5, 2], [10, 2],
  ];
  negPairs.forEach(([b, e], idx) => {
    const denom = Math.pow(b, e);
    items.push(
      makeFixedItem(
        `DN-${seq++}`,
        'dasar-nol-negatif',
        'Dasar',
        `Nyatakan ${b}^(-${e}) dalam bentuk pecahan paling sederhana.`,
        `1/${denom}`,
        [`-${denom}`, `-1/${denom}`, `1/${b * e}`],
        'Gunakan aturan a^(-n) = 1 / a^n.',
        [`${b}^(-${e}) = 1 / ${b}^${e} = 1/${denom}.`],
        idx
      )
    );
  });

  const zeroAndSignCases: Array<{
    diff: 'Dasar' | 'Menengah';
    prompt: string;
    correct: string;
    distractors: [string, string, string];
    hint: string;
    steps: string[];
  }> = [
    { diff: 'Dasar', prompt: 'Berapakah nilai dari 125^0?', correct: '1', distractors: ['0', '125', '-1'], hint: 'Setiap bilangan bukan nol pangkat 0 bernilai 1.', steps: ['125 ≠ 0, maka 125^0 = 1.'] },
    { diff: 'Dasar', prompt: 'Hitung nilai dari 3^0 + 5^0 - 2^0.', correct: '1', distractors: ['0', '6', '3'], hint: 'Hitung masing-masing pangkat nol terlebih dahulu.', steps: ['3^0 = 1, 5^0 = 1, 2^0 = 1.', '1 + 1 - 1 = 1.'] },
    { diff: 'Dasar', prompt: 'Hitung nilai dari (-4)^2.', correct: '16', distractors: ['-16', '8', '-8'], hint: 'Tanda negatif ikut dikalikan karena berada di dalam kurung.', steps: ['(-4) × (-4) = 16.'] },
    { diff: 'Dasar', prompt: 'Hitung nilai dari -4^2.', correct: '-16', distractors: ['16', '-8', '8'], hint: 'Tanpa kurung, pangkat bekerja sebelum tanda minus.', steps: ['-4^2 = -(4 × 4) = -16.'] },
    { diff: 'Dasar', prompt: 'Hitung nilai dari (-3)^3.', correct: '-27', distractors: ['27', '-9', '9'], hint: 'Bilangan negatif dipangkatkan ganjil tetap negatif.', steps: ['(-3) × (-3) × (-3) = -27.'] },
    { diff: 'Menengah', prompt: 'Berapakah hasil dari (1/3)^(-2)?', correct: '9', distractors: ['1/9', '-9', '-6'], hint: 'Pangkat negatif pada pecahan membalik pembilang dan penyebut.', steps: ['(1/3)^(-2) = 3^2 = 9.'] },
    { diff: 'Menengah', prompt: 'Hitung hasil dari 2^(-1) + 2^(-2).', correct: '3/4', distractors: ['2^(-3)', '1/8', '1/6'], hint: 'Ubah menjadi pecahan 1/2 + 1/4 terlebih dahulu.', steps: ['1/2 + 1/4 = 2/4 + 1/4 = 3/4.'] },
    { diff: 'Menengah', prompt: 'Nilai dari (2/5)^(-2) adalah...', correct: '25/4', distractors: ['4/25', '-4/25', '10/4'], hint: 'Balik pecahan menjadi 5/2 lalu pangkatkan 2.', steps: ['(2/5)^(-2) = (5/2)^2 = 25/4.'] },
    { diff: 'Menengah', prompt: 'Berapakah nilai dari (-2)^4 - (-2)^3?', correct: '24', distractors: ['8', '-24', '-8'], hint: '(-2)^4 = 16 dan (-2)^3 = -8.', steps: ['16 - (-8) = 16 + 8 = 24.'] },
    { diff: 'Menengah', prompt: 'Nilai dari (4^0 × 2^(-3)) adalah...', correct: '1/8', distractors: ['0', '8', '-1/8'], hint: '4^0 = 1 dan 2^(-3) = 1/8.', steps: ['1 × 1/8 = 1/8.'] },
  ];

  zeroAndSignCases.forEach((c, idx) => {
    items.push(
      makeFixedItem(`DN-${seq++}`, 'dasar-nol-negatif', c.diff, c.prompt, c.correct, c.distractors, c.hint, c.steps, idx)
    );
  });

  // =========================================================================
  // 3. SIFAT-SIFAT OPERASI EKSPONEN (25 Soal Terkurasi)
  // =========================================================================
  const lawMults: Array<[number, number, number]> = [
    [2, 3, 4], [3, 2, 5], [5, 4, 2], [7, 3, 6], [2, 6, -2], [3, 5, -3],
  ];
  lawMults.forEach(([a, m, n], idx) => {
    const sum = m + n;
    items.push(
      makeFixedItem(
        `SE-${seq++}`,
        'sifat-eksponen',
        n < 0 ? 'Menengah' : 'Dasar',
        `Sederhanakan bentuk ${a}^${m} × ${a}^(${n}).`,
        `${a}^${sum}`,
        [`${a}^${m * n}`, `${a * 2}^${sum}`, `${a}^${m - n}`],
        'Pada perkalian dengan basis sama, jumlahkan eksponennya.',
        [`${a}^${m} × ${a}^(${n}) = ${a}^(${m} + (${n})) = ${a}^${sum}.`],
        idx
      )
    );
  });

  const lawDivs: Array<[number, number, number]> = [
    [2, 7, 3], [3, 9, 4], [5, 6, 2], [6, 8, 5], [4, 5, -2],
  ];
  lawDivs.forEach(([a, m, n], idx) => {
    const diff = m - n;
    items.push(
      makeFixedItem(
        `SE-${seq++}`,
        'sifat-eksponen',
        n < 0 ? 'Menengah' : 'Dasar',
        `Sederhanakan bentuk ${a}^${m} ÷ ${a}^(${n}).`,
        `${a}^${diff}`,
        [`${a}^${m + n}`, `1^${diff}`, `${a}^${m * n}`],
        'Pada pembagian dengan basis sama, kurangi pangkat pembilang dengan pangkat penyebut.',
        [`${a}^${m} ÷ ${a}^(${n}) = ${a}^(${m} - (${n})) = ${a}^${diff}.`],
        idx
      )
    );
  });

  const powerOfPower: Array<[number, number, number]> = [
    [2, 3, 4], [3, 2, 5], [5, 3, 2], [7, 2, 3], [2, 4, -2],
  ];
  powerOfPower.forEach(([a, m, n], idx) => {
    const prod = m * n;
    items.push(
      makeFixedItem(
        `SE-${seq++}`,
        'sifat-eksponen',
        n < 0 ? 'Menengah' : 'Dasar',
        `Bentuk sederhana dari (${a}^${m})^(${n}) adalah...`,
        `${a}^${prod}`,
        [`${a}^${m + n}`, `${a}^${Math.pow(m, Math.abs(n))}`, `${a * Math.abs(n)}^${m}`],
        'Kalikan kedua pangkat saat suatu pangkat dipangkatkan lagi.',
        [`(${a}^${m})^(${n}) = ${a}^(${m} × (${n})) = ${a}^${prod}.`],
        idx
      )
    );
  });

  const algebraLaws: Array<{
    diff: 'Menengah' | 'Tantangan';
    prompt: string;
    correct: string;
    distractors: [string, string, string];
    hint: string;
    steps: string[];
  }> = [
    { diff: 'Menengah', prompt: 'Sederhanakan (3x^2 y)^3.', correct: '27x^6 y^3', distractors: ['9x^6 y^3', '27x^5 y^3', '3x^6 y^3'], hint: 'Pangkat 3 berlaku untuk 3, x^2, dan y.', steps: ['3^3 = 27, (x^2)^3 = x^6, y^3 = y^3.'] },
    { diff: 'Menengah', prompt: 'Sederhanakan (2a^3 b^2)^4.', correct: '16a^12 b^8', distractors: ['8a^12 b^8', '16a^7 b^6', '2a^12 b^8'], hint: '2^4 = 16, lalu kalikan tiap pangkat variabel dengan 4.', steps: ['2^4 × a^(3×4) × b^(2×4) = 16a^12 b^8.'] },
    { diff: 'Menengah', prompt: 'Bentuk sederhana dari (12x^5) ÷ (4x^2) untuk x ≠ 0 adalah...', correct: '3x^3', distractors: ['8x^3', '3x^7', '48x^3'], hint: 'Bagi koefisien 12 ÷ 4 dan kurangi pangkat x.', steps: ['12/4 = 3 dan x^(5-2) = x^3.'] },
    { diff: 'Tantangan', prompt: 'Sederhanakan (x^(-2) y^3)^(-2) dalam pangkat positif.', correct: 'x^4 / y^6', distractors: ['y^6 / x^4', 'x^(-4) y^(-6)', 'x^4 y^6'], hint: 'Kalikan setiap pangkat di dalam kurung dengan -2.', steps: ['x^((-2)×(-2)) y^(3×(-2)) = x^4 y^(-6) = x^4 / y^6.'] },
    { diff: 'Menengah', prompt: 'Hitung nilai dari 16^(3/4).', correct: '8', distractors: ['12', '4', '64'], hint: '16^(3/4) = (⁴√16)^3.', steps: ['⁴√16 = 2, lalu 2^3 = 8.'] },
    { diff: 'Menengah', prompt: 'Hitung nilai dari 27^(2/3).', correct: '9', distractors: ['18', '3', '81'], hint: '27^(2/3) = (³√27)^2.', steps: ['³√27 = 3, lalu 3^2 = 9.'] },
    { diff: 'Tantangan', prompt: 'Hitung nilai dari 8^(2/3) + 25^(1/2).', correct: '9', distractors: ['7', '11', '13'], hint: '8^(2/3) = 4 dan 25^(1/2) = 5.', steps: ['4 + 5 = 9.'] },
    { diff: 'Tantangan', prompt: 'Sederhanakan (2^5 × 4^2) ÷ 8^2.', correct: '8', distractors: ['4', '16', '32'], hint: 'Ubah 4 = 2^2 dan 8 = 2^3 agar semua berbasis 2.', steps: ['(2^5 × 2^4) ÷ 2^6 = 2^9 ÷ 2^6 = 2^3 = 8.'] },
    { diff: 'Tantangan', prompt: 'Nilai dari (3^4 × 9^2) ÷ 27^2 adalah...', correct: '9', distractors: ['3', '27', '81'], hint: 'Ubah 9 = 3^2 dan 27 = 3^3.', steps: ['(3^4 × 3^4) ÷ 3^6 = 3^8 ÷ 3^6 = 3^2 = 9.'] },
  ];

  algebraLaws.forEach((c, idx) => {
    items.push(
      makeFixedItem(`SE-${seq++}`, 'sifat-eksponen', c.diff, c.prompt, c.correct, c.distractors, c.hint, c.steps, idx)
    );
  });

  // =========================================================================
  // 4. PERSAMAAN EKSPONEN LANJUTAN (25 Soal Terkurasi)
  // =========================================================================
  const eqSimple: Array<[number, number]> = [
    [2, 5], [2, 6], [2, 7], [3, 4], [3, 5], [4, 3], [5, 3], [5, 4], [6, 2], [7, 2],
  ];
  eqSimple.forEach(([b, ans], idx) => {
    const rhs = Math.pow(b, ans);
    items.push(
      makeFixedItem(
        `PE-${seq++}`,
        'persamaan-eksponen',
        'Dasar',
        `Tentukan nilai x yang memenuhi ${b}^x = ${rhs}.`,
        `x = ${ans}`,
        [`x = ${ans - 1}`, `x = ${ans + 1}`, `x = ${Math.max(2, Math.round(rhs / b))}`],
        `Ubah ${rhs} menjadi bentuk ${b}^n.`,
        [`${rhs} = ${b}^${ans}. Karena basis ${b} > 0 dan ≠ 1, maka x = ${ans}.`],
        idx
      )
    );
  });

  const eqLinear: Array<{
    diff: 'Menengah' | 'Tantangan';
    prompt: string;
    correct: string;
    distractors: [string, string, string];
    hint: string;
    steps: string[];
  }> = [
    { diff: 'Menengah', prompt: 'Tentukan x dari 2^(2x - 1) = 32.', correct: 'x = 3', distractors: ['x = 2', 'x = 4', 'x = 5/2'], hint: '32 = 2^5.', steps: ['2x - 1 = 5 ⇒ 2x = 6 ⇒ x = 3.'] },
    { diff: 'Menengah', prompt: 'Tentukan x dari 3^(x + 2) = 81.', correct: 'x = 2', distractors: ['x = 4', 'x = 6', 'x = 1'], hint: '81 = 3^4.', steps: ['x + 2 = 4 ⇒ x = 2.'] },
    { diff: 'Menengah', prompt: 'Tentukan x dari 5^(3x - 4) = 125.', correct: 'x = 7/3? Wait let us use clean integer: 5^(3x - 3) = 125.', distractors: ['a', 'b', 'c'], hint: '', steps: [] },
  ];
  eqLinear.pop();

  eqLinear.push(
    { diff: 'Menengah', prompt: 'Tentukan x dari 5^(3x - 3) = 125.', correct: 'x = 2', distractors: ['x = 3', 'x = 1', 'x = 4'], hint: '125 = 5^3.', steps: ['3x - 3 = 3 ⇒ 3x = 6 ⇒ x = 2.'] },
    { diff: 'Menengah', prompt: 'Tentukan x dari 4^(x - 1) = 64.', correct: 'x = 4', distractors: ['x = 3', 'x = 5', 'x = 2'], hint: '64 = 4^3.', steps: ['x - 1 = 3 ⇒ x = 4.'] },
    { diff: 'Menengah', prompt: 'Nilai x yang memenuhi 2^(3x) = 1/8 adalah...', correct: 'x = -1', distractors: ['x = 1', 'x = -3', 'x = 3'], hint: '1/8 = 2^(-3).', steps: ['3x = -3 ⇒ x = -1.'] },
    { diff: 'Menengah', prompt: 'Nilai x yang memenuhi 3^(2x + 1) = 1/27 adalah...', correct: 'x = -2', distractors: ['x = 2', 'x = -1', 'x = -4'], hint: '1/27 = 3^(-3).', steps: ['2x + 1 = -3 ⇒ 2x = -4 ⇒ x = -2.'] },
    { diff: 'Menengah', prompt: 'Nilai x yang memenuhi 4^(x + 1) = 8^x adalah...', correct: 'x = 2', distractors: ['x = 1', 'x = 3', 'x = -2'], hint: 'Samakan basis ke 2: 4 = 2^2 dan 8 = 2^3.', steps: ['2^(2x + 2) = 2^(3x) ⇒ 2x + 2 = 3x ⇒ x = 2.'] },
    { diff: 'Menengah', prompt: 'Nilai x yang memenuhi 9^(x - 1) = 27^(x - 2) adalah...', correct: 'x = 4', distractors: ['x = 2', 'x = 3', 'x = 5'], hint: 'Samakan basis ke 3.', steps: ['3^(2x - 2) = 3^(3x - 6) ⇒ 2x - 2 = 3x - 6 ⇒ x = 4.'] },
    { diff: 'Tantangan', prompt: 'Nilai x yang memenuhi 25^(x + 1) = 125^(x - 1) adalah...', correct: 'x = 5', distractors: ['x = 3', 'x = 2', 'x = 1'], hint: 'Samakan basis ke 5.', steps: ['5^(2x + 2) = 5^(3x - 3) ⇒ 2x + 2 = 3x - 3 ⇒ x = 5.'] },
    { diff: 'Tantangan', prompt: 'Tentukan nilai x dari (1/2)^(x - 3) = 16.', correct: 'x = -1', distractors: ['x = 7', 'x = 1', 'x = -7'], hint: 'Ubah 1/2 = 2^(-1) dan 16 = 2^4.', steps: ['2^(3 - x) = 2^4 ⇒ 3 - x = 4 ⇒ x = -1.'] },
    { diff: 'Tantangan', prompt: 'Tentukan nilai x yang memenuhi 2^(x^2 - 3x) = 1.', correct: 'x = 0 atau x = 3', distractors: ['Hanya x = 3', 'x = 1 atau x = 2', 'Tidak ada solusi'], hint: 'Ubah 1 menjadi 2^0.', steps: ['x^2 - 3x = 0 ⇒ x(x - 3) = 0 ⇒ x = 0 atau x = 3.'] },
    { diff: 'Tantangan', prompt: 'Jumlah semua nilai x yang memenuhi 3^(x^2 - 5x + 6) = 1 adalah...', correct: '5', distractors: ['6', '-5', '1'], hint: '3^p = 1 berarti p = 0. Ingat x1 + x2 = -b/a.', steps: ['x^2 - 5x + 6 = 0 ⇒ (x - 2)(x - 3) = 0 ⇒ x = 2 dan x = 3.', 'Jumlahnya 2 + 3 = 5.'] },
    { diff: 'Tantangan', prompt: 'Nilai x yang memenuhi √(2^(x + 4)) = 8 adalah...', correct: 'x = 2', distractors: ['x = 1', 'x = 4', 'x = -1'], hint: 'Akar kuadrat sama dengan pangkat 1/2, dan 8 = 2^3.', steps: ['2^((x + 4)/2) = 2^3 ⇒ (x + 4)/2 = 3 ⇒ x + 4 = 6 ⇒ x = 2.'] },
    { diff: 'Tantangan', prompt: 'Tentukan nilai x dari 2^(x + 1) + 2^x = 24.', correct: 'x = 3', distractors: ['x = 2', 'x = 4', 'x = 5'], hint: 'Faktorkan 2^x(2 + 1) = 24.', steps: ['2^x(3) = 24 ⇒ 2^x = 8 = 2^3 ⇒ x = 3.'] },
    { diff: 'Tantangan', prompt: 'Tentukan nilai x dari 3^(x + 1) - 3^x = 18.', correct: 'x = 2', distractors: ['x = 3', 'x = 1', 'x = 4'], hint: 'Faktorkan 3^x(3 - 1) = 18.', steps: ['3^x(2) = 18 ⇒ 3^x = 9 = 3^2 ⇒ x = 2.'] },
  );

  eqLinear.forEach((c, idx) => {
    items.push(
      makeFixedItem(`PE-${seq++}`, 'persamaan-eksponen', c.diff, c.prompt, c.correct, c.distractors, c.hint, c.steps, idx)
    );
  });

  // =========================================================================
  // 5. APLIKASI PERTUMBUHAN & PELURUHAN (20 Soal Terkurasi)
  // =========================================================================
  const appProblems: Array<{
    diff: 'Dasar' | 'Menengah' | 'Tantangan';
    prompt: string;
    correct: string;
    distractors: [string, string, string];
    hint: string;
    steps: string[];
  }> = [
    { diff: 'Dasar', prompt: 'Sebuah koloni awal berisi 10 bakteri dan membelah dua setiap 1 jam. Berapa jumlah bakteri setelah 4 jam?', correct: '160 bakteri', distractors: ['80 bakteri', '40 bakteri', '320 bakteri'], hint: 'N = 10 × 2^4.', steps: ['10 × 16 = 160 bakteri.'] },
    { diff: 'Dasar', prompt: 'Banyak bakteri awal 5 sel, membelah dua tiap 20 menit. Berapa sel setelah 1 jam?', correct: '40 sel', distractors: ['30 sel', '20 sel', '80 sel'], hint: '1 jam = 60 menit = 3 kali pembelahan.', steps: ['5 × 2^3 = 5 × 8 = 40 sel.'] },
    { diff: 'Dasar', prompt: 'Selembar kertas dilipat menjadi dua secara berulang. Berapa lapisan kertas setelah 6 kali lipatan?', correct: '64 lapisan', distractors: ['12 lapisan', '32 lapisan', '128 lapisan'], hint: 'Setiap lipatan menggandakan jumlah lapisan (2^n).', steps: ['2^6 = 64 lapisan.'] },
    { diff: 'Dasar', prompt: 'Massa zat radioaktif mula-mula 160 gram dengan waktu paruh 2 jam. Berapa sisa massa setelah 6 jam?', correct: '20 gram', distractors: ['40 gram', '10 gram', '80 gram'], hint: '6 jam ÷ 2 jam = 3 kali peluruhan menjadi setengah.', steps: ['160 × (1/2)^3 = 160 ÷ 8 = 20 gram.'] },
    { diff: 'Menengah', prompt: 'Suatu zat meluruh menjadi setengahnya setiap hari. Setelah 4 hari tersisa 15 gram. Berapa massa awalnya?', correct: '240 gram', distractors: ['120 gram', '60 gram', '480 gram'], hint: 'M_awal × (1/2)^4 = 15.', steps: ['M_awal = 15 × 2^4 = 15 × 16 = 240 gram.'] },
    { diff: 'Menengah', prompt: 'Modal Rp1.000.000 diinvestasikan dengan pertumbuhan 100% per tahun (berlipat dua tiap tahun). Berapa nilainya setelah 3 tahun?', correct: 'Rp8.000.000', distractors: ['Rp4.000.000', 'Rp6.000.000', 'Rp3.000.000'], hint: 'M = 1.000.000 × 2^3.', steps: ['1.000.000 × 8 = Rp8.000.000.'] },
    { diff: 'Menengah', prompt: 'Sebuah video dibagikan ke 3 orang di menit ke-1, lalu tiap orang meneruskan ke 3 orang baru tiap menit. Berapa penerima baru di menit ke-4?', correct: '81 orang', distractors: ['12 orang', '27 orang', '243 orang'], hint: 'Penerima baru mengikuti pola 3^n.', steps: ['Pada menit ke-4: 3^4 = 81 orang.'] },
    { diff: 'Menengah', prompt: 'Populasi awal suatu pulau adalah 2.000 jiwa dan menjadi 3 kali lipat setiap 10 tahun. Berapa populasi setelah 30 tahun?', correct: '54.000 jiwa', distractors: ['18.000 jiwa', '6.000 jiwa', '162.000 jiwa'], hint: '30 tahun = 3 periode pelipatan tiga.', steps: ['2.000 × 3^3 = 2.000 × 27 = 54.000 jiwa.'] },
    { diff: 'Menengah', prompt: 'Intensitas cahaya berkurang menjadi setengahnya setiap melewati 1 lapisan kaca film. Sisa intensitas setelah melewati 5 lapisan adalah...', correct: '1/32 bagian', distractors: ['1/10 bagian', '1/16 bagian', '1/64 bagian'], hint: 'Hitung (1/2)^5.', steps: ['(1/2)^5 = 1/32 dari intensitas awal.'] },
    { diff: 'Dasar', prompt: 'Bakteri mula-mula berjumlah 25 sel dan membelah menjadi dua setiap 15 menit. Dalam 1 jam terdapat...', correct: '400 sel', distractors: ['200 sel', '100 sel', '800 sel'], hint: '1 jam = 4 kali pembelahan (60 ÷ 15).', steps: ['25 × 2^4 = 25 × 16 = 400 sel.'] },
    { diff: 'Menengah', prompt: 'Sebuah bola jatuh dari ketinggian 81 m dan memantul setinggi 2/3 dari tinggi sebelumnya. Tinggi pantulan ke-3 adalah...', correct: '24 m', distractors: ['36 m', '16 m', '54 m'], hint: 'H_3 = 81 × (2/3)^3.', steps: ['81 × (8/27) = 3 × 8 = 24 m.'] },
    { diff: 'Menengah', prompt: 'Harga sebuah gawai Rp8.000.000 dan menyusut nilainya menjadi 1/2 setiap 2 tahun. Berapa nilainya setelah 4 tahun?', correct: 'Rp2.000.000', distractors: ['Rp4.000.000', 'Rp1.000.000', 'Rp3.000.000'], hint: '4 tahun = 2 periode penyusutan.', steps: ['8.000.000 × (1/2)^2 = Rp2.000.000.'] },
    { diff: 'Tantangan', prompt: 'Suatu koloni bakteri berjumlah 12 sel pada pukul 08.00 dan menjadi 192 sel pada pukul 10.00. Berapa periode pembelahan duanya?', correct: 'Setiap 30 menit', distractors: ['Setiap 15 menit', 'Setiap 45 menit', 'Setiap 60 menit'], hint: '192 ÷ 12 = 16 = 2^n. Cari n lalu bagi rentang waktu 120 menit dengan n.', steps: ['12 × 2^n = 192 ⇒ 2^n = 16 ⇒ n = 4 kali pembelahan.', '120 menit ÷ 4 = 30 menit.'] },
    { diff: 'Tantangan', prompt: 'Zat radioaktif semula 640 gram. Setelah 15 jam massanya tersisa 40 gram. Waktu paruh zat tersebut adalah...', correct: '3,75 jam', distractors: ['5 jam', '3 jam', '4 jam'], hint: '640 × (1/2)^n = 40 ⇒ (1/2)^n = 1/16.', steps: ['n = 4 kali waktu paruh.', '15 jam ÷ 4 = 3,75 jam.'] },
    { diff: 'Menengah', prompt: 'Pada model pertumbuhan P(t) = 500 × (1,2)^t, angka 1,2 menunjukkan...', correct: 'Pertumbuhan sebesar 20% setiap periode t', distractors: ['Pertumbuhan 120% per periode', 'Peluruhan 20% per periode', 'Jumlah awal populasi'], hint: '1,2 = 1 + 0,20.', steps: ['Basis = 1 + r = 1,2 berarti laju kenaikan r = 0,2 = 20%.'] },
    { diff: 'Menengah', prompt: 'Pada model peluruhan M(t) = 100 × (0,85)^t, persentase penyusutan setiap periode t adalah...', correct: '15%', distractors: ['85%', '0,85%', '25%'], hint: '1 - r = 0,85.', steps: ['r = 1 - 0,85 = 0,15 = 15%.'] },
    { diff: 'Tantangan', prompt: 'Sebuah turnamen sistem gugur diikuti 64 tim. Pada setiap babak, setengah tim gugur. Berapa babak yang diperlukan hingga tersisa 1 juara?', correct: '6 babak', distractors: ['5 babak', '7 babak', '32 babak'], hint: '64 × (1/2)^n = 1.', steps: ['2^n = 64 ⇒ n = 6 babak.'] },
    { diff: 'Dasar', prompt: 'Bakteri membelah menjadi 2 setiap jam. Jika pukul 12.00 ada 2^5 bakteri, pada pukul 15.00 terdapat...', correct: '2^8 bakteri', distractors: ['2^15 bakteri', '2^3 bakteri', '6^5 bakteri'], hint: 'Selisih waktu 3 jam berarti dikalikan 2^3.', steps: ['2^5 × 2^3 = 2^8 bakteri.'] },
    { diff: 'Tantangan', prompt: 'Jika kapasitas penyimpanan memori berlipat 2 kali setiap 2 tahun, dalam 10 tahun kapasitasnya menjadi berapa kali lipat semula?', correct: '32 kali lipat', distractors: ['10 kali lipat', '16 kali lipat', '1024 kali lipat'], hint: '10 tahun ÷ 2 tahun = 5 kali penggandaan.', steps: ['2^5 = 32 kali lipat.'] },
    { diff: 'Menengah', prompt: 'Sebuah rantai pesan bermula dari 1 pengirim lalu diteruskan ke 4 orang tiap tahap. Total orang yang menerima pesan pada tahap ke-3 saja adalah...', correct: '64 orang', distractors: ['12 orang', '16 orang', '256 orang'], hint: 'Tahap ke-3 = 4^3.', steps: ['4^3 = 64 orang.'] },
  ];

  appProblems.forEach((c, idx) => {
    items.push(
      makeFixedItem(`AP-${seq++}`, 'aplikasi-nyata', c.diff, c.prompt, c.correct, c.distractors, c.hint, c.steps, idx)
    );
  });

  return items;
}

export const CURATED_QUESTION_BANK: BankQuestion[] = buildCuratedBank();

/**
 * Generates an ever-changing set of randomized exponent questions (default 10 for multiplayer races),
 * ensuring strong representation of Syarat Basis misconceptions alongside laws & equations.
 */
export function generateDynamicRaceQuestions(count = 10): BankQuestion[] {
  const generated: BankQuestion[] = [];
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // 1. Syarat Basis: Basis = 1 trap
  {
    const a = randInt(2, 5);
    const b = randInt(1, 7);
    const c = randInt(2, 9);
    const naiveAns = `x = ${b + c}`;
    const sh = shuffleOptions('Semua bilangan real x memenuhi', [
      naiveAns,
      'x = 1',
      'Tidak ada nilai x yang memenuhi',
    ]);
    generated.push({
      id: `dyn-sb1-${Date.now()}-${Math.random()}`,
      topic: 'syarat-basis',
      topicLabel: TOPIC_LABELS['syarat-basis'],
      difficulty: 'Dasar',
      prompt: `Diketahui 1^(${a}x - ${b}) = 1^(${a - 1}x + ${c}). Penyelesaian yang tepat adalah...`,
      ...sh,
      hint: 'Periksa basisnya: aturan kesamaan pangkat tidak berlaku untuk basis 1.',
      steps: [
        'Basis persamaan adalah 1.',
        '1 dipangkatkan bilangan real apa pun selalu menghasilkan 1, sehingga semua x ∈ ℝ memenuhi.',
      ],
    });
  }

  // 2. Syarat Basis: h(x)^f(x) = h(x)^g(x) randomized
  {
    const k = randInt(2, 5);
    const cRight = randInt(2, 5);
    const pOffset = randInt(1, 3);
    // (x - k)^(x + pOffset) = (x - k)^cRight
    const h = (x: number) => x - k;
    const f = (x: number) => x + pOffset;
    const g = () => cRight;
    const sols = new Set<number>();
    const xSame = cRight - pOffset;
    if (!(h(xSame) === 0 && f(xSame) <= 0)) sols.add(xSame);
    sols.add(k + 1); // basis = 1
    if (f(k) > 0 && g() > 0) sols.add(k); // basis = 0
    if (Math.abs(f(k - 1) % 2) === Math.abs(g() % 2)) sols.add(k - 1); // basis = -1

    const sorted = Array.from(sols).sort((a, b) => a - b);
    const correctStr = `{${sorted.join(', ')}}`;
    const onlySame = `{${xSame}}`;
    const alt1 = `{${k + 1}, ${xSame}}`;
    const alt2 = `{${Array.from(new Set([...sorted, k + 2])).sort((a, b) => a - b).join(', ')}}`;
    const sh = shuffleOptions(correctStr, [
      onlySame === correctStr ? `{${xSame + 1}}` : onlySame,
      alt1 === correctStr ? `{${k}}` : alt1,
      alt2,
    ]);
    generated.push({
      id: `dyn-sb2-${Date.now()}-${Math.random()}`,
      topic: 'syarat-basis',
      topicLabel: TOPIC_LABELS['syarat-basis'],
      difficulty: 'Tantangan',
      prompt: `Tentukan himpunan penyelesaian dari (x - ${k})^(x + ${pOffset}) = (x - ${k})^${cRight}.`,
      ...sh,
      hint: 'Uji keempat syarat basis: pangkat sama, h(x)=1, h(x)=0 (pangkat > 0), dan h(x)=-1 (paritas sama).',
      steps: [
        `Pangkat sama: x + ${pOffset} = ${cRight} ⇒ x = ${xSame}.`,
        `Basis = 1: x - ${k} = 1 ⇒ x = ${k + 1}.`,
        `Basis = 0 (x = ${k}): pangkat ${f(k)} dan ${g()} ⇒ ${f(k) > 0 && g() > 0 ? 'memenuhi' : 'gagal'}.`,
        `Basis = -1 (x = ${k - 1}): pangkat ${f(k - 1)} dan ${g()} ⇒ ${Math.abs(f(k - 1) % 2) === Math.abs(g() % 2) ? 'paritas sama, memenuhi' : 'paritas beda, gagal'}.`,
      ],
    });
  }

  // 3. Syarat Basis: a^f(x) = b^f(x)
  {
    const bases = pick<[number, number]>([[3, 5], [2, 7], [5, 11], [3, 8], [4, 9]]);
    const m = randInt(2, 4);
    const root = randInt(1, 6);
    const rhsConst = m * root;
    const sh = shuffleOptions(`x = ${root}`, [
      'Tidak ada solusi karena basis berbeda',
      `x = ${rhsConst}`,
      'x = 0',
    ]);
    generated.push({
      id: `dyn-sb3-${Date.now()}-${Math.random()}`,
      topic: 'syarat-basis',
      topicLabel: TOPIC_LABELS['syarat-basis'],
      difficulty: 'Menengah',
      prompt: `Nilai x yang memenuhi ${bases[0]}^(${m}x - ${rhsConst}) = ${bases[1]}^(${m}x - ${rhsConst}) adalah...`,
      ...sh,
      hint: `Dua basis positif berbeda (${bases[0]} dan ${bases[1]}) hanya sama jika pangkatnya nol.`,
      steps: [
        `${m}x - ${rhsConst} = 0 ⇒ ${m}x = ${rhsConst} ⇒ x = ${root}.`,
      ],
    });
  }

  // 4. Syarat Basis: (-1)^m = (-1)^n / conceptual check
  {
    const p1 = randInt(2, 6) * 2; // even
    const p2 = randInt(1, 5) * 2; // even
    const ans = pick(['Benar, karena kedua pangkat sama-sama genap', 'Salah, karena pangkatnya berbeda']);
    void ans;
    const sh = shuffleOptions('Benar, karena (-1)^genap selalu bernilai 1', [
      `Salah, karena ${p1} ≠ ${p2 + 2}`,
      'Salah, karena basis negatif tidak bisa dipangkatkan',
      'Benar hanya jika diubah ke basis +1',
    ]);
    generated.push({
      id: `dyn-sb4-${Date.now()}-${Math.random()}`,
      topic: 'syarat-basis',
      topicLabel: TOPIC_LABELS['syarat-basis'],
      difficulty: 'Dasar',
      prompt: `Apakah persamaan (-1)^${p1} = (-1)^${p2 + 2} bernilai benar meskipun pangkatnya berbeda?`,
      ...sh,
      hint: 'Hitung nilai masing-masing ruas dengan sifat bilangan negatif berpangkat genap.',
      steps: [
        `(-1)^${p1} = +1 dan (-1)^${p2 + 2} = +1.`,
        'Persamaan bernilai benar karena basis -1 bukan fungsi satu-ke-satu.',
      ],
    });
  }

  // 5. Pangkat Negatif & Tanda Kurung
  {
    const b = pick([2, 3, 4, 5]);
    const e = randInt(2, 3);
    const val = Math.pow(b, e);
    const sh = shuffleOptions(`1/${val}`, [`-${val}`, `-1/${val}`, `1/${b * e}`]);
    generated.push({
      id: `dyn-dn-${Date.now()}-${Math.random()}`,
      topic: 'dasar-nol-negatif',
      topicLabel: TOPIC_LABELS['dasar-nol-negatif'],
      difficulty: 'Dasar',
      prompt: `Bentuk pecahan positif dari ${b}^(-${e}) adalah...`,
      ...sh,
      hint: 'Gunakan aturan a^(-n) = 1 / a^n.',
      steps: [`${b}^(-${e}) = 1 / ${b}^${e} = 1/${val}.`],
    });
  }

  // 6. Urutan tanda negatif vs kurung
  {
    const b = randInt(3, 8);
    const sq = b * b;
    const sh = shuffleOptions(`${-sq}`, [`${sq}`, `${-2 * b}`, `${2 * b}`]);
    generated.push({
      id: `dyn-sign-${Date.now()}-${Math.random()}`,
      topic: 'dasar-nol-negatif',
      topicLabel: TOPIC_LABELS['dasar-nol-negatif'],
      difficulty: 'Dasar',
      prompt: `Hitung nilai dari -${b}^2 (perhatikan tidak adanya tanda kurung).`,
      ...sh,
      hint: 'Tanpa tanda kurung, pangkat 2 hanya mengenai angkanya, bukan tanda negatif.',
      steps: [`-${b}^2 = -(${b} × ${b}) = -${sq}.`],
    });
  }

  // 7. Sifat Perkalian/Pembagian
  {
    const a = pick([2, 3, 5, 7]);
    const m = randInt(3, 7);
    const n = randInt(2, 5);
    const sh = shuffleOptions(`${a}^${m + n}`, [
      `${a}^${m * n}`,
      `${a * 2}^${m + n}`,
      `${a}^${Math.abs(m - n)}`,
    ]);
    generated.push({
      id: `dyn-se-${Date.now()}-${Math.random()}`,
      topic: 'sifat-eksponen',
      topicLabel: TOPIC_LABELS['sifat-eksponen'],
      difficulty: 'Dasar',
      prompt: `Sederhanakan bentuk ${a}^${m} × ${a}^${n}.`,
      ...sh,
      hint: 'Basis sama pada perkalian → jumlahkan pangkatnya.',
      steps: [`${a}^${m} × ${a}^${n} = ${a}^(${m} + ${n}) = ${a}^${m + n}.`],
    });
  }

  // 8. Pangkat dari Pangkat Aljabar
  {
    const k = pick([2, 3, 4]);
    const p = randInt(2, 4);
    const outer = pick([2, 3]);
    const coeff = Math.pow(k, outer);
    const expRes = p * outer;
    const sh = shuffleOptions(`${coeff}x^${expRes}`, [
      `${k * outer}x^${expRes}`,
      `${coeff}x^${p + outer}`,
      `${k}x^${expRes}`,
    ]);
    generated.push({
      id: `dyn-alg-${Date.now()}-${Math.random()}`,
      topic: 'sifat-eksponen',
      topicLabel: TOPIC_LABELS['sifat-eksponen'],
      difficulty: 'Menengah',
      prompt: `Hasil penyederhanaan dari (${k}x^${p})^${outer} adalah...`,
      ...sh,
      hint: `Pangkat ${outer} berlaku untuk koefisien ${k} dan juga x^${p}.`,
      steps: [`${k}^${outer} = ${coeff} dan (x^${p})^${outer} = x^${expRes}.`],
    });
  }

  // 9. Persamaan Eksponen dengan Penyamakan Basis
  {
    const xSol = randInt(2, 5);
    const offset = randInt(1, 4);
    const rhsExp = xSol + offset;
    const rhsVal = Math.pow(2, rhsExp);
    const sh = shuffleOptions(`x = ${xSol}`, [
      `x = ${xSol + 1}`,
      `x = ${rhsExp}`,
      `x = ${xSol - 1}`,
    ]);
    generated.push({
      id: `dyn-pe-${Date.now()}-${Math.random()}`,
      topic: 'persamaan-eksponen',
      topicLabel: TOPIC_LABELS['persamaan-eksponen'],
      difficulty: 'Menengah',
      prompt: `Tentukan nilai x yang memenuhi 2^(x + ${offset}) = ${rhsVal}.`,
      ...sh,
      hint: `Ubah ${rhsVal} ke basis 2 terlebih dahulu. Karena basis 2 > 0 dan ≠ 1, pangkatnya pasti sama.`,
      steps: [
        `${rhsVal} = 2^${rhsExp}, sehingga x + ${offset} = ${rhsExp} ⇒ x = ${xSol}.`,
      ],
    });
  }

  // 10. Aplikasi Nyata (Bakteri / Peluruhan)
  {
    const n0 = pick([5, 10, 15, 20]);
    const cycles = randInt(3, 5);
    const total = n0 * Math.pow(2, cycles);
    const sh = shuffleOptions(`${total} sel`, [
      `${n0 * cycles * 2} sel`,
      `${n0 * Math.pow(2, cycles - 1)} sel`,
      `${total * 2} sel`,
    ]);
    generated.push({
      id: `dyn-app-${Date.now()}-${Math.random()}`,
      topic: 'aplikasi-nyata',
      topicLabel: TOPIC_LABELS['aplikasi-nyata'],
      difficulty: 'Menengah',
      prompt: `Koloni awal berisi ${n0} bakteri yang membelah menjadi dua setiap periode. Berapa jumlah bakteri setelah ${cycles} kali pembelahan?`,
      ...sh,
      hint: `Gunakan model N = ${n0} × 2^${cycles}.`,
      steps: [`${n0} × 2^${cycles} = ${n0} × ${Math.pow(2, cycles)} = ${total} sel.`],
    });
  }

  // Shuffle order of the generated questions and if more than 10 requested, supplement from curated bank
  if (count > generated.length) {
    const extraPool = [...CURATED_QUESTION_BANK].sort(() => Math.random() - 0.5);
    while (generated.length < count && extraPool.length > 0) {
      const next = extraPool.pop()!;
      const sh = shuffleOptions(next.options[next.correctIndex], next.options.filter((_, i) => i !== next.correctIndex));
      generated.push({ ...next, ...sh });
    }
  }

  return generated.slice(0, count).sort(() => Math.random() - 0.5);
}
