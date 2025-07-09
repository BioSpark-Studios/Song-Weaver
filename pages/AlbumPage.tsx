
import React, { useCallback, useEffect } from 'react';
import { AlbumBlock, AlbumBlockType } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import AlbumNodeCard from '../components/AlbumNodeCard';
import AlbumPreview from '../components/AlbumPreview';
import { AlbumIcon, TracklistIcon } from '../components/IconComponents';

interface AlbumPageProps {
    albumBlocks: AlbumBlock[];
    setAlbumBlocks: React.Dispatch<React.SetStateAction<AlbumBlock[]>>;
}

const AlbumSidebarButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}> = ({ icon, label, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center space-x-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-accent disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <div className="text-primary-accent">{icon}</div>
        <span className="text-slate-200 font-medium">{label}</span>
    </button>
);


const AlbumPage: React.FC<AlbumPageProps> = ({ albumBlocks, setAlbumBlocks }) => {
    const { settings } = useSettings();

    // Effect to update Header block if artist/album name changes in settings
    useEffect(() => {
        setAlbumBlocks(prev => prev.map(block => {
            if (block.type === AlbumBlockType.HEADER) {
                return { ...block, value: {
                     ...block.value, 
                     title: block.value.title === 'New Album' ? settings.albumName || 'New Album' : block.value.title,
                     artist: block.value.artist === 'Artist Name' ? settings.artistName || 'Artist Name' : block.value.artist,
                }};
            }
            return block;
        }));
    }, [settings.artistName, settings.albumName, setAlbumBlocks]);


    const addBlock = useCallback((type: AlbumBlockType) => {
        let defaultValue: any;
        switch (type) {
            case AlbumBlockType.HEADER: 
                defaultValue = { title: settings.albumName || 'New Album', artist: settings.artistName || 'Artist Name', coverArtUrl: '' }; 
                break;
            case AlbumBlockType.TRACKLIST: 
                defaultValue = []; 
                break;
            default: defaultValue = '';
        }
        const newBlock: AlbumBlock = { id: `${type}-${Date.now()}`, type, value: defaultValue };
        setAlbumBlocks(prev => [...prev, newBlock]);
    }, [setAlbumBlocks, settings]);

    const updateBlock = useCallback((id: string, newValue: any) => {
        setAlbumBlocks(prev => prev.map(block => (block.id === id ? { ...block, value: newValue } : block)));
    }, [setAlbumBlocks]);

    const removeBlock = useCallback((id: string) => {
        setAlbumBlocks(prev => prev.filter(block => block.id !== id));
    }, [setAlbumBlocks]);
    
    const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
        setAlbumBlocks((prevBlocks) => {
          const newBlocks = [...prevBlocks];
          const draggedBlock = newBlocks[dragIndex];
          newBlocks.splice(dragIndex, 1);
          newBlocks.splice(hoverIndex, 0, draggedBlock);
          return newBlocks;
        });
    }, [setAlbumBlocks]);
    
    const hasHeader = albumBlocks.some(b => b.type === AlbumBlockType.HEADER);
    const hasTracklist = albumBlocks.some(b => b.type === AlbumBlockType.TRACKLIST);

    const blockTypes = [
        { type: AlbumBlockType.HEADER, icon: <AlbumIcon />, label: 'Album Header', disabled: hasHeader },
        { type: AlbumBlockType.TRACKLIST, icon: <TracklistIcon />, label: 'Tracklist', disabled: hasTracklist },
    ];

    return (
        <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-4 p-4 min-h-0">
            <aside className="md:col-span-3 lg:col-span-2 bg-slate-800/50 rounded-lg p-4 h-full md:max-h-[calc(100vh-100px)] md:overflow-y-auto">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-300 px-2">Add Album Blocks</h2>
                    <div className="space-y-2">
                        {blockTypes.map(({ type, icon, label, disabled }) => (
                            <AlbumSidebarButton key={type} icon={icon} label={label} onClick={() => addBlock(type)} disabled={disabled} />
                        ))}
                    </div>
                </div>
            </aside>

            <main className="md:col-span-9 lg:col-span-5 bg-slate-800/50 rounded-lg p-4 h-full md:max-h-[calc(100vh-100px)] md:overflow-y-auto">
                <div className="space-y-4">
                    {albumBlocks.map((block, index) => (
                        <AlbumNodeCard
                            key={block.id}
                            index={index}
                            block={block}
                            onUpdate={updateBlock}
                            onRemove={removeBlock}
                            onMove={moveBlock}
                        />
                    ))}
                </div>
            </main>

            <aside className="md:col-span-12 lg:col-span-5 bg-slate-950/70 rounded-lg flex flex-col h-full md:max-h-[calc(100vh-100px)]">
                <AlbumPreview albumBlocks={albumBlocks} />
            </aside>
        </div>
    );
};

export default AlbumPage;
