
import React, { useCallback } from 'react';
import { PromptBlock, BlockType } from '../types';
import Sidebar from '../components/Sidebar';
import PromptEditor from '../components/PromptEditor';
import OutputPanel from '../components/OutputPanel';

interface SongWeaverPageProps {
    promptBlocks: PromptBlock[];
    setPromptBlocks: React.Dispatch<React.SetStateAction<PromptBlock[]>>;
    generatedPrompt: string;
    generatingLyricsId: string | null;
    isApiKeySet: boolean;
    onGenerateLyrics: (blockId: string) => void;
    onNewProject: () => void;
    onSaveProject: () => void;
    onOpenProject: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onExportMD: () => void;
    onExportPDF: () => void;
}

const SongWeaverPage: React.FC<SongWeaverPageProps> = ({
    promptBlocks,
    setPromptBlocks,
    generatedPrompt,
    generatingLyricsId,
    isApiKeySet,
    onGenerateLyrics,
    onNewProject,
    onSaveProject,
    onOpenProject,
    onExportMD,
    onExportPDF,
}) => {
    const addBlock = useCallback((type: BlockType) => {
        let defaultValue: any;
        switch (type) {
            case BlockType.STRUCTURE: defaultValue = { tag: '[Verse]', duration: { value: 30, unit: 'seconds', enabled: false } }; break;
            case BlockType.LYRICS: defaultValue = ''; break;
            case BlockType.GENRE: case BlockType.MOOD: case BlockType.DYNAMICS: case BlockType.PRODUCTION: case BlockType.INSTRUMENTATION: defaultValue = []; break;
            case BlockType.VOCALS: defaultValue = { tones: [], effects: [] }; break;
            case BlockType.TEMPO: defaultValue = 120; break;
            case BlockType.SOUND_EFFECT: defaultValue = 'wind blowing'; break;
            case BlockType.CUSTOM: defaultValue = '[custom-tag: value]'; break;
            default: defaultValue = '';
        }
        const newBlock: PromptBlock = { id: `${type}-${Date.now()}`, type, value: defaultValue };
        setPromptBlocks(prev => [...prev, newBlock]);
    }, [setPromptBlocks]);

    const updateBlock = useCallback((id: string, newValue: any) => {
        setPromptBlocks(prev => prev.map(block => (block.id === id ? { ...block, value: newValue } : block)));
    }, [setPromptBlocks]);

    const removeBlock = useCallback((id: string) => {
        setPromptBlocks(prev => prev.filter(block => block.id !== id));
    }, [setPromptBlocks]);

    const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
        setPromptBlocks((prevBlocks) => {
            const newBlocks = [...prevBlocks];
            const draggedBlock = newBlocks[dragIndex];
            newBlocks.splice(dragIndex, 1);
            newBlocks.splice(hoverIndex, 0, draggedBlock);
            return newBlocks;
        });
    }, [setPromptBlocks]);

    const handleClearAll = useCallback(() => {
        if (promptBlocks.length > 0 && window.confirm("Are you sure you want to clear all blocks? This cannot be undone.")) {
            setPromptBlocks([]);
        }
    }, [promptBlocks.length, setPromptBlocks]);

    return (
        <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-4 p-4 min-h-0">
            <aside className="md:col-span-3 lg:col-span-2 bg-slate-800/50 rounded-lg p-4 h-full md:max-h-[calc(100vh-100px)] md:overflow-y-auto">
                <Sidebar onAddBlock={addBlock} />
            </aside>
            <main className="md:col-span-9 lg:col-span-6 bg-slate-800/50 rounded-lg p-4 h-full md:max-h-[calc(100vh-100px)] md:overflow-y-auto">
                <PromptEditor
                    blocks={promptBlocks}
                    onUpdateBlock={updateBlock}
                    onRemoveBlock={removeBlock}
                    onMoveBlock={moveBlock}
                    onGenerateLyrics={onGenerateLyrics}
                    generatingLyricsId={generatingLyricsId}
                    isApiKeySet={isApiKeySet}
                />
            </main>
            <aside className="md:col-span-12 lg:col-span-4 bg-slate-800/50 rounded-lg p-4 flex flex-col h-full md:max-h-[calc(100vh-100px)]">
                <OutputPanel
                    prompt={generatedPrompt}
                    onClear={handleClearAll}
                    onSave={onSaveProject}
                    onOpen={onOpenProject}
                    onNew={onNewProject}
                    onExportMD={onExportMD}
                    onExportPDF={onExportPDF}
                />
            </aside>
        </div>
    );
};

export default SongWeaverPage;
