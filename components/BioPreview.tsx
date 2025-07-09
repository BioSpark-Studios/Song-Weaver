
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BioBlock, BioBlockType, Link } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { PdfIcon, GenericLinkIcon, MarkdownIcon } from './IconComponents';

interface BioPreviewProps {
    bioBlocks: BioBlock[];
    onExportMD: () => void;
}

const BioPreview: React.FC<BioPreviewProps> = ({ bioBlocks, onExportMD }) => {
    const { settings } = useSettings();
    const previewRef = useRef<HTMLDivElement>(null);

    const handleExportPDF = async () => {
        const input = previewRef.current;
        if (!input) return;

        try {
            const canvas = await html2canvas(input, {
                scale: 2, // Higher scale for better quality
                backgroundColor: '#0f172a', // slate-900
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${settings.artistName || 'artist'}-bio.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-300">Live Preview</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onExportMD}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-md transition-all duration-200"
                        title="Export as Markdown"
                    >
                        <MarkdownIcon />
                        <span>.md</span>
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-primary hover:bg-primary-accent text-white text-sm font-semibold rounded-md transition-all duration-200"
                        title="Export as PDF"
                    >
                        <PdfIcon />
                        <span>.pdf</span>
                    </button>
                </div>
            </div>

            <div className="flex-grow p-2 md:p-4 overflow-y-auto">
                <div ref={previewRef} className="bg-slate-900 p-6 md:p-8">
                    <div className="max-w-2xl mx-auto space-y-8">
                        {bioBlocks.map(block => {
                            switch (block.type) {
                                case BioBlockType.HEADER:
                                    return (
                                        <div key={block.id} className="text-center">
                                            <h1 className="text-4xl md:text-5xl font-bold text-slate-100">{block.value.name}</h1>
                                            {block.value.tagline && <p className="mt-2 text-lg text-primary-accent">{block.value.tagline}</p>}
                                        </div>
                                    );
                                case BioBlockType.IMAGE:
                                    return block.value ? (
                                        <img key={block.id} src={block.value} alt="Artist" className="w-full rounded-lg shadow-lg" />
                                    ) : null;
                                case BioBlockType.TEXT:
                                    return <p key={block.id} className="text-slate-300 whitespace-pre-wrap text-lg leading-relaxed">{block.value}</p>;
                                case BioBlockType.LINKS:
                                    const links: Link[] = block.value || [];
                                    return links.length > 0 ? (
                                        <div key={block.id} className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                                            {links.map(link => (
                                                <a href={link.url} key={link.id} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                                                    <GenericLinkIcon />
                                                    <span className="font-semibold text-slate-200">{link.platform}</span>
                                                </a>
                                            ))}
                                        </div>
                                    ) : null;
                                default:
                                    return null;
                            }
                        })}
                        {settings.copyright && (
                             <footer className="text-center pt-8 mt-8 border-t border-slate-700/50">
                                <p className="text-sm text-slate-500">{settings.copyright}</p>
                            </footer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BioPreview;
