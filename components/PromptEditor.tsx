
import React from 'react';
import { PromptBlock } from '../types';
import NodeCard from './NodeCard';

interface PromptEditorProps {
  blocks: PromptBlock[];
  onUpdateBlock: (id: string, value: any) => void;
  onRemoveBlock: (id: string) => void;
  onMoveBlock: (dragIndex: number, hoverIndex: number) => void;
  onGenerateLyrics: (id: string) => void;
  generatingLyricsId: string | null;
  isApiKeySet: boolean;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ 
  blocks, 
  onUpdateBlock, 
  onRemoveBlock, 
  onMoveBlock,
  onGenerateLyrics,
  generatingLyricsId,
  isApiKeySet
}) => {
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-700 rounded-lg">
        <h3 className="text-xl font-semibold text-slate-500">Your prompt canvas is empty.</h3>
        <p className="text-slate-600 mt-2">Add blocks from the left sidebar to start building your prompt!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <NodeCard
          key={block.id}
          index={index}
          block={block}
          onUpdate={onUpdateBlock}
          onRemove={onRemoveBlock}
          onMove={onMoveBlock}
          onGenerateLyrics={onGenerateLyrics}
          generatingLyricsId={generatingLyricsId}
          isApiKeySet={isApiKeySet}
        />
      ))}
    </div>
  );
};

export default PromptEditor;