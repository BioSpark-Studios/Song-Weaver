
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AlbumBlock, AlbumBlockType, Track } from '../types';
import { PlayIcon, PauseIcon, NextTrackIcon, PrevTrackIcon, AlbumIcon } from './IconComponents';

interface AlbumPreviewProps {
    albumBlocks: AlbumBlock[];
}

const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const AlbumPreview: React.FC<AlbumPreviewProps> = ({ albumBlocks }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const headerBlock = useMemo(() => albumBlocks.find(b => b.type === AlbumBlockType.HEADER), [albumBlocks]);
    const tracklistBlock = useMemo(() => albumBlocks.find(b => b.type === AlbumBlockType.TRACKLIST), [albumBlocks]);
    const tracks: Track[] = useMemo(() => tracklistBlock?.value || [], [tracklistBlock]);
    
    const header = headerBlock?.value || { title: 'Album Title', artist: 'Artist Name', coverArt: null };
    
    const playTrack = useCallback((index: number) => {
        if (index >= 0 && index < tracks.length) {
            const trackUrl = tracks[index].url;
            if (!trackUrl) {
                console.warn(`Track ${index + 1} has no URL.`);
                return;
            }
            setCurrentTrackIndex(index);
            setIsPlaying(true);
            if (audioRef.current) {
                audioRef.current.src = trackUrl;
                audioRef.current.play().catch(e => {
                    console.error("Error playing audio:", e.message);
                    setIsPlaying(false);
                });
            }
        }
    }, [tracks]);
    
    const togglePlayPause = useCallback(() => {
        if (isPlaying) {
             setIsPlaying(false);
        } else {
            if (currentTrackIndex === null && tracks.length > 0) {
                playTrack(0); // Start from the first track
            } else if (currentTrackIndex !== null) {
                setIsPlaying(true); // Resume
            }
        }
    }, [isPlaying, currentTrackIndex, tracks.length, playTrack]);

    const handleNext = useCallback(() => {
        if (tracks.length === 0) return;
        if (currentTrackIndex !== null) {
            playTrack((currentTrackIndex + 1) % tracks.length);
        } else {
             playTrack(0);
        }
    }, [currentTrackIndex, tracks.length, playTrack]);

    const handlePrev = useCallback(() => {
        if (tracks.length === 0) return;
        if (currentTrackIndex !== null) {
            playTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);
        } else {
            playTrack(tracks.length - 1);
        }
    }, [currentTrackIndex, tracks.length, playTrack]);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch(e => console.error("Error resuming audio:", e.message));
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => handleNext();
        const handleError = () => console.error('Audio playback error occurred.');

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [handleNext]);

    // Cleanup blob URLs on unmount or when tracks change
    useEffect(() => {
        return () => {
            tracks.forEach(track => {
                if (track.url && track.url.startsWith('blob:')) {
                    URL.revokeObjectURL(track.url);
                }
            });
        };
    }, [tracks]);

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Number(e.target.value);
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-800/40 rounded-lg overflow-hidden">
            <audio ref={audioRef} />
            <div className="p-6 flex-shrink-0 flex items-center space-x-6 bg-slate-900/50">
                <div className="w-32 h-32 bg-slate-700 rounded-md flex-shrink-0 shadow-lg overflow-hidden">
                    {header.coverArt ? (
                        <img src={header.coverArt} alt={header.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                           <AlbumIcon />
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white leading-tight">{header.title}</h2>
                    <p className="text-lg text-slate-300">{header.artist}</p>
                    <div className="mt-4 flex items-center space-x-4">
                        <button onClick={handlePrev} disabled={tracks.length === 0} className="text-slate-300 hover:text-white transition-colors disabled:opacity-50">
                            <PrevTrackIcon />
                        </button>
                        <button onClick={togglePlayPause} disabled={tracks.length === 0} className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-accent text-white hover:bg-primary transition-colors disabled:opacity-50">
                           {isPlaying ? <PauseIcon className="h-8 w-8"/> : <PlayIcon className="h-8 w-8" />}
                        </button>
                        <button onClick={handleNext} disabled={tracks.length === 0} className="text-slate-300 hover:text-white transition-colors disabled:opacity-50">
                            <NextTrackIcon />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 flex-shrink-0 flex items-center space-x-3">
                <span className="text-xs font-mono text-slate-400">{formatTime(currentTime)}</span>
                 <input
                    type="range"
                    value={currentTime}
                    max={duration || 0}
                    onChange={handleProgressChange}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                        backgroundSize: `${(currentTime / duration) * 100}% 100%`,
                        backgroundImage: `linear-gradient(to right, rgb(var(--color-primary-accent)), rgb(var(--color-primary-accent)) ${(currentTime / duration) * 100}%, #475569 ${(currentTime / duration) * 100}%)`
                    }}
                />
                <span className="text-xs font-mono text-slate-400">{formatTime(duration)}</span>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {tracks.map((track, index) => (
                        <li 
                            key={track.id} 
                            onClick={() => playTrack(index)}
                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors duration-200 group ${
                                currentTrackIndex === index ? 'bg-primary-accent/20' : 'hover:bg-slate-700/50'
                            }`}
                        >
                            <div className="flex items-center space-x-4">
                                <span className={`font-mono text-sm w-5 ${currentTrackIndex === index ? 'text-primary-accent' : 'text-slate-400'}`}>
                                    {index + 1}
                                </span>
                                <span className={`font-medium ${currentTrackIndex === index ? 'text-white' : 'text-slate-300'}`}>
                                    {track.title}
                                </span>
                            </div>
                            <button className={`transition-opacity ${currentTrackIndex === index && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                               {currentTrackIndex === index && isPlaying ? (
                                   <PauseIcon className="h-5 w-5 text-primary-accent"/>
                               ) : (
                                   <PlayIcon className="h-5 w-5 text-slate-300"/>
                               )}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AlbumPreview;
