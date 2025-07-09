
import React, { useCallback, useEffect } from 'react';
import { BioBlock, BioBlockType } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import BioPreview from '../components/BioPreview';
import BioNodeCard from '../components/BioNodeCard';
import { UserIcon, ImageIcon, TextIcon, LinkIcon } from '../components/IconComponents';

interface ArtistBioPageProps {
    bioBlocks: BioBlock[];
    setBioBlocks: React.Dispatch<React.SetStateAction<BioBlock[]>>;
    onExportMD: () => void;
}

const BioSidebarButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center space-x-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-accent"
    >
        <div className="text-primary-accent">{icon}</div>
        <span className="text-slate-200 font-medium">{label}</span>
    </button>
);

const ArtistBioPage: React.FC<ArtistBioPageProps> = ({ bioBlocks, setBioBlocks, onExportMD }) => {
    const { settings } = useSettings();

    // Effect to update Header block if artist name changes in settings
    useEffect(() => {
        setBioBlocks(prev => prev.map(block => {
            if (block.type === BioBlockType.HEADER && (!block.value.name || block.value.name === "Your Artist Name")) {
                return { ...block, value: { ...block.value, name: settings.artistName || 'Your Artist Name' } };
            }
            return block;
        }));
    }, [settings.artistName, setBioBlocks]);


    const addBlock = useCallback((type: BioBlockType) => {
        let defaultValue: any;
        switch (type) {
            case BioBlockType.HEADER: defaultValue = { name: 'New Section', tagline: '' }; break;
            case BioBlockType.IMAGE: defaultValue = null; break;
            case BioBlockType.TEXT: defaultValue = 'New text block...'; break;
            case BioBlockType.LINKS: defaultValue = []; break;
            default: defaultValue = '';
        }
        const newBlock: BioBlock = { id: `${type}-${Date.now()}`, type, value: defaultValue };
        setBioBlocks(prev => [...prev, newBlock]);
    }, [setBioBlocks]);

    const updateBlock = useCallback((id: string, newValue: any) => {
        setBioBlocks(prev => prev.map(block => (block.id === id ? { ...block, value: newValue } : block)));
    }, [setBioBlocks]);

    const removeBlock = useCallback((id: string) => {
        setBioBlocks(prev => prev.filter(block => block.id !== id));
    }, [setBioBlocks]);
    
    const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
        setBioBlocks((prevBlocks) => {
          const newBlocks = [...prevBlocks];
          const draggedBlock = newBlocks[dragIndex];
          newBlocks.splice(dragIndex, 1);
          newBlocks.splice(hoverIndex, 0, draggedBlock);
          return newBlocks;
        });
    }, [setBioBlocks]);

    const blockTypes = [
        { type: BioBlockType.HEADER, icon: <UserIcon />, label: 'Header' },
        { type: BioBlockType.IMAGE, icon: <ImageIcon />, label: 'Image' },
        { type: BioBlockType.TEXT, icon: <TextIcon />, label: 'Text Block' },
        { type: BioBlockType.LINKS, icon: <LinkIcon />, label: 'Links' },
    ];

    return (
        <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-4 p-4 min-h-0">
            <aside className="md:col-span-3 lg:col-span-2 bg-slate-800/50 rounded-lg p-4 h-full md:max-h-[calc(100vh-100px)] md:overflow-y-auto">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-300 px-2">Add Bio Blocks</h2>
                    <div className="space-y-2">
                        {blockTypes.map(({ type, icon, label }) => (
                            <BioSidebarButton key={type} icon={icon} label={label} onClick={() => addBlock(type)} />
                        ))}
                    </div>
                </div>
            </aside>

            <main className="md:col-span-9 lg:col-span-5 bg-slate-800/50 rounded-lg p-4 h-full md:max-h-[calc(100vh-100px)] md:overflow-y-auto">
                <div className="space-y-4">
                    {bioBlocks.map((block, index) => (
                        <BioNodeCard
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
                <BioPreview bioBlocks={bioBlocks} onExportMD={onExportMD} />
            </aside>
        </div>
    );
};

export default ArtistBioPage;
