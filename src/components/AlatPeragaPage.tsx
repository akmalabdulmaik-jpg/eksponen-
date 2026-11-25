import React, { useState } from 'react';
import { BasisConditionProps } from './BasisConditionProps';
import { ConceptHero } from './ConceptHero';
import { ExponentLab } from './ExponentLab';
import { ExponentLaws } from './ExponentLaws';
import { MathBannerOrnament } from './MathOrnaments';

type AlatTab = 'syarat-basis' | 'laboratorium' | 'sifat-pangkat';

interface AlatPeragaPageProps {
  onGoToTest: () => void;
}

export const AlatPeragaPage: React.FC<AlatPeragaPageProps> = ({ onGoToTest }) => {
  const [activeTab, setActiveTab] = useState<AlatTab>('syarat-basis');
  const [labPreset, setLabPreset] = useState<{ base: number; exp: number }>({
    base: 2,
    exp: 4,
  });

  const handleOpenLabPreset = (presetBase = 2, presetExp = 4) => {
    setLabPreset({ base: presetBase, exp: presetExp });
    setActiveTab('laboratorium');
  };

  return (
    <div className="space-y-6">
      {/* Colored Mathematical Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#0d9488] text-white p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="font-math text-xs font-semibold text-[#99f6e4]">
            Halaman 01 · Ruang Alat Peraga Interaktif
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Alat Peraga Eksponen & Investigasi Syarat Basis
          </h1>
          <p className="text-sm text-[#ccfbf1] leading-relaxed">
            Eksplorasi langsung mengapa kesamaan pangkat aᵐ = aⁿ bergantung pada syarat basis a &gt; 0
            dan a ≠ 1, amati kurva y = aˣ, serta uji 7 sifat eksponen secara numerik.
          </p>
        </div>
        <MathBannerOrnament variant="peraga" className="w-56 h-28 shrink-0 hidden sm:block" />
      </div>

      {/* Sub-navigation within Alat Peraga Page */}
      <div className="bg-white border border-[#99f6e4] rounded-2xl p-2 flex flex-wrap items-center gap-2 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('syarat-basis')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'syarat-basis'
              ? 'bg-[#0d9488] text-white'
              : 'text-[#1e1b4b] hover:bg-[#f0fdfa]'
          }`}
        >
          1. Timbangan & 4 Syarat Basis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('laboratorium')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'laboratorium'
              ? 'bg-[#0d9488] text-white'
              : 'text-[#1e1b4b] hover:bg-[#f0fdfa]'
          }`}
        >
          2. Laboratorium Kurva & Anatomi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sifat-pangkat')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'sifat-pangkat'
              ? 'bg-[#0d9488] text-white'
              : 'text-[#1e1b4b] hover:bg-[#f0fdfa]'
          }`}
        >
          3. 7 Sifat Eksponen & Jebakan
        </button>
      </div>

      {activeTab === 'syarat-basis' && <BasisConditionProps />}

      {activeTab === 'laboratorium' && (
        <div className="space-y-6">
          <ExponentLab initialBase={labPreset.base} initialExp={labPreset.exp} />
          <ConceptHero
            onOpenLab={handleOpenLabPreset}
            onOpenMissions={onGoToTest}
          />
        </div>
      )}

      {activeTab === 'sifat-pangkat' && <ExponentLaws />}
    </div>
  );
};
