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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormStep, FormStepType } from '@/types/form';

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

function getStepInfo(type: FormStepType) {
  return STEP_TYPES.find(s => s.type === type) || STEP_TYPES[0];
}

// ─── Sortable Step Card ───────────────────────────────────────────────────────

interface SortableStepProps {
  step: FormStep;
  index: number;
  total: number;
  onRemove: () => void;
  onUpdate: (updated: FormStep) => void;
}

function SortableStep({ step, index, total, onRemove, onUpdate }: SortableStepProps) {
  const [expanded, setExpanded] = useState(false);
  const info = getStepInfo(step.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none text-sm text-gray-900";

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-3">
        {/* Drag handle */}
        <button
          type="button"
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
          {...attributes}
          {...listeners}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Step number */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6B1C3A]/10 text-[#6B1C3A] text-xs font-bold flex items-center justify-center">
          {index + 1}
        </div>

        {/* Icon + label */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-gray-500 flex-shrink-0">{info.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{info.label}</p>
            {step.type === 'pergunta' && step.question && (
              <p className="text-xs text-gray-400 truncate">{step.question}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {step.type === 'pergunta' && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-gray-400 hover:text-[#6B1C3A] rounded-lg hover:bg-gray-100 transition-colors"
              title="Editar pergunta"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {total > 1 && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              title="Remover etapa"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expanded config for 'pergunta' type */}
      {step.type === 'pergunta' && expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50/50 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Pergunta</label>
            <textarea
              rows={2}
              value={step.question || ''}
              onChange={e => onUpdate({ ...step, question: e.target.value })}
              placeholder="Ex: Você está disposto a fazer uma sessão de fotos para o nosso portfólio?"
              className={inputClass + ' resize-none'}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Texto do Sim</label>
              <input
                type="text"
                value={step.yesText || ''}
                onChange={e => onUpdate({ ...step, yesText: e.target.value })}
                placeholder="Sim, topo!"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Texto do Não</label>
              <input
                type="text"
                value={step.noText || ''}
                onChange={e => onUpdate({ ...step, noText: e.target.value })}
                placeholder="Não, obrigado"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Step Picker ──────────────────────────────────────────────────────────

interface AddStepPickerProps {
  onAdd: (type: FormStepType) => void;
  onClose: () => void;
}

function AddStepPicker({ onAdd, onClose }: AddStepPickerProps) {
  return (
    <div className="border border-dashed border-[#6B1C3A]/40 rounded-xl p-4 bg-[#6B1C3A]/5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Escolha o tipo de etapa</p>
      <div className="space-y-2">
        {STEP_TYPES.map(({ type, label, description, icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => { onAdd(type); onClose(); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left group"
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

interface FormStepBuilderProps {
  steps: FormStep[];
  onChange: (steps: FormStep[]) => void;
}

export default function FormStepBuilder({ steps, onChange }: FormStepBuilderProps) {
  const [showPicker, setShowPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex(s => s.id === active.id);
    const newIndex = steps.findIndex(s => s.id === over.id);
    onChange(arrayMove(steps, oldIndex, newIndex));
  }

  function addStep(type: FormStepType) {
    const newStep: FormStep = {
      id: crypto.randomUUID(),
      type,
      ...(type === 'pergunta' ? { question: '', yesText: '', noText: '' } : {}),
    };
    onChange([...steps, newStep]);
  }

  function removeStep(id: string) {
    onChange(steps.filter(s => s.id !== id));
  }

  function updateStep(id: string, updated: FormStep) {
    onChange(steps.map(s => s.id === id ? updated : s));
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {steps.map((step, index) => (
            <SortableStep
              key={step.id}
              step={step}
              index={index}
              total={steps.length}
              onRemove={() => removeStep(step.id)}
              onUpdate={(updated) => updateStep(step.id, updated)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {showPicker ? (
        <AddStepPicker onAdd={addStep} onClose={() => setShowPicker(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-400 hover:border-[#6B1C3A]/40 hover:text-[#6B1C3A] hover:bg-[#6B1C3A]/5 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar etapa
        </button>
      )}
    </div>
  );
}
