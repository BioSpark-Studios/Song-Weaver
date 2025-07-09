import React, { useRef, useState } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { ItemTypes } from '../ItemTypes';
import { BioBlock, BioBlockType, Link } from '../types';
import { UserIcon, ImageIcon, TextIcon, LinkIcon, TrashIcon, GripVerticalIcon, GenericLinkIcon } from './IconComponents';

interface BioNodeCardProps {
  block: BioBlock;
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
  [BioBlockType.HEADER]: <UserIcon />,
  [BioBlockType.IMAGE]: <ImageIcon />,
  [BioBlockType.TEXT]: <TextIcon />,
  [BioBlockType.LINKS]: <LinkIcon />,
};

const BioNodeCard: React.FC<BioNodeCardProps> = ({ block, index, onUpdate, onRemove, onMove }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: any }>({
    accept: ItemTypes.BIO_NODE_CARD,
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
    type: ItemTypes.BIO_NODE_CARD,
    item: () => ({ id: block.id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref)); // Combined ref

  const renderContent = () => {
    switch (block.type) {
      case BioBlockType.HEADER:
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={block.value.name}
              onChange={(e) => onUpdate(block.id, { ...block.value, name: e.target.value })}
              placeholder="Artist Name"
              className="w-full text-2xl font-bold bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
            />
            <input
              type="text"
              value={block.value.tagline}
              onChange={(e) => onUpdate(block.id, { ...block.value, tagline: e.target.value })}
              placeholder="Tagline or Genre"
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
            />
          </div>
        );
      
      case BioBlockType.IMAGE:
        const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    onUpdate(block.id, event.target?.result);
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
        return (
            <div>
                <input type="file" id={`image-upload-${block.id}`} className="hidden" onChange={handleImageUpload} accept="image/*" />
                <label htmlFor={`image-upload-${block.id}`} className="w-full flex items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 hover:border-primary-accent">
                    {block.value ? (
                        <img src={block.value} alt="Artist promo" className="max-h-48 rounded-md" />
                    ) : (
                        <div className="text-center">
                            <ImageIcon />
                            <p className="mt-2 text-sm text-slate-400">Click to upload an image</p>
                        </div>
                    )}
                </label>
                {block.value && <button onClick={() => onUpdate(block.id, null)} className="mt-2 text-sm text-red-500 hover:underline">Remove Image</button>}
            </div>
        );

      case BioBlockType.TEXT:
        return (
          <textarea
            value={block.value}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            rows={8}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
            placeholder="Your biography here..."
          />
        );
      
      case BioBlockType.LINKS:
          const links: Link[] = block.value || [];
          const handleLinkChange = (linkId: string, field: 'platform' | 'url', value: string) => {
            const newLinks = links.map(l => l.id === linkId ? {...l, [field]: value} : l);
            onUpdate(block.id, newLinks);
          };
          const addLink = () => {
              const newLinks = [...links, {id: `link-${Date.now()}`, platform: 'Website', url: 'https://'}];
              onUpdate(block.id, newLinks);
          };
          const removeLink = (linkId: string) => {
              const newLinks = links.filter(l => l.id !== linkId);
              onUpdate(block.id, newLinks);
          };
          return (
              <div className="space-y-3">
                  {links.map(link => (
                      <div key={link.id} className="flex items-center space-x-2">
                          <input type="text" value={link.platform} onChange={e => handleLinkChange(link.id, 'platform', e.target.value)} placeholder="Platform" className="w-1/3 bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-primary-accent"/>
                          <input type="url" value={link.url} onChange={e => handleLinkChange(link.id, 'url', e.target.value)} placeholder="https://example.com" className="w-2/3 bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-primary-accent"/>
                          <button onClick={() => removeLink(link.id)} className="text-slate-500 hover:text-red-500"><TrashIcon /></button>
                      </div>
                  ))}
                  <button onClick={addLink} className="w-full mt-2 px-3 py-1.5 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:border-primary-accent">
                      + Add Link
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

export default BioNodeCard;