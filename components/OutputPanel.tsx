
import React, { useState, useEffect, useRef } from 'react';
import { CopyIcon, CheckIcon, ClearIcon, SaveIcon, FolderOpenIcon, FilePlusIcon, PdfIcon, MarkdownIcon } from './IconComponents';

interface OutputPanelProps {
  prompt: string;
  onClear: () => void;
  onSave: () => void;
  onOpen: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNew: () => void;
  onExportMD: () => void;
  onExportPDF: () => void;
}

const ActionButton: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
  isIcon?: boolean;
}> = ({ onClick, disabled, title, children, className = 'bg-slate-700/80 hover:bg-slate-700', isIcon = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`flex items-center space-x-2 text-white text-sm font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isIcon ? 'p-2' : 'px-3 py-1.5'} ${className}`}
  >
    {children}
  </button>
);


const OutputPanel: React.FC<OutputPanelProps> = ({ prompt, onClear, onSave, onOpen, onNew, onExportMD, onExportPDF }) => {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
    }
  };
  
  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-slate-300">Generated Prompt</h2>
        <ActionButton onClick={handleCopy} disabled={!prompt} title="Copy to clipboard" className="bg-primary hover:bg-primary-accent">
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
        </ActionButton>
      </div>

      <div className="flex-grow bg-slate-950/70 rounded-lg p-4 border border-slate-700/50 overflow-auto">
        <pre className="text-slate-300 whitespace-pre-wrap text-sm font-mono break-words">
            {prompt || <span className="text-slate-500">Your prompt will appear here...</span>}
        </pre>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-3 pt-3 border-t border-slate-700/50">
        <div>
            <h3 className="text-base font-semibold text-slate-300 mb-2">Project</h3>
            <div className="flex items-center space-x-2">
                <ActionButton onClick={onNew} title="New Project" isIcon={true}><FilePlusIcon/></ActionButton>
                <ActionButton onClick={onSave} disabled={!prompt} title="Save Project" isIcon={true}><SaveIcon/></ActionButton>
                <ActionButton onClick={handleOpenClick} title="Open Project" isIcon={true}><FolderOpenIcon/></ActionButton>
                <input type="file" ref={fileInputRef} onChange={onOpen} accept=".songweaver" className="hidden" />
                <ActionButton onClick={onClear} disabled={!prompt} title="Clear All Blocks" isIcon={true} className="bg-red-600/80 hover:bg-red-600"><ClearIcon /></ActionButton>
            </div>
        </div>
        <div>
            <h3 className="text-base font-semibold text-slate-300 mb-2">Export Prompt</h3>
            <div className="flex items-center space-x-2">
                <ActionButton onClick={onExportMD} disabled={!prompt} title="Export as Markdown (.md)">
                    <MarkdownIcon/>
                    <span>.md</span>
                </ActionButton>
                <ActionButton onClick={onExportPDF} disabled={!prompt} title="Export as PDF (.pdf)">
                    <PdfIcon/>
                    <span>.pdf</span>
                </ActionButton>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;
