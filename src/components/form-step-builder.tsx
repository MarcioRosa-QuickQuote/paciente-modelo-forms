'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormStep, FormStepType } from '@/types/form';

// ─── Step Type Definitions ────────────────────────────────────────────────────

const STEP_TYPES: { type: FormStepType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    type: 'foto',
    label: 'Fotos Antes/Depois',
    description: 'Mostra fotos e pergunta se o paciente quer o procedimento',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'disponibilidade',
    label: 'Disponibilidade',
    description: 'Pergunta se tem disponibilidade nos dias selecionados',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'preco',
    label: 'Preço',
    description: 'Mostra o valor normal vs valor de paciente modelo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    type: 'taxa',
    label: 'Taxa de Reserva',
    description: 'Apresenta o valor simbólico para reservar a vaga',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    type: 'pergunta',
    label: 'Pergunta Personalizada',
    description: 'Crie sua própria pergunta com botões Sim/Não',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function getStepInfo(type: FormStepType, label?: string) {
  if (type === 'livre') return { label: label || 'Tela Livre', icon: null };
  const found = STEP_TYPES.find(s => s.type === type) || STEP_TYPES[0];
  return label ? { ...found, label } : found;
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface FormStepBuilderProps {
  steps: FormStep[];
  onChange: (steps: FormStep[]) => void;
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
  formName?: string;
  hasCelebration?: boolean;
  onConfigOpen?: () => void;
  onPickerChange?: (open: boolean) => void;
  onInsertButtonClick?: () => void;
  insertButtonActive?: boolean;
  showInsertButton?: boolean;
}

interface StepDotsBarProps {
  steps: FormStep[];
  onChange: (steps: FormStep[]) => void;
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
  hasCelebration?: boolean;
  className?: string;
}

// ─── Sortable Dot ─────────────────────────────────────────────────────────────

interface SortableDotProps {
  id: string;
  isActive: boolean;
  onClick: () => void;
}

function SortableDot({ id, isActive, onClick }: SortableDotProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onClick}
      className={
        isActive
          ? 'w-5 h-2 rounded-full bg-[#6B1C3A] cursor-pointer transition-all'
          : 'w-2 h-2 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer transition-all'
      }
      {...attributes}
      {...listeners}
      aria-label={`Ir para etapa ${id}`}
    />
  );
}

// ─── Add Step Picker ──────────────────────────────────────────────────────────

interface AddStepPickerProps {
  onAdd: (type: FormStepType) => void;
  onClose: () => void;
}

