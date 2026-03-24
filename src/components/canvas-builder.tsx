'use client';

import { useState } from 'react';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable, closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CanvasElement, CanvasElementType } from '@/types/form';
import RichTextField from './rich-text-field';

// ── Palette definitions ────────────────────────────────────────────────────────

const PALETTE: { type: CanvasElementType; label: string; icon: React.ReactNode; defaults: Partial<CanvasElement> }[] = [
  {
    type: 'heading',
    label: 'Título',
    icon: <span className="font-black text-base leading-none">H</span>,
    defaults: { content: 'Seu título aqui' },
  },
  {
    type: 'text',
    label: 'Texto',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    defaults: { content: 'Seu texto aqui...' },
  },
  {
    type: 'image',
    label: 'Imagem',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    defaults: { imageUrl: '' },
  },
  {
    type: 'buttons',
    label: 'Botões Sim/Não',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    defaults: { yesText: 'Sim', noText: 'Não' },
  },
  {
    type: 'spacer',
    label: 'Espaço',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    ),
    defaults: {},
  },
  {
    type: 'divider',
    label: 'Divisória',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    ),
    defaults: {},
  },
];

function makeElement(type: CanvasElementType): CanvasElement {
  const def = PALETTE.find(p => p.type === type)!;
  return { id: crypto.randomUUID(), type, ...def.defaults };
}

// ── Palette item (draggable) ───────────────────────────────────────────────────

function PaletteItem({ type, label, icon, onAdd }: { type: CanvasElementType; label: string; icon: React.ReactNode; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette:${type}` });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onAdd}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-violet-400 hover:bg-violet-50 cursor-grab active:cursor-grabbing transition-all select-none ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
        {icon}
      </div>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
    </div>
  );
}

// ── Canvas element (sortable + editable) ──────────────────────────────────────

function CanvasItem({ el, onChange, onRemove, onImageUpload }: {
  el: CanvasElement;
  onChange: (updated: CanvasElement) => void;
  onRemove: () => void;
  onImageUpload: (file: File) => Promise<string>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: el.id });
  const [uploading, setUploading] = useState(false);

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  async function handleImagePick(file: File) {
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      onChange({ ...el, imageUrl: url });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-violet-300 transition-all">
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 z-10 p-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0zM20 6a2 2 0 11-4 0 2 2 0 014 0zM20 12a2 2 0 11-4 0 2 2 0 014 0zM20 18a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-all z-10"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className="pl-8 pr-8 py-3">
        {el.type === 'heading' && (
          <RichTextField
            value={el.content || ''}
            onChange={v => onChange({ ...el, content: v })}
            placeholder="Título..."
            singleLine
            className="w-full text-lg font-bold text-gray-900 border-b border-dashed border-gray-200 pb-1 cursor-text"
          />
        )}
        {el.type === 'text' && (
          <RichTextField
            value={el.content || ''}
            onChange={v => onChange({ ...el, content: v })}
            placeholder="Texto..."
            className="w-full text-sm text-gray-700 border border-dashed border-gray-200 rounded-lg p-2 cursor-text min-h-[60px]"
          />
        )}
        {el.type === 'image' && (
          <div className="flex flex-col items-center gap-2">
            {el.imageUrl ? (
              <div className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={el.imageUrl} alt="Element" className="w-full rounded-lg max-h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => onChange({ ...el, imageUrl: '' })}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >×</button>
              </div>
            ) : (
              <label className="w-full flex flex-col items-center gap-1 py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-violet-400 transition-colors">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-400">Clique ou arraste uma imagem</span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImagePick(f); }} />
              </label>
            )}
          </div>
        )}
        {el.type === 'buttons' && (
          <div className="flex gap-2">
            <input
              type="text"
              value={el.yesText || ''}
              onChange={e => onChange({ ...el, yesText: e.target.value })}
              placeholder="Sim"
              className="flex-1 text-center py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              value={el.noText || ''}
              onChange={e => onChange({ ...el, noText: e.target.value })}
              placeholder="Não"
              className="flex-1 text-center py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-sm outline-none focus:border-gray-400"
            />
          </div>
        )}
        {el.type === 'spacer' && (
          <div className="h-6 flex items-center justify-center">
            <span className="text-xs text-gray-300 italic">— espaço —</span>
          </div>
        )}
        {el.type === 'divider' && (
          <hr className="border-gray-200 my-1" />
        )}
      </div>
    </div>
  );
}

// ── Drop zone ──────────────────────────────────────────────────────────────────

function DropZone({ isEmpty }: { isEmpty: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-20 rounded-xl border-2 border-dashed transition-all flex items-center justify-center ${
        isOver ? 'border-violet-400 bg-violet-50' : isEmpty ? 'border-gray-200 bg-gray-50' : 'border-transparent'
      }`}
    >
      {isEmpty && (
        <p className="text-sm text-gray-400 text-center px-4">
          Arraste elementos da paleta ou clique neles para adicionar
        </p>
      )}
    </div>
  );
}

// ── Main CanvasBuilder ─────────────────────────────────────────────────────────

interface CanvasBuilderProps {
  elements: CanvasElement[];
  onChange: (elements: CanvasElement[]) => void;
  onImageUpload: (file: File) => Promise<string>;
}

export default function CanvasBuilder({ elements, onChange, onImageUpload }: CanvasBuilderProps) {
  const [activeType, setActiveType] = useState<CanvasElementType | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function addElement(type: CanvasElementType) {
    onChange([...elements, makeElement(type)]);
  }

  function updateElement(id: string, updated: CanvasElement) {
    onChange(elements.map(el => el.id === id ? updated : el));
  }

  function removeElement(id: string) {
    onChange(elements.filter(el => el.id !== id));
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    if (id.startsWith('palette:')) {
      setActiveType(id.replace('palette:', '') as CanvasElementType);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveType(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Drag from palette → canvas
    if (activeId.startsWith('palette:')) {
      const type = activeId.replace('palette:', '') as CanvasElementType;
      onChange([...elements, makeElement(type)]);
      return;
    }

    // Reorder within canvas
    if (activeId !== overId) {
      const oldIdx = elements.findIndex(el => el.id === activeId);
      const newIdx = elements.findIndex(el => el.id === overId);
      if (oldIdx !== -1 && newIdx !== -1) {
        onChange(arrayMove(elements, oldIdx, newIdx));
      }
    }
  }

  const activePalette = activeType ? PALETTE.find(p => p.type === activeType) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        {/* Palette */}
        <div className="w-40 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Elementos</p>
          <div className="space-y-1.5">
            {PALETTE.map(({ type, label, icon }) => (
              <PaletteItem
                key={type}
                type={type}
                label={label}
                icon={icon}
                onAdd={() => addElement(type)}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Canvas</p>
          <SortableContext items={elements.map(el => el.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {elements.map(el => (
                <CanvasItem
                  key={el.id}
                  el={el}
                  onChange={updated => updateElement(el.id, updated)}
                  onRemove={() => removeElement(el.id)}
                  onImageUpload={onImageUpload}
                />
              ))}
              <DropZone isEmpty={elements.length === 0} />
            </div>
          </SortableContext>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activePalette && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-violet-400 bg-violet-50 shadow-lg w-40">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-violet-100 text-violet-600 flex-shrink-0">
              {activePalette.icon}
            </div>
            <span className="text-xs font-semibold text-violet-700">{activePalette.label}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
