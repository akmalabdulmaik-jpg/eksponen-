import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Compass,
  Gamepad2,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { MathBannerOrnament } from './MathOrnaments';

export type PageId = 'menu' | 'peraga' | 'permainan' | 'latihan' | 'lomba';

interface MenuPageProps {
  onNavigate: (page: PageId) => void;
}

const MODULE_CARDS: Array<{
  page: Exclude<PageId, 'menu'>;
  index: string;
  title: string;
  subtitle: string;
  highlight: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  btnBg: string;
  icon: React.ComponentType<{ className?: string }>;
  ornament: 'peraga' | 'permainan' | 'latihan' | 'lomba';
}> = [
  {
    page: 'peraga',
    index: '01',
    title: 'Alat Peraga & Lab Eksponen',
    subtitle:
      'Timbangan kesamaan pangkat (a = 1, 0, -1), bedah 4 syarat persamaan h(x)^f(x) = h(x)^g(x), grafik kurva, dan 7 sifat eksponen.',
    highlight: 'Mengatasi miskonsepsi syarat basis secara visual',
    accentBg: 'from-[#0f766e] to-[#0d9488]',
    accentBorder: 'border-[#99f6e4]',
    accentText: 'text-[#0f766e]',
    btnBg: 'bg-[#0d9488] hover:bg-[#0f766e]',
    icon: Compass,
    ornament: 'peraga',
  },
  {
    page: 'permainan',
    index: '02',
    title: 'Arena Permainan Edukatif',
    subtitle:
      'Mainkan Detektif Syarat Basis (60 detik) untuk membedakan mana yang aman dicoret dan mana jebakan, plus Rakit Target Pangkat.',
    highlight: '2 mode permainan interaktif dengan sistem kombo',
    accentBg: 'from-[#c2410c] to-[#ea580c]',
    accentBorder: 'border-[#fed7aa]',
    accentText: 'text-[#c2410c]',
    btnBg: 'bg-[#ea580c] hover:bg-[#c2410c]',
    icon: Gamepad2,
    ornament: 'permainan',
  },
  {
    page: 'latihan',
    index: '03',
    title: 'Latihan & Tes (125+ Soal)',
    subtitle:
      'Jelajahi bank lebih dari 125 soal eksponen terstruktur dengan pembahasan lengkap, generator soal baru, dan tes diagnostik otomatis.',
    highlight: '125 soal kurasi + pembangkit soal acak berkelanjutan',
    accentBg: 'from-[#5b21b6] to-[#6d28d9]',
    accentBorder: 'border-[#ddd6fe]',
    accentText: 'text-[#5b21b6]',
    btnBg: 'bg-[#6d28d9] hover:bg-[#5b21b6]',
    icon: BookOpen,
    ornament: 'latihan',
  },
  {
    page: 'lomba',
    index: '04',
    title: 'Lomba Online Multiplayer',
    subtitle:
      'Buat ruang lomba atau masuk dengan Kode Ruangan + PIN keamanan. Berlomba 10 soal acak yang selalu berubah secara real-time!',
    highlight: 'Verifikasi PIN scrypt + anti-tebak + 10 soal dinamis',
    accentBg: 'from-[#9f1239] to-[#be123c]',
    accentBorder: 'border-[#fecdd3]',
    accentText: 'text-[#9f1239]',
    btnBg: 'bg-[#be123c] hover:bg-[#9f1239]',
    icon: Trophy,
    ornament: 'lomba',
  },
];

