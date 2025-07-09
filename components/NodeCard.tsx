import React, { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { ItemTypes } from '../ItemTypes';
import { PromptBlock, BlockType } from '../types';
import * as Constants from '../constants';
import { 
  StructureIcon, LyricsIcon, GenreIcon, MoodIcon, DynamicsIcon, ProductionIcon, 
  InstrumentIcon, VocalsIcon, TempoIcon, SoundEffectIcon, CustomBlockIcon, 
  TrashIcon, GripVerticalIcon, AIGenerateIcon
} from './IconComponents';

interface NodeCardProps {
  block: PromptBlock;
  index: number;
  onUpdate: (id: string, value: any) => void;
  onRemove: (id: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onGenerateLyrics: (id: string) => void;
  generatingLyricsId: string | null;
  isApiKeySet: boolean;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ICONS: Record<string, React.ReactNode> = {
  [BlockType.STRUCTURE]: <StructureIcon />,
  [BlockType.LYRICS]: <LyricsIcon />,
  [BlockType.GENRE]: <GenreIcon />,
  [BlockType.MOOD]: <MoodIcon />,
  [BlockType.DYNAMICS]: <DynamicsIcon />,
  [BlockType.PRODUCTION]: <ProductionIcon />,
  [BlockType.INSTRUMENTATION]: <InstrumentIcon />,
  [BlockType.VOCALS]: <VocalsIcon />,
  [BlockType.TEMPO]: <TempoIcon />,
  [BlockType.SOUND_EFFECT]: <SoundEffectIcon />,
  [BlockType.CUSTOM]: <CustomBlockIcon />,
};

const TagSelector: React.FC<{ options: string[], selected: string[], onChange: (selected: string[]) => void }> = ({ options, selected, onChange }) => {
  const handleToggle = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          onClick={() => handleToggle(option)}
          className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
            selected.includes(option)
              ? 'bg-cyan-500 text-white font-semibold'
              : 'bg-slate-600/50 hover:bg-slate-600 text-slate-300'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

const NodeCard: React.FC<NodeCardProps> = ({ 
  block, index, onUpdate, onRemove, onMove, 
  onGenerateLyrics, generatingLyricsId, isApiKeySet 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: any }>({
    accept: ItemTypes.NODE_CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) {
        return;
      }

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // This is crucial for performance reasons to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.NODE_CARD,
    item: () => ({ id: block.id, index }),
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const isGenerating = generatingLyricsId === block.id;
  const canGenerate = isApiKeySet;

  const renderContent = () => {
    switch (block.type) {
      case BlockType.STRUCTURE: {
        const { tag, duration } = block.value;
        return (
          <div className="space-y-4">
            <select
              value={tag}
              onChange={(e) => onUpdate(block.id, { ...block.value, tag: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              {Constants.STRUCTURE_TAGS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
        
            <div className="border-t border-slate-700 pt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`${block.id}-duration-toggle`}
                  checked={duration.enabled}
                  onChange={(e) => onUpdate(block.id, { ...block.value, duration: { ...duration, enabled: e.target.checked } })}
                  className="h-4 w-4 rounded border-slate-500 text-cyan-600 focus:ring-cyan-500 bg-slate-600"
                />
                <label htmlFor={`${block.id}-duration-toggle`} className="ml-3 block text-sm font-medium text-slate-300">
                  Add duration
                </label>
              </div>
        
              {duration.enabled && (
                <div className="mt-3 flex items-center space-x-2">
                  <input
                    type="number"
                    value={duration.value}
                    onChange={(e) => onUpdate(block.id, { ...block.value, duration: { ...duration, value: parseInt(e.target.value, 10) || 0 } })}
                    min="1"
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="e.g., 30"
                  />
                  <select
                    value={duration.unit}
                    onChange={(e) => onUpdate(block.id, { ...block.value, duration: { ...duration, unit: e.target.value } })}
                    className="bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="seconds">seconds</option>
                    <option value="minutes">minutes</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        );
      }
      case BlockType.LYRICS:
        return (
          <div className="space-y-3">
            <textarea
              value={block.value}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              rows={5}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Your lyrics here... or generate them with AI!"
            />
            <div className="flex items-center justify-end">
                <button
                  onClick={() => onGenerateLyrics(block.id)}
                  disabled={!canGenerate || isGenerating}
                  title={!canGenerate ? "Set API_KEY environment variable to enable AI generation" : "Generate lyrics based on context"}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AIGenerateIcon />
                  <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
                </button>
            </div>
          </div>
        );
      case BlockType.GENRE:
        return <TagSelector options={Constants.GENRES} selected={block.value} onChange={(v) => onUpdate(block.id, v)} />;
      case BlockType.MOOD:
        return <TagSelector options={Constants.MOODS_AND_ATMOSPHERES} selected={block.value} onChange={(v) => onUpdate(block.id, v)} />;
      case BlockType.DYNAMICS:
        return <TagSelector options={Constants.DYNAMICS_AND_RHYTHM} selected={block.value} onChange={(v) => onUpdate(block.id, v)} />;
      case BlockType.PRODUCTION:
        return <TagSelector options={Constants.PRODUCTION_STYLES} selected={block.value} onChange={(v) => onUpdate(block.id, v)} />;
      case BlockType.INSTRUMENTATION:
        return <TagSelector options={Constants.INSTRUMENTS} selected={block.value} onChange={(v) => onUpdate(block.id, v)} />;
      case BlockType.VOCALS:
         return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-slate-400 mb-2">Vocal Tone</h4>
              <TagSelector 
                options={Constants.VOCAL_TONES} 
                selected={block.value.tones || []} 
                onChange={(newTones) => onUpdate(block.id, { ...block.value, tones: newTones })} 
              />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-400 mb-2">Vocal Effects</h4>
              <TagSelector 
                options={Constants.VOCAL_EFFECTS} 
                selected={block.value.effects || []} 
                onChange={(newEffects) => onUpdate(block.id, { ...block.value, effects: newEffects })} 
              />
            </div>
          </div>
        );
      case BlockType.TEMPO:
        return (
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="40"
              max="220"
              value={block.value}
              onChange={(e) => onUpdate(block.id, parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-mono text-lg text-cyan-400 w-20 text-center">{block.value} BPM</span>
          </div>
        );
      case BlockType.SOUND_EFFECT:
        return (
           <input
            type="text"
            value={block.value}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="e.g., footsteps on gravel"
          />
        );
      case BlockType.CUSTOM:
        return (
           <input
            type="text"
            value={block.value}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
            placeholder="e.g., [your-tag: your-value]"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="bg-slate-800 rounded-lg border border-slate-700/80 shadow-lg transition-shadow duration-200 hover:shadow-cyan-500/10"
    >
      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-t-lg border-b border-slate-700 cursor-grab" title="Drag to reorder">
        <div className="flex items-center space-x-3">
          <div className="text-slate-500">
            <GripVerticalIcon />
          </div>
          <div className="text-cyan-400">{ICONS[block.type]}</div>
          <h3 className="font-bold text-slate-200">{block.type}</h3>
        </div>
        <button onClick={() => onRemove(block.id)} className="text-slate-500 hover:text-red-500 transition-colors duration-200">
          <TrashIcon />
        </button>
      </div>
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default NodeCard;