
import React from 'react';
import { Page } from '../App';
import { useSettings } from '../contexts/SettingsContext';
import { SettingsIcon, PromoKitIcon } from './IconComponents';

const MusicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-accent" viewBox="0 0 20 20" fill="currentColor">
    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V8.82l8-1.6v5.894A4.37 4.37 0 0015 13c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V4a1 1 0 00-.804-.98l-10-2zM5 18a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const NavButton: React.FC<{
  label: string;
  page: Page;
  activePage: Page;
  onClick: (page: Page) => void;
}> = ({ label, page, activePage, onClick }) => {
  const isActive = activePage === page;
  return (
    <button
      onClick={() => onClick(page)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-primary-accent/20 text-primary-accent'
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );
};


interface HeaderProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
    onExportKit: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, onExportKit }) => {
  const { settings } = useSettings();

  return (
    <header className="bg-slate-900/70 backdrop-blur-sm sticky top-0 z-20 p-4 border-b border-slate-700/50 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <MusicIcon />
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Song <span className="text-primary-accent">Weaver</span>
          </h1>
          <p className="text-xs text-slate-400 -mt-1">by {settings.studioName || 'BioSpark Studios'}</p>
        </div>
      </div>
      
      <nav className="flex items-center space-x-2 bg-slate-800/60 p-1 rounded-lg">
          <NavButton label="Song Weaver" page="weaver" activePage={activePage} onClick={setActivePage} />
          <NavButton label="Artist Bio" page="bio" activePage={activePage} onClick={setActivePage} />
          <NavButton label="Albums" page="album" activePage={activePage} onClick={setActivePage} />
      </nav>

      <div className="flex items-center space-x-2">
        <button 
            onClick={onExportKit} 
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors duration-200"
            title="Export Promo Kit (.md)"
        >
            <PromoKitIcon />
        </button>
        <button 
            onClick={() => setActivePage('settings')} 
            className={`p-2 rounded-full transition-colors duration-200 ${activePage === 'settings' ? 'bg-primary-accent/20 text-primary-accent' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
            title="Settings"
        >
            <SettingsIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;