export const MenuPage: React.FC<MenuPageProps> = ({ onNavigate }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="space-y-8">
      {/* Hero Banner with Mathematical Illustration */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#0f766e] text-white flex flex-col justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#99f6e4]">
              Media Pembelajaran Matematika Interaktif · Materi Eksponen
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[40px] font-bold leading-[1.15] text-white">
              Kuasai Eksponen dan Rahasia Syarat Basis dalam Kesamaan Pangkat
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#e0e7ff] leading-relaxed max-w-xl">
              Gunakan laci navigasi di samping atau pilih ruang belajar di bawah ini. Setiap modul
              dibuka pada halamannya sendiri agar fokus belajarmu terjaga dari alat peraga hingga
              lomba online multiplayer.
            </p>
          </div>

          {/* Core Problem Alert Card (Clean hairline border, no border-l-4) */}
          <div className="mt-6 rounded-xl bg-white/10 border border-white/20 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#fde68a] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs sm:text-sm text-[#fef3c7] leading-relaxed">
              <strong className="text-white">Fokus Masalah Siswa:</strong> Pada persamaan{' '}
              <span className="font-math font-bold text-[#fde68a]">aᵐ = aⁿ</span>, menyimpulkan{' '}
              <span className="font-math font-bold text-[#fde68a]">m = n</span> hanya sah jika{' '}
              <span className="font-math font-bold text-[#99f6e4]">a &gt; 0 dan a ≠ 1</span>.
              Saat basis bernilai 1, 0, -1, atau berupa fungsi h(x), aturan tersebut memiliki pengecualian!
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('peraga')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f59e0b] text-[#1e1b4b] font-bold text-sm hover:bg-[#fbbf24] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Mulai dari Alat Peraga
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('lomba')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white font-semibold text-sm hover:bg-white/25 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Masuk Lomba Online 10 Soal
            </button>
          </div>
        </div>

        {/* Visual Showcase Image with Fallback */}
        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#e5dfd3] bg-[#1e1b4b] flex flex-col justify-between">
          <div className="relative flex-1 min-h-[240px]">
            {!imgFailed ? (
              <img
                src="/src/assets/images/hero_exponential_math_1795606759486.jpg"
                alt="Ilustrasi kurva eksponensial, garis singgung, dan busur geometri matematika"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-[#1e1b4b] to-[#0f766e]">
                <MathBannerOrnament variant="peraga" className="w-full max-w-xs" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1e1b4b]/95 via-[#1e1b4b]/70 to-transparent p-5">
              <div className="font-math text-sm font-bold text-[#fde68a]">
                y = aˣ · Fungsi Injektif vs Basis Khusus
              </div>
              <p className="text-xs text-[#e0e7ff] mt-1">
                Kurva naik/turun tegas untuk a &gt; 0, a ≠ 1 menjamin setiap nilai y hanya berasal
                dari tepat satu nilai x.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Dedicated Pages Directory */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1e1b4b]">
            Menu Ruang Belajar & Kompetisi
          </h2>
          <span className="text-xs font-semibold text-[#52526c]">
            Pilih salah satu halaman · Tersedia juga di Laci Navigasi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MODULE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.page}
                className={`bg-white border ${card.accentBorder} rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(30,27,75,0.05)] flex flex-col justify-between`}
              >
                {/* Colorful Math Ornament Header Strip */}
                <div
                  className={`bg-gradient-to-r ${card.accentBg} px-6 py-4 text-white flex items-center justify-between gap-4`}
                >
                  <div>
                    <div className="font-math text-xs font-semibold text-white/85">
                      Halaman {card.index}
                    </div>
                    <h3 className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
                      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>{card.title}</span>
                    </h3>
                  </div>
                  <MathBannerOrnament variant={card.ornament} className="w-32 h-16 shrink-0" />
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-[#3f3f58] leading-relaxed">{card.subtitle}</p>
                    <p className={`text-xs font-semibold ${card.accentText}`}>{card.highlight}</p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => onNavigate(card.page)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold transition-colors cursor-pointer ${card.btnBg}`}
                    >
                      Buka Halaman {card.index}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Proof Summary Strip */}
      <section className="bg-white border border-[#e5dfd3] rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div>
          <div className="font-math text-2xl font-bold text-[#0d9488] tabular-nums">4 Syarat</div>
          <div className="text-xs font-semibold text-[#1e1b4b] mt-1">
            Kasus Basis h(x)^f(x) = h(x)^g(x)
          </div>
          <p className="text-xs text-[#52526c] mt-1">
            f = g, basis = 1, basis = 0 (pangkat &gt; 0), dan basis = -1 (paritas sama).
          </p>
        </div>
        <div>
          <div className="font-math text-2xl font-bold text-[#ea580c] tabular-nums">2 Game</div>
          <div className="text-xs font-semibold text-[#1e1b4b] mt-1">
            Detektif Basis & Rakit Target
          </div>
          <p className="text-xs text-[#52526c] mt-1">
            Latih refleks mengenali jebakan kesamaan pangkat dalam hitungan detik.
          </p>
        </div>
        <div>
          <div className="font-math text-2xl font-bold text-[#6d28d9] tabular-nums">125+ Soal</div>
          <div className="text-xs font-semibold text-[#1e1b4b] mt-1">
            Bank Soal & Tes Diagnostik
          </div>
          <p className="text-xs text-[#52526c] mt-1">
            Lengkap dengan pembangkit soal acak baru dan analisis kelemahan topik.
          </p>
        </div>
        <div>
          <div className="font-math text-2xl font-bold text-[#be123c] tabular-nums flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-[#16865b]" aria-hidden="true" />
            10 Soal Live
          </div>
          <div className="text-xs font-semibold text-[#1e1b4b] mt-1">
            Lomba Multiplayer Ber-PIN Aman
          </div>
          <p className="text-xs text-[#52526c] mt-1">
            Soal selalu berubah tiap ronde dengan hash scrypt dan pembatas percobaan PIN.
          </p>
        </div>
      </section>
    </div>
  );
};
