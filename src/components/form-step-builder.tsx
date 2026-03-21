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

export function getStepInfo(type: FormStepType) {
  return STEP_TYPES.find(s => s.type === type) || STEP_TYPES[0];
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface FormStepBuilderProps {
  steps: FormStep[];
  onChange: (steps: FormStep[]) => void;
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
  hasCelebration?: boolean;
  onConfigOpen?: () => void;
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

export default function FormStepBuilder({
  steps,
  onChange,
  currentIndex,
  onCurrentIndexChange,
  hasCelebration = false,
  onConfigOpen,
}: FormStepBuilderProps) {
  const [showPicker, setShowPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isCelebration = hasCelebration && currentIndex === steps.length;
  const totalSteps = hasCelebration ? steps.length + 1 : steps.length;
  const currentStep = !isCelebration ? (steps[currentIndex] ?? steps[0]) : null;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex(s => s.id === active.id);
    const newIndex = steps.findIndex(s => s.id === over.id);
    const reordered = arrayMove(steps, oldIndex, newIndex);
    onChange(reordered);
    // keep the current step focused after reorder
    const movedStepId = steps[currentIndex]?.id;
    if (movedStepId) {
      const newCurrentIndex = reordered.findIndex(s => s.id === movedStepId);
      if (newCurrentIndex !== -1) onCurrentIndexChange(newCurrentIndex);
    }
  }

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

  function goToPrev() {
    if (currentIndex > 0) onCurrentIndexChange(currentIndex - 1);
  }

  function goToNext() {
    if (currentIndex < totalSteps - 1) onCurrentIndexChange(currentIndex + 1);
  }

  if (!isCelebration && !currentStep) return null;

  const info = !isCelebration ? getStepInfo(currentStep!.type) : { label: 'Celebração', icon: null };

  return (
    <>
      {/* ── Navigation bar ── */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Left arrow */}
        <button
          type="button"
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0"
          aria-label="Etapa anterior"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Step name + counter */}
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          <span className="text-sm font-bold text-gray-900 truncate">{info.label}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {currentIndex + 1} / {steps.length}
          </span>
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={goToNext}
          disabled={currentIndex === totalSteps - 1}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0"
          aria-label="Próxima etapa"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Trash */}
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
          onClick={() => setShowPicker(!showPicker)}
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

      {/* ── Dots ── */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map(s => s.id)} strategy={horizontalListSortingStrategy}>
          <div className="px-4 py-2 flex items-center gap-1.5 border-t border-gray-100">
            {steps.map((step, index) => (
              <SortableDot
                key={step.id}
                id={step.id}
                isActive={index === currentIndex}
                onClick={() => onCurrentIndexChange(index)}
              />
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

      {/* ── Add Step Picker ── */}
      {showPicker && (
        <div className="px-4 pb-4">
          <AddStepPicker
            onAdd={(type) => {
              addStep(type);
              setShowPicker(false);
            }}
            onClose={() => setShowPicker(false)}
          />
        </div>
      )}
    </>
  );
}
