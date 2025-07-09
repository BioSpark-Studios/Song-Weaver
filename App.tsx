
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Header from './components/Header';
import SongWeaverPage from './pages/SongWeaverPage';
import ArtistBioPage from './pages/ArtistBioPage';
import AlbumPage from './pages/AlbumPage';
import SettingsPage from './pages/SettingsPage';
import SplashScreen from './components/SplashScreen';
import { PromptBlock, BioBlock, AlbumBlock, BlockType, BioBlockType, AlbumBlockType, Link } from './types';
import jsPDF from 'jspdf';
import { GoogleGenAI } from '@google/genai';


export type Page = 'weaver' | 'bio' | 'album' | 'settings';

const AppContent: React.FC = () => {
    const { settings } = useSettings();
    const [activePage, setActivePage] = useState<Page>('weaver');
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2500); // Splash screen duration
        return () => clearTimeout(timer);
    }, []);
    
    // State lifted from child pages
    const [promptBlocks, setPromptBlocks] = useState<PromptBlock[]>([]);
    const [bioBlocks, setBioBlocks] = useState<BioBlock[]>(() => [
        { id: `header-${Date.now()}`, type: BioBlockType.HEADER, value: { name: settings.artistName || 'Your Artist Name', tagline: 'Your tagline or genre' } },
        { id: `image-${Date.now()}`, type: BioBlockType.IMAGE, value: null },
        { id: `text-${Date.now()}`, type: BioBlockType.TEXT, value: 'Write your artist biography here. Talk about your history, your music, and what makes you unique.' },
        { id: `links-${Date.now()}`, type: BioBlockType.LINKS, value: [] },
    ]);
    const [albumBlocks, setAlbumBlocks] = useState<AlbumBlock[]>(() => [
        { id: `album-header-${Date.now()}`, type: AlbumBlockType.HEADER, value: { title: settings.albumName || 'New Album', artist: settings.artistName || 'Artist Name', coverArt: null } },
        { id: `album-tracklist-${Date.now()}`, type: AlbumBlockType.TRACKLIST, value: [] },
    ]);
    const [generatingLyricsId, setGeneratingLyricsId] = useState<string | null>(null);

    // AI Initialization
    const ai = useMemo(() => {
        // API key is now handled by the process.env.API_KEY environment variable for security.
        // Assume this is set during the build process.
        if (process.env.API_KEY) {
            try {
                return new GoogleGenAI({ apiKey: process.env.API_KEY });
            } catch (e) {
                console.error("Failed to initialize GoogleGenAI:", e);
                return null;
            }
        }
        return null;
    }, []); // Empty dependency array, as env vars are build-time constants.
    
    // --- Prompt Formatting Logic ---
    const formatBlockValue = (block: PromptBlock): string | null => {
        if (!block.value || (Array.isArray(block.value) && block.value.length === 0)) return null;
        switch (block.type) {
            case BlockType.STRUCTURE: {
                const { tag, duration } = block.value;
                if (duration?.enabled && duration.value > 0) {
                    const unitString = duration.value === 1 ? duration.unit.slice(0, -1) : duration.unit;
                    return `${tag} [${duration.value} ${unitString}]`;
                }
                return tag;
            }
            case BlockType.LYRICS: case BlockType.CUSTOM: return block.value;
            case BlockType.SOUND_EFFECT: return `*${block.value}*`;
            case BlockType.GENRE: return `[Genre: ${block.value.join(', ')}]`;
            case BlockType.MOOD: return `[Mood: ${block.value.join(', ')}]`;
            case BlockType.DYNAMICS: return `[Dynamics: ${block.value.join(', ')}]`;
            case BlockType.PRODUCTION: return `[Production: ${block.value.join(', ')}]`;
            case BlockType.INSTRUMENTATION: return `[Instrumentation: ${block.value.join(', ')}]`;
            case BlockType.VOCALS:
                const vocalParts = [...(block.value.tones || []), ...(block.value.effects || [])];
                if (vocalParts.length === 0) return null;
                return `[Vocals: ${vocalParts.join(', ')}]`;
            case BlockType.TEMPO: return `[${block.value} BPM]`;
            default: return null;
        }
    };
    const generatedPrompt = useMemo(() => {
        return promptBlocks.map(formatBlockValue).filter(part => part !== null).join('\n\n');
    }, [promptBlocks]);

    // --- Handlers for SongWeaverPage ---
    const handleGenerateLyrics = useCallback(async (blockId: string) => {
        if (!ai) return;
        setGeneratingLyricsId(blockId);
        try {
            const blockIndex = promptBlocks.findIndex(b => b.id === blockId);
            if (blockIndex === -1) return;
            const contextBlocks = promptBlocks.slice(0, blockIndex);
            const currentBlock = promptBlocks[blockIndex];
            const contextPrompt = contextBlocks.map(formatBlockValue).filter(Boolean).join(', ');
            const systemInstruction = `You are a creative songwriter. Your task is to write lyrics for a song part based on the provided musical context. Do not include any explanations, annotations, or the context tags in your response. Only return the raw text of the lyrics.`;
            let userPrompt = `Musical Context: ${contextPrompt || 'None'}.`;
            const lastStructureBlock = [...contextBlocks].reverse().find(b => b.type === BlockType.STRUCTURE);
            userPrompt += `\nWrite lyrics for the following song part: ${lastStructureBlock?.value.tag || 'the current section'}.`;
            if (currentBlock.value) {
                userPrompt += `\nHere are the existing lyrics, please refine or continue them: "${currentBlock.value}"`;
            }
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: userPrompt, config: { systemInstruction } });
            setPromptBlocks(prev => prev.map(block => block.id === blockId ? { ...block, value: response.text.trim() } : block));
        } catch (error) {
            console.error("Error generating lyrics:", error);
        } finally {
            setGeneratingLyricsId(null);
        }
    }, [ai, promptBlocks, formatBlockValue]);

    // --- Handlers for Project Management ---
    const handleNewProject = useCallback(() => {
        if (window.confirm("Are you sure you want to start a new project? Any unsaved changes will be lost.")) {
            setPromptBlocks([]);
        }
    }, []);

    const handleSaveProject = useCallback(() => {
        const projectData = { version: "1.1", blocks: promptBlocks, savedAt: new Date().toISOString() };
        const copyrightComment = `\n\n# Project saved with Song Weaver by ${settings.studioName}\n# ${settings.copyright}`;
        const fileContent = `## Song Weaver Project File (JSON)\n\`\`\`json\n${JSON.stringify(projectData, null, 2)}\n\`\`\`\n\n## Generated Prompt\n\`\`\`\n${generatedPrompt}\n\`\`\`\n${copyrightComment}`;
        const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `song-weaver-project-${Date.now()}.songweaver`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [promptBlocks, generatedPrompt, settings]);

    const handleOpenProject = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
                    if (!jsonMatch?.[1]) throw new Error("Could not find JSON data in file.");
                    const data = JSON.parse(jsonMatch[1]);
                    if (data && data.blocks) {
                        setPromptBlocks(data.blocks);
                    } else {
                        throw new Error("Invalid project file format.");
                    }
                } catch (error) {
                    console.error("Failed to open or parse project file:", error);
                    alert("Error: Could not open or parse the project file.");
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }
    }, []);

    // --- Export Handlers ---
    const handleExportPromptMD = useCallback(() => {
        const fileContent = `# Song Prompt\n\nGenerated by Song Weaver by ${settings.studioName}\n${settings.copyright}\n\n---\n\n\`\`\`\n${generatedPrompt}\n\`\`\``;
        const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `song-prompt.md`;
        a.click();
        URL.revokeObjectURL(url);
    }, [generatedPrompt, settings]);

    const handleExportPromptPDF = useCallback(() => {
        const doc = new jsPDF();
        doc.setFont('courier');
        doc.setFontSize(10);
        doc.text(generatedPrompt, 10, 10);
        doc.save('song-prompt.pdf');
    }, [generatedPrompt]);
    
    const handleExportBioMD = useCallback(() => {
        let md = `# ${settings.artistName}\n\n`;
        bioBlocks.forEach(block => {
            switch(block.type) {
                case BioBlockType.HEADER: md += `## ${block.value.name}\n*${block.value.tagline}*\n\n`; break;
                case BioBlockType.IMAGE: if (block.value) md += `![Artist Image](Image-Data-Attached)\n\n`; break;
                case BioBlockType.TEXT: md += `${block.value}\n\n`; break;
                case BioBlockType.LINKS:
                    md += `## Links\n\n`;
                    block.value.forEach((link: Link) => md += `* [${link.platform}](${link.url})\n`);
                    md += '\n';
                    break;
            }
        });
        md += `---\n*${settings.copyright}*`;
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `artist-bio.md`;
        a.click();
        URL.revokeObjectURL(url);
    }, [bioBlocks, settings]);

    const handleExportKit = useCallback(() => {
        // API key is no longer in settings, so no need to create a secure copy.
        const promoKitData = {
            settings: settings,
            songWeaverProject: {
                blocks: promptBlocks,
                generatedPrompt: generatedPrompt
            },
            artistBio: {
                blocks: bioBlocks
            },
            album: {
                blocks: albumBlocks
            }
        };
        const fileContent = `# Artist Promo Kit\n\nCreated with Song Weaver by ${settings.studioName}\n\n## Data (JSON)\n\nThis data can be imported into other applications.\n\n\`\`\`json\n${JSON.stringify(promoKitData, null, 2)}\n\`\`\`\n\n---\n${settings.copyright}\n`;
        const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promo-kit.md`;
        a.click();
        URL.revokeObjectURL(url);
    }, [settings, promptBlocks, generatedPrompt, bioBlocks, albumBlocks]);
    
    // --- Page Rendering ---
    const renderPage = () => {
        switch (activePage) {
            case 'weaver':
                return <SongWeaverPage
                    promptBlocks={promptBlocks}
                    setPromptBlocks={setPromptBlocks}
                    generatedPrompt={generatedPrompt}
                    generatingLyricsId={generatingLyricsId}
                    isApiKeySet={!!ai}
                    onGenerateLyrics={handleGenerateLyrics}
                    onNewProject={handleNewProject}
                    onSaveProject={handleSaveProject}
                    onOpenProject={handleOpenProject}
                    onExportMD={handleExportPromptMD}
                    onExportPDF={handleExportPromptPDF}
                />;
            case 'bio':
                return <ArtistBioPage 
                    bioBlocks={bioBlocks}
                    setBioBlocks={setBioBlocks}
                    onExportMD={handleExportBioMD}
                />;
            case 'album':
                return <AlbumPage 
                    albumBlocks={albumBlocks}
                    setAlbumBlocks={setAlbumBlocks}
                />;
            case 'settings':
                return <SettingsPage />;
            default:
                return null;
        }
    };

    return (
        <>
            <SplashScreen isVisible={showSplash} />
            <div className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
                <DndProvider backend={HTML5Backend}>
                    <div className="min-h-screen bg-slate-900 flex flex-col">
                        <Header activePage={activePage} setActivePage={setActivePage} onExportKit={handleExportKit} />
                        {renderPage()}
                    </div>
                </DndProvider>
            </div>
        </>
    );
};


const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;