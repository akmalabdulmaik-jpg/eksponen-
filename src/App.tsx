import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Gamepad2,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Trophy,
  X,
} from 'lucide-react';
import { AlatPeragaPage } from './components/AlatPeragaPage';
import { BasisGame } from './components/BasisGame';
import { MathBannerOrnament } from './components/MathOrnaments';
import { MenuPage, PageId } from './components/MenuPage';
import { MultiplayerArena } from './components/MultiplayerArena';
import { TestAndBank } from './components/TestAndBank';

interface DrawerNavItem {
  id: PageId;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
  badgeColor: string;
}

const DRAWER_ITEMS: DrawerNavItem[] = [
  {
    id: 'menu',
    label: 'Menu Utama',
    shortDesc: 'Beranda & peta konsep',
    icon: Home,
    activeClass: 'bg-[#1e1b4b] text-white',
    badgeColor: 'text-[#4338ca]',
  },
  {
    id: 'peraga',
    label: 'Alat Peraga',
    shortDesc: 'Timbangan syarat basis & lab',
    icon: Compass,
    activeClass: 'bg-[#0d9488] text-white',
    badgeColor: 'text-[#0d9488]',
  },
  {
    id: 'permainan',
    label: 'Permainan',
    shortDesc: 'Detektif basis & rakit target',
    icon: Gamepad2,
    activeClass: 'bg-[#ea580c] text-white',
    badgeColor: 'text-[#ea580c]',
  },
  {
    id: 'latihan',
    label: 'Latihan & Tes (125+)',
    shortDesc: 'Bank 125+ soal & evaluasi',
    icon: BookOpen,
    activeClass: 'bg-[#6d28d9] text-white',
    badgeColor: 'text-[#6d28d9]',
  },
  {
    id: 'lomba',
    label: 'Lomba Online',
    shortDesc: 'Multiplayer 10 soal ber-PIN',
    icon: Trophy,
    activeClass: 'bg-[#be123c] text-white',
    badgeColor: 'text-[#be123c]',
  },
];

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('menu');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const navigateTo = (page: PageId) => {
    setActivePage(page);
    setMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeNavMeta = DRAWER_ITEMS.find((i) => i.id === activePage) ?? DRAWER_ITEMS[0];

  return (
    <div className="min-h-screen bg-math-grid text-[#1e1b4b] flex flex-col">
      {/* Three-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#1e1b4b] text-white border-b border-[#312e81] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Drawer Toggle + Single-Line Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Desktop drawer toggle */}
            <button
              type="button"
              onClick={() => setDrawerOpen((o) => !o)}
              aria-label={drawerOpen ? 'Tutup laci navigasi' : 'Buka laci navigasi'}
              className="hidden lg:inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              {drawerOpen ? (
                <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            {/* Mobile drawer toggle */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen((o) => !o)}
              aria-label="Buka laci menu"
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
            </button>

            <a
              href="#menu"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('menu');
              }}
              className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0"
            >
              Eksponen
            </a>
          </div>

          {/* Zone 2: Concise single-line page links */}
          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#e0e7ff]"
          >
            {DRAWER_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(item.id);
                  }}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                    isActive
                      ? 'text-[#fde68a] border-[#fde68a]'
                      : 'text-[#e0e7ff] border-transparent hover:text-white hover:border-[#99f6e4]'
                  }`}
                >
                  {item.label === 'Latihan & Tes (125+)' ? 'Latihan & Tes' : item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('lomba')}
              className="px-4 py-2 rounded-xl bg-[#f59e0b] text-[#1e1b4b] text-xs sm:text-sm font-bold hover:bg-[#fbbf24] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fde68a]"
            >
              Lomba Online
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer ("Laci Navigasi") */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#1e1b4b]/50 backdrop-blur-[2px]"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white border-r border-[#e5dfd3] h-full flex flex-col justify-between p-5 shadow-xl z-50 overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5dfd3]">
                <span className="font-display text-lg font-bold text-[#1e1b4b]">
                  Laci Navigasi
                </span>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Tutup laci"
                  className="p-1.5 rounded-lg text-[#52526c] hover:bg-[#f5f7fb] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {DRAWER_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                        active
                          ? item.activeClass
                          : 'text-[#1e1b4b] hover:bg-[#f5f3ee]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${active ? 'text-white' : item.badgeColor}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">{item.label}</div>
                        <div
                          className={`text-[11px] truncate ${
                            active ? 'text-white/85' : 'text-[#52526c]'
                          }`}
                        >
                          {item.shortDesc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="mt-6 rounded-xl bg-[#fef3c7] border border-[#fde68a] p-4 space-y-1.5">
              <div className="text-xs font-bold text-[#92400e]">Ingat Syarat Basis!</div>
              <p className="font-math text-xs text-[#78350f]">
                aᵐ = aⁿ ⇒ m = n hanya sah jika a &gt; 0 dan a ≠ 1.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Main Body: Collapsible Left Drawer (Desktop) + Single Dedicated Active Page */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex items-start">
        {/* Desktop Collapsible Drawer ("Laci") */}
        {drawerOpen && (
          <aside
            aria-label="Laci Navigasi Halaman"
            className="hidden lg:flex w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-white/95 border-r border-[#e5dfd3] flex-col justify-between p-5 overflow-y-auto"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wide text-[#52526c]">
                  Laci Halaman Belajar
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Sembunyikan laci"
                  className="text-xs font-semibold text-[#4338ca] hover:underline cursor-pointer"
                >
                  Lipat
                </button>
              </div>

              <nav className="space-y-2">
                {DRAWER_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer border ${
                        active
                          ? `${item.activeClass} border-transparent shadow-sm`
                          : 'bg-[#fbf8f3] border-[#e5dfd3] text-[#1e1b4b] hover:bg-[#f3efe6]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${active ? 'text-white' : item.badgeColor}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">{item.label}</div>
                        <div
                          className={`text-[11px] truncate ${
                            active ? 'text-white/85' : 'text-[#52526c]'
                          }`}
                        >
                          {item.shortDesc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mathematical Quick Reference Card in Drawer */}
            <div className="mt-6 rounded-xl bg-gradient-to-br from-[#fef3c7] to-[#ffedd5] border border-[#fed7aa] p-4 space-y-2">
              <div className="text-xs font-bold text-[#9a3412]">
                Catatan Cepat Syarat Basis
              </div>
              <div className="font-math text-xs text-[#1e1b4b] space-y-1">
                <div>1. aᵐ = aⁿ ⇒ m = n (a &gt; 0, a ≠ 1)</div>
                <div>2. h(x) = 1 → selalu benar</div>
                <div>3. h(x) = 0 → f(x), g(x) &gt; 0</div>
                <div>4. h(x) = -1 → paritas sama</div>
              </div>
            </div>
          </aside>
        )}

        {/* Single Dedicated Page Viewport */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* Page Breadcrumb & Quick Drawer Re-open when collapsed */}
          {activePage !== 'menu' && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#e5dfd3]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateTo('menu')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e5dfd3] text-xs font-semibold text-[#1e1b4b] hover:bg-[#f5f3ee] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  Kembali ke Menu
                </button>
                <span className="text-xs font-semibold text-[#52526c]">
                  Menu Utama / <strong className="text-[#1e1b4b]">{activeNavMeta.label}</strong>
                </span>
              </div>

              {!drawerOpen && (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e5dfd3] text-xs font-semibold text-[#4338ca] hover:bg-[#eef2ff] cursor-pointer"
                >
                  <PanelLeftOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  Buka Laci Navigasi
                </button>
              )}
            </div>
          )}

          {/* PAGE 0: MENU UTAMA */}
          {activePage === 'menu' && <MenuPage onNavigate={navigateTo} />}

          {/* PAGE 1: ALAT PERAGA */}
          {activePage === 'peraga' && (
            <AlatPeragaPage onGoToTest={() => navigateTo('latihan')} />
          )}

          {/* PAGE 2: PERMAINAN */}
          {activePage === 'permainan' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-r from-[#9a3412] via-[#c2410c] to-[#ea580c] text-white p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                <div className="space-y-2 max-w-2xl">
                  <div className="font-math text-xs font-semibold text-[#fed7aa]">
                    Halaman 02 · Arena Permainan Matematika
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Permainan Detektif Syarat Basis & Rakit Target
                  </h1>
                  <p className="text-sm text-[#ffedd5] leading-relaxed">
                    Asah ketelitian membedakan persamaan yang boleh langsung disamakan pangkatnya
                    dari jebakan basis 1, 0, dan -1 dalam permainan berbatas waktu.
                  </p>
                </div>
                <MathBannerOrnament variant="permainan" className="w-56 h-28 shrink-0 hidden sm:block" />
              </div>
              <BasisGame />
            </div>
          )}

          {/* PAGE 3: LATIHAN & TES 125+ SOAL */}
          {activePage === 'latihan' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-r from-[#4c1d95] via-[#5b21b6] to-[#6d28d9] text-white p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                <div className="space-y-2 max-w-2xl">
                  <div className="font-math text-xs font-semibold text-[#ddd6fe]">
                    Halaman 03 · Latihan Soal & Tes Evaluasi
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Bank 125+ Soal Eksponen & Tes Diagnostik Mandiri
                  </h1>
                  <p className="text-sm text-[#ede9fe] leading-relaxed">
                    Uji pemahamanmu melalui tes acak 10–30 soal dengan analisis otomatis syarat
                    basis, atau jelajahi seluruh bank 125+ soal lengkap dengan pembahasan.
                  </p>
                </div>
                <MathBannerOrnament variant="latihan" className="w-56 h-28 shrink-0 hidden sm:block" />
              </div>
              <TestAndBank />
            </div>
          )}

          {/* PAGE 4: LOMBA ONLINE MULTIPLAYER */}
          {activePage === 'lomba' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-r from-[#881337] via-[#9f1239] to-[#be123c] text-white p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                <div className="space-y-2 max-w-2xl">
                  <div className="font-math text-xs font-semibold text-[#fecdd3]">
                    Halaman 04 · Lomba Online Multiplayer
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Kompetisi 10 Soal Eksponen Real-Time Ber-PIN Aman
                  </h1>
                  <p className="text-sm text-[#ffe4e6] leading-relaxed">
                    Buat ruang lomba atau masuk memakai Kode Ruangan dan Kode Keamanan (PIN).
                    Setiap ronde menyajikan 10 soal acak baru yang berbeda untuk semua peserta!
                  </p>
                </div>
                <MathBannerOrnament variant="lomba" className="w-56 h-28 shrink-0 hidden sm:block" />
              </div>
              <MultiplayerArena />
            </div>
          )}
        </main>
      </div>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#e5dfd3] bg-white">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#52526c]">
          <div>
            Eksponen — Media Pembelajaran Matematika · Alat Peraga Syarat Basis, Permainan, Bank
            125+ Soal, & Lomba Online Multiplayer.
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {DRAWER_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(item.id);
                }}
                className="hover:text-[#1e1b4b] whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