function AddStepPicker({ onAdd, onClose }: AddStepPickerProps) {
  return (
    <div className="border border-dashed border-[#6B1C3A]/40 rounded-xl p-4 bg-[#6B1C3A]/5 mt-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Escolha o tipo de etapa</p>

      {/* Blank canvas option */}
      <button
        type="button"
        onClick={() => { onAdd('livre'); onClose(); }}
        className="w-full flex items-center gap-3 p-3 mb-2 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 hover:border-violet-400 hover:shadow-sm transition-all text-left group cursor-pointer"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-violet-700">Inserir Etapa Nova</p>
          <p className="text-xs text-violet-500">Tela em branco — arraste e solte elementos</p>
        </div>
      </button>

      <div className="border-t border-[#6B1C3A]/10 my-3" />
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Etapas prontas</p>

      <div className="space-y-2">
        {STEP_TYPES.map(({ type, label, description, icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => { onAdd(type); onClose(); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left group cursor-pointer"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white group-hover:bg-[#6B1C3A]/10 flex items-center justify-center text-gray-500 group-hover:text-[#6B1C3A] transition-colors shadow-sm">
              {icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Cancelar
      </button>
    </div>
  );
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

export function StepDotsBar({
  steps,
  onChange,
  currentIndex,
  onCurrentIndexChange,
  hasCelebration = false,
  className = '',
}: StepDotsBarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isCelebration = hasCelebration && currentIndex === steps.length;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex(s => s.id === active.id);
    const newIndex = steps.findIndex(s => s.id === over.id);
    const reordered = arrayMove(steps, oldIndex, newIndex);
    onChange(reordered);
    const movedStepId = steps[currentIndex]?.id;
    if (movedStepId) {
      const newCurrentIndex = reordered.findIndex(s => s.id === movedStepId);
      if (newCurrentIndex !== -1) onCurrentIndexChange(newCurrentIndex);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={steps.map(s => s.id)} strategy={horizontalListSortingStrategy}>
        <div className={`flex items-center justify-center gap-1.5 ${className}`}>
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {step.hidden && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full z-10" title="Oculta" />
              )}
              <SortableDot
                id={step.id}
                isActive={index === currentIndex}
                onClick={() => onCurrentIndexChange(index)}
              />
            </div>
          ))}
          {hasCelebration && (
            <button
              type="button"
              onClick={() => onCurrentIndexChange(steps.length)}
              className={isCelebration
                ? 'w-5 h-2 rounded-full bg-[#6B1C3A] cursor-pointer transition-all'
                : 'w-2 h-2 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer transition-all'}
              aria-label="Tela de celebração"
            />
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default function FormStepBuilder({
  steps,
  onChange,
  currentIndex,
  onCurrentIndexChange,
  formName,
  hasCelebration = false,
  onConfigOpen,
  onPickerChange,
  onInsertButtonClick,
  insertButtonActive = false,
  showInsertButton = false,
}: FormStepBuilderProps) {
  const [showPicker, setShowPicker] = useState(false);

  function togglePicker(open: boolean) {
    setShowPicker(open);
    onPickerChange?.(open);
  }

  const isCelebration = hasCelebration && currentIndex === steps.length;
  const totalSteps = hasCelebration ? steps.length + 1 : steps.length;
  const currentStep = !isCelebration ? (steps[currentIndex] ?? steps[0]) : null;

  function addStep(type: FormStepType) {
    const newStep: FormStep = {
      id: crypto.randomUUID(),
      type,
      yesText: '',
      noText: '',
      ...(type === 'pergunta' ? { question: '' } : {}),
    };
    const newSteps = [...steps, newStep];
    onChange(newSteps);
    onCurrentIndexChange(newSteps.length - 1);
  }

  function removeStep(index: number) {
    const newSteps = steps.filter((_, i) => i !== index);
    onChange(newSteps);
    const newIndex = Math.min(index, newSteps.length - 1);
    onCurrentIndexChange(newIndex);
  }

  function toggleHidden(index: number) {
    const newSteps = steps.map((s, i) =>
      i === index ? { ...s, hidden: !s.hidden } : s
    );
    onChange(newSteps);
  }

  if (!isCelebration && !currentStep) return null;

  const info = !isCelebration ? getStepInfo(currentStep!.type, currentStep!.label) : { label: 'Celebração', icon: null };

  return (
    <>

      {/* ── Navigation bar ── */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Step name + counter */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold text-gray-900 truncate">{info.label}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {currentIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Visibility toggle + Trash */}
        {!isCelebration && (
          <button
            type="button"
            onClick={() => toggleHidden(currentIndex)}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              currentStep?.hidden
                ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
            }`}
            aria-label={currentStep?.hidden ? 'Mostrar tela no formulário' : 'Ocultar tela no formulário'}
            title={currentStep?.hidden ? 'Tela oculta — clique para mostrar' : 'Ocultar tela no formulário'}
          >
            {currentStep?.hidden ? (
              /* eye-off */
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              /* eye */
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        {showInsertButton && onInsertButtonClick && (
          <button
            type="button"
            onClick={onInsertButtonClick}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex-shrink-0 ${
              insertButtonActive
                ? 'bg-[#6B1C3A] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Inserir blocos nesta tela"
          >
            Inserir Botão
          </button>
        )}
        {steps.length > 1 && !isCelebration && (
          <button
            type="button"
            onClick={() => removeStep(currentIndex)}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            aria-label="Remover etapa"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {/* Add step button */}
        <button
          type="button"
          onClick={() => togglePicker(!showPicker)}
          className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-lg flex-shrink-0 hover:opacity-90 transition-opacity"
        >
          + Criar Tela
        </button>

        {/* Config gear icon */}
        {onConfigOpen && (
          <button
            type="button"
            onClick={onConfigOpen}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6B1C3A] transition-colors flex-shrink-0"
            aria-label="Configurações gerais"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Add Step Picker ── */}
      {showPicker && (
        <div className="px-4 pb-4">
          <AddStepPicker
            onAdd={(type) => {
              addStep(type);
              togglePicker(false);
            }}
            onClose={() => togglePicker(false)}
          />
        </div>
      )}
    </>
  );
}

// ─── Step Cards List ──────────────────────────────────────────────────────────

interface StepCardsListProps {
  steps: FormStep[];
  onChange: (steps: FormStep[]) => void;
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
  hasCelebration?: boolean;
}

interface SortableStepCardProps {
  step: FormStep;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onRename: (label: string) => void;
}

function SortableStepCard({ step, index, isActive, onClick, onRename }: SortableStepCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(step.label || '');
  const info = getStepInfo(step.type, step.label);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-1 px-2.5 py-2 rounded-xl border transition-all cursor-pointer select-none flex-shrink-0 w-[110px] ${
        isActive
          ? 'border-[#6B1C3A]/40 bg-[#6B1C3A]/5'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
      } ${step.hidden ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      {/* Top row: drag handle + number + hidden dot */}
      <div className="flex items-center gap-1">
        <span
          className="text-gray-300 hover:text-gray-400 cursor-grab flex-shrink-0"
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="7" cy="5" r="1.5" /><circle cx="13" cy="5" r="1.5" />
            <circle cx="7" cy="10" r="1.5" /><circle cx="13" cy="10" r="1.5" />
            <circle cx="7" cy="15" r="1.5" /><circle cx="13" cy="15" r="1.5" />
          </svg>
        </span>
        <span className="text-[10px] font-bold text-gray-400 flex-1">{index + 1}</span>
        {step.hidden && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Oculta" />}
      </div>

      {/* Name row — double-click to rename */}
      {editing ? (
        <input
          autoFocus
          className="text-xs font-semibold bg-transparent outline-none border-b border-[#6B1C3A] w-full"
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={() => { onRename(value); setEditing(false); }}
          onKeyDown={e => {
            if (e.key === 'Enter') { onRename(value); setEditing(false); }
            if (e.key === 'Escape') setEditing(false);
          }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span
          className={`text-xs font-semibold truncate w-full ${isActive ? 'text-[#6B1C3A]' : 'text-gray-700'}`}
          onDoubleClick={e => { e.stopPropagation(); setValue(step.label || info.label); setEditing(true); }}
          title="Clique duplo para renomear"
        >
          {info.label}
        </span>
      )}
    </div>
  );
}

export function StepCardsList({
  steps,
  onChange,
  currentIndex,
  onCurrentIndexChange,
  hasCelebration = false,
}: StepCardsListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const isCelebration = hasCelebration && currentIndex === steps.length;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex(s => s.id === active.id);
    const newIndex = steps.findIndex(s => s.id === over.id);
    const reordered = arrayMove(steps, oldIndex, newIndex);
    onChange(reordered);
    const movedId = steps[currentIndex]?.id;
    if (movedId) {
      const next = reordered.findIndex(s => s.id === movedId);
      if (next !== -1) onCurrentIndexChange(next);
    }
  }

  function handleRename(stepId: string, label: string) {
    onChange(steps.map(s => s.id === stepId ? { ...s, label: label.trim() || undefined } : s));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={steps.map(s => s.id)} strategy={horizontalListSortingStrategy}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 flex flex-wrap gap-1.5">
          {steps.map((step, index) => (
            <SortableStepCard
              key={step.id}
              step={step}
              index={index}
              isActive={!isCelebration && index === currentIndex}
              onClick={() => onCurrentIndexChange(index)}
              onRename={label => handleRename(step.id, label)}
            />
          ))}
          {hasCelebration && (
            <div
              className={`flex flex-col gap-1 px-2.5 py-2 rounded-xl border transition-all cursor-pointer flex-shrink-0 w-[110px] ${
                isCelebration ? 'border-[#6B1C3A]/40 bg-[#6B1C3A]/5' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onCurrentIndexChange(steps.length)}
            >
              <span className="text-[10px] font-bold text-gray-400">{steps.length + 1}</span>
              <span className={`text-xs font-semibold truncate ${isCelebration ? 'text-[#6B1C3A]' : 'text-gray-700'}`}>
                Celebração ✨
              </span>
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
