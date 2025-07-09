
import React from 'react';
import { BlockType } from '../types';
import { StructureIcon, LyricsIcon, GenreIcon, MoodIcon, DynamicsIcon, ProductionIcon, InstrumentIcon, VocalsIcon, TempoIcon, SoundEffectIcon, CustomBlockIcon } from './IconComponents';

interface SidebarProps {
  onAddBlock: (type: BlockType) => void;
}

const SidebarButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center space-x-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
        <div className="text-cyan-400">{icon}</div>
        <span className="text-slate-200 font-medium">{label}</span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ onAddBlock }) => {
  const blockTypes = [
    { type: BlockType.STRUCTURE, icon: <StructureIcon />, label: 'Structure' },
    { type: BlockType.LYRICS, icon: <LyricsIcon />, label: 'Lyrics' },
    { type: BlockType.GENRE, icon: <GenreIcon />, label: 'Genre' },
    { type: BlockType.MOOD, icon: <MoodIcon />, label: 'Mood & Atmosphere' },
    { type: BlockType.DYNAMICS, icon: <DynamicsIcon />, label: 'Dynamics & Rhythm' },
    { type: BlockType.PRODUCTION, icon: <ProductionIcon />, label: 'Production Style' },
    { type: BlockType.INSTRUMENTATION, icon: <InstrumentIcon />, label: 'Instrumentation' },
    { type: BlockType.VOCALS, icon: <VocalsIcon />, label: 'Vocals' },
    { type: BlockType.TEMPO, icon: <TempoIcon />, label: 'Tempo' },
    { type: BlockType.SOUND_EFFECT, icon: <SoundEffectIcon />, label: 'Sound Effect' },
    { type: BlockType.CUSTOM, icon: <CustomBlockIcon />, label: 'Custom Tag' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-300 px-2">Add Blocks</h2>
      <div className="space-y-2">
        {blockTypes.map(({ type, icon, label }) => (
          <SidebarButton 
            key={type}
            icon={icon}
            label={label}
            onClick={() => onAddBlock(type)}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
