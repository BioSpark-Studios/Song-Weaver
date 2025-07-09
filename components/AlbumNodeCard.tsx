
import React, { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { ItemTypes } from '../ItemTypes';
import { AlbumBlock, AlbumBlockType, Track } from '../types';
import { AlbumIcon, TracklistIcon, TrashIcon, GripVerticalIcon, ImageIcon } from './IconComponents';

interface AlbumNodeCardProps {
  block: AlbumBlock;
  index: number;
  onUpdate: (id: string, value: any) => void;
  onRemove: (id: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ICONS: Record<string, React.ReactNode> = {
  [AlbumBlockType.HEADER]: <AlbumIcon />,
  [AlbumBlockType.TRACKLIST]: <TracklistIcon />,
};

const AlbumNodeCard: React.FC<AlbumNodeCardProps> = ({ block, index, onUpdate, onRemove, onMove }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: any }>({
    accept: ItemTypes.ALBUM_NODE_CARD,
    collect: (monitor) => ({ handlerId: monitor.getHandlerId() }),
    hover: (item: DragItem, monitor: DropTargetMonitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ALBUM_NODE_CARD,
    item: () => ({ id: block.id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const renderContent = () => {
    switch (block.type) {
      case AlbumBlockType.HEADER:
        const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    onUpdate(block.id, { ...block.value, coverArt: event.target?.result as string });
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={block.value.title}
              onChange={(e) => onUpdate(block.id, { ...block.value, title: e.target.value })}
              placeholder="Album Title"
              className="w-full text-xl font-bold bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
            />
            <input
              type="text"
              value={block.value.artist}
              onChange={(e) => onUpdate(block.id, { ...block.value, artist: e.target.value })}
              placeholder="Artist Name"
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
            />
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Album Cover</label>
                <input type="file" id={`cover-upload-${block.id}`} className="hidden" onChange={handleImageUpload} accept="image/*" />
                <label htmlFor={`cover-upload-${block.id}`} className="w-full flex items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 hover:border-primary-accent">
                    {block.value.coverArt ? (
                        <img src={block.value.coverArt} alt="Album cover" className="max-h-32 rounded-md" />
                    ) : (
                        <div className="text-center text-slate-400">
                            <ImageIcon />
                            <p className="mt-2 text-sm">Click to upload cover art</p>
                        </div>
                    )}
                </label>
                {block.value.coverArt && <button onClick={() => onUpdate(block.id, {...block.value, coverArt: null})} className="mt-2 text-sm text-red-500 hover:underline">Remove Cover</button>}
            </div>
          </div>
        );
      
      case AlbumBlockType.TRACKLIST:
          const tracks: Track[] = block.value || [];
          
          const handleTrackChange = (trackId: string, field: 'title' | 'url', value: string) => {
            const newTracks = tracks.map(t => {
              if (t.id === trackId) {
                const updatedTrack = { ...t, [field]: value };
                if (field === 'url') {
                  delete updatedTrack.fileName; // Clear file name if URL is manually edited
                }
                return updatedTrack;
              }
              return t;
            });
            onUpdate(block.id, newTracks);
          };

          const handleTrackUpload = (e: React.ChangeEvent<HTMLInputElement>, trackId: string) => {
            const file = e.target.files?.[0];
            if (file) {
                const currentTrack = tracks.find(t => t.id === trackId);
                if (currentTrack?.url.startsWith('blob:')) {
                    URL.revokeObjectURL(currentTrack.url);
                }
                const newUrl = URL.createObjectURL(file);
                const newTracks = tracks.map(t => t.id === trackId ? { ...t, url: newUrl, fileName: file.name } : t);
                onUpdate(block.id, newTracks);
            }
          };

          const addTrack = () => {
              const newTracks = [...tracks, {id: `track-${Date.now()}`, title: `Track ${tracks.length + 1}`, url: ''}];
              onUpdate(block.id, newTracks);
          };

          const removeTrack = (trackId: string) => {
              const trackToRemove = tracks.find(t => t.id === trackId);
              if (trackToRemove?.url.startsWith('blob:')) {
                URL.revokeObjectURL(trackToRemove.url);
              }
              const newTracks = tracks.filter(t => t.id !== trackId);
              onUpdate(block.id, newTracks);
          };

          return (
              <div className="space-y-3">
                  {tracks.map((track, trackIndex) => (
                      <div key={track.id} className="p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center space-x-2">
                              <span className="text-slate-400 font-mono w-6 text-center">{trackIndex + 1}.</span>
                              <input type="text" value={track.title} onChange={e => handleTrackChange(track.id, 'title', e.target.value)} placeholder="Track Title" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-primary-accent"/>
                              <button onClick={() => removeTrack(track.id)} className="text-slate-500 hover:text-red-500 flex-shrink-0"><TrashIcon /></button>
                          </div>
                          <div className="flex items-center space-x-2 mt-2 pl-8">
                                <input type="text" value={track.url} onChange={e => handleTrackChange(track.id, 'url', e.target.value)} placeholder="Paste URL or upload file" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-primary-accent"/>
                                <label htmlFor={`track-upload-${track.id}`} className="cursor-pointer px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-md text-sm whitespace-nowrap">Upload</label>
                                <input type="file" id={`track-upload-${track.id}`} className="hidden" onChange={(e) => handleTrackUpload(e, track.id)} accept="audio/*,video/*"/>
                          </div>
                          {track.fileName && <p className="text-xs text-slate-400 mt-1 pl-8 truncate">Loaded: {track.fileName}</p>}
                      </div>
                  ))}
                  <button onClick={addTrack} className="w-full mt-2 px-3 py-1.5 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:border-primary-accent">
                      + Add Track
                  </button>
              </div>
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
      className="bg-slate-800 rounded-lg border border-slate-700/80 shadow-lg"
    >
      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-t-lg border-b border-slate-700 cursor-grab" title="Drag to reorder">
        <div className="flex items-center space-x-3">
          <div className="text-slate-500"><GripVerticalIcon /></div>
          <div className="text-primary-accent">{ICONS[block.type]}</div>
          <h3 className="font-bold text-slate-200">{block.type}</h3>
        </div>
        <button onClick={() => onRemove(block.id)} className="text-slate-500 hover:text-red-500 transition-colors duration-200">
          <TrashIcon />
        </button>
      </div>
      <div className="p-4">{renderContent()}</div>
    </div>
  );
};

export default AlbumNodeCard;