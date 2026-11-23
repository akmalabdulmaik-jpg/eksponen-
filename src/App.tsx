import { useState } from 'react';
import { BasisConditionProps } from './components/BasisConditionProps';
import { BasisGame } from './components/BasisGame';
import { ConceptHero } from './components/ConceptHero';
import { ExponentLab } from './components/ExponentLab';
import { ExponentLaws } from './components/ExponentLaws';
import { MultiplayerArena } from './components/MultiplayerArena';
import { TestAndBank } from './components/TestAndBank';

type SectionKey = 'peraga' | 'permainan' | 'tes' | 'lomba';

const NAV_ITEMS: Array<{ id: SectionKey; label: string; href: string }> = [
  { id: 'peraga', label: 'Alat Peraga', href: '#peraga' },
  { id: 'permainan', label: 'Permainan', href: '#permainan' },
  { id: 'tes', label: 'Tes 125+', href: '#tes' },
  { id: 'lomba', label: 'Lomba Online', href: '#lomba' },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionKey>('peraga');
  const [labPreset, setLabPreset] = useState<{ base: number; exp: number }>({
    base: 2,
    exp: 4,
  });

  const scrollToElement = (elementId: string, navKey: SectionKey) => {
    setActiveSection(navKey);
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenLabWithPreset = (presetBase = 2, presetExp = 4) => {
    setLabPreset({ base: presetBase, exp: presetExp });
    scrollToElement('laboratorium', 'peraga');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#172033] flex flex-col">
      {/* Three-Zone Top Bar Contract */}
      <header className="bg-[#172554] text-white border-b border-[#253672]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <a
            href="#peraga"
            onClick={(e) => {
              e.preventDefault();
              scrollToElement('peraga', 'peraga');
            }}
            className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            Eksponen
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#dce4ff]"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToElement(item.id, item.id);
                  }}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                    isActive
                      ? 'text-white border-[#b9f1ea]'
                      : 'text-[#dce4ff] border-transparent hover:text-white hover:border-[#b9f1ea]/60'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => scrollToElement('lomba', 'lomba')}
              className="px-4 py-2 rounded-xl bg-[#3858d6] text-white text-xs sm:text-sm font-semibold hover:bg-[#4b6be8] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9f1ea]"
            >
              Ikut Lomba
            </button>
          </div>
        </div>

        {/* Mobile single-line section bar */}
        <nav
          aria-label="Navigasi bagian"
          className="md:hidden border-t border-[#253672] px-5 py-2 flex items-center gap-5 overflow-x-auto text-xs font-medium text-[#dce4ff]"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToElement(item.id, item.id);
              }}
              className="py-1 whitespace-nowrap shrink-0 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Main Content Container (1200px baseline) */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-5 sm:px-8 py-8 sm:py-10 space-y-10">
        <div id="peraga" className="scroll-mt-6 space-y-10">
          <ConceptHero
            onOpenLab={handleOpenLabWithPreset}
            onOpenMissions={() => scrollToElement('tes', 'tes')}
          />
          <BasisConditionProps />
        </div>

        <div id="laboratorium" className="scroll-mt-6 space-y-10">
          <ExponentLab initialBase={labPreset.base} initialExp={labPreset.exp} />
          <ExponentLaws />
        </div>

        <div id="permainan" className="scroll-mt-6">
          <BasisGame />
        </div>

        <div id="tes" className="scroll-mt-6">
          <TestAndBank />
        </div>

        <div id="lomba" className="scroll-mt-6">
          <MultiplayerArena />
        </div>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#e4e9f2] bg-white">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#5a657a]">
          <div>
            Eksponen — Media Pembelajaran Matematika · Alat Peraga Syarat Basis, Permainan, Bank 125+ Soal, & Lomba Online Multiplayer.
          </div>
          <div className="flex items-center gap-5">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToElement(item.id, item.id);
                }}
                className="hover:text-[#172554] whitespace-nowrap shrink-0"
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
