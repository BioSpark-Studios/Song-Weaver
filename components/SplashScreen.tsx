
import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface SplashScreenProps {
    isVisible: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible }) => {
    const { settings } = useSettings();
    const bgStyle = settings.splashBackground ? { backgroundImage: `url(${settings.splashBackground})` } : {};

    return (
        <div 
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 bg-cover bg-center transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={bgStyle}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            
            <div className="relative z-10 text-center text-white animate-fade-in-up">
                <h1 className="text-6xl font-bold tracking-tight" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
                    Song <span style={{color: 'rgb(var(--color-primary-accent))'}}>Weaver</span>
                </h1>
                <p className="text-xl text-slate-300 mt-2" style={{textShadow: '0 1px 5px rgba(0,0,0,0.5)'}}>
                    by {settings.studioName || 'BioSpark Studios'}
                </p>
            </div>
            
            <style>
                {`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 1s ease-out forwards;
                }
                `}
            </style>
        </div>
    );
};

export default SplashScreen;
