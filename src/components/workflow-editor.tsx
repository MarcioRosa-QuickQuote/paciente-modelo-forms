'use client';

import { MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { FormInput, FormStep, FormStepType, PhotoPair, WorkflowOption } from '@/types/form';
import {
  WORKFLOW_CANVAS_MIN_HEIGHT,
  WORKFLOW_CANVAS_MIN_WIDTH,
  WORKFLOW_SPECIAL_NODE_IDS,
  buildWorkflowConnections,
  ensureWorkflowLayout,
  getSpecialWorkflowPosition,
  getStepWorkflowPosition,
  isDecisionStep,
} from '@/lib/workflow';
import FormPreviewPanel from './form-preview-panel';

interface Props {
  steps: FormStep[];
  onChange: (steps: FormStep[]) => void;
  currentStepIndex: number;
  onCurrentStepIndexChange: (index: number) => void;
  createStep: (type: FormStepType) => FormStep;
  previewForm: FormInput;
  photos: PhotoPair[];
}

const NODE_WIDTH = 224;
const NODE_HEIGHT = 132;
const SPECIAL_NODE_WIDTH = 220;
const SPECIAL_NODE_HEIGHT = 104;
const INSERT_LINE_WIDTH = 16;
const INSERT_BUTTON_SIZE = 34;
const HOVER_PREVIEW_WIDTH = 348;
const HOVER_PREVIEW_HEIGHT = 654;
const NODE_GAP_X = 380;

const STEP_TYPE_LABELS: Record<FormStepType, string> = {
  foto: 'Fotos Antes/Depois',
  disponibilidade: 'Disponibilidade',
  preco: 'Preço',
  taxa: 'Taxa',
  pergunta: 'Pergunta',
  livre: 'Tela Livre',
};

function stripHtml(value?: string): string {
  return (value || '').replace(/<[^>]*>/g, '').trim();
}

function summarizeStep(step: FormStep): string {
  if (step.type === 'pergunta') {
    return stripHtml(step.question) || 'Etapa de decisão do workflow';
  }

  if (step.type === 'livre') {
    return stripHtml(step.label) || 'Tela livre para criativos específicos';
  }

  return 'Segue o fluxo principal do formulário.';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default function WorkflowEditor({
  steps,
  onChange,
  currentStepIndex,
  onCurrentStepIndexChange,
  createStep,
  previewForm,
  photos,
}: Props) {
  const canvasViewportRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<{
    stepId: string;
    startX: number;
    startY: number;
    pointerX: number;
    pointerY: number;
  } | null>(null);
  const [insertMenu, setInsertMenu] = useState<{
    sourceStepId: string;
    x: number;
    y: number;
  } | null>(null);
  const [hoverPreview, setHoverPreview] = useState<{
    stepIndex: number;
    x: number;
    y: number;
    width: number;
  } | null>(null);

  const stepsWithLayout = useMemo(() => ensureWorkflowLayout(steps), [steps]);
  const selectedStep = stepsWithLayout[currentStepIndex] ?? null;
  const connections = useMemo(() => buildWorkflowConnections(stepsWithLayout), [stepsWithLayout]);
  const celebrationPosition = useMemo(() => getSpecialWorkflowPosition(stepsWithLayout, 'celebration'), [stepsWithLayout]);
  const rejectedPosition = useMemo(() => getSpecialWorkflowPosition(stepsWithLayout, 'rejected'), [stepsWithLayout]);

  useEffect(() => {
    if (!steps.some(step => !step.workflowPosition)) return;
    onChange(stepsWithLayout);
  }, [onChange, steps, stepsWithLayout]);

  useEffect(() => {
    if (!dragging) return;

    const activeDrag = dragging;

    function handleMouseMove(event: globalThis.MouseEvent) {
      const deltaX = event.clientX - activeDrag.pointerX;
      const deltaY = event.clientY - activeDrag.pointerY;

      onChange(stepsWithLayout.map(step => {
        if (step.id !== activeDrag.stepId) return step;
        return {
          ...step,
          workflowPosition: {
            x: Math.max(32, activeDrag.startX + deltaX),
            y: Math.max(32, activeDrag.startY + deltaY),
          },
        };
      }));
    }

    function handleMouseUp() {
      setDragging(null);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, onChange, stepsWithLayout]);

  useEffect(() => {
    if (!dragging) return;
    setHoverPreview(null);
    setInsertMenu(null);
  }, [dragging]);

  useEffect(() => {
    if (!insertMenu) return;

    function handleWindowClick(event: globalThis.MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-workflow-insert-menu]') || target.closest('[data-workflow-insert-trigger]')) return;
      setInsertMenu(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setInsertMenu(null);
      }
    }

    window.addEventListener('mousedown', handleWindowClick);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handleWindowClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [insertMenu]);

  useEffect(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;

    function handleViewportChange() {
      setHoverPreview(null);
    }

    viewport.addEventListener('scroll', handleViewportChange, { passive: true });
    window.addEventListener('resize', handleViewportChange);

    return () => {
      viewport.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  const canvasWidth = useMemo(() => {
    const stepXs = stepsWithLayout.map((step, index) => getStepWorkflowPosition(step, index).x + NODE_WIDTH + 180);
    return Math.max(
      WORKFLOW_CANVAS_MIN_WIDTH,
      ...stepXs,
      celebrationPosition.x + SPECIAL_NODE_WIDTH + 160,
      rejectedPosition.x + SPECIAL_NODE_WIDTH + 160,
    );
  }, [celebrationPosition.x, rejectedPosition.x, stepsWithLayout]);

  const canvasHeight = useMemo(() => {
    const stepYs = stepsWithLayout.map((step, index) => getStepWorkflowPosition(step, index).y + NODE_HEIGHT + 120);
    return Math.max(
      WORKFLOW_CANVAS_MIN_HEIGHT,
      ...stepYs,
      celebrationPosition.y + SPECIAL_NODE_HEIGHT + 120,
      rejectedPosition.y + SPECIAL_NODE_HEIGHT + 120,
    );
  }, [celebrationPosition.y, rejectedPosition.y, stepsWithLayout]);

  const nodeFrames = useMemo(() => {
    const frames = new Map<string, { x: number; y: number; width: number; height: number }>();

    stepsWithLayout.forEach((step, index) => {
      const position = getStepWorkflowPosition(step, index);
      frames.set(step.id, { x: position.x, y: position.y, width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    frames.set(WORKFLOW_SPECIAL_NODE_IDS.celebration, {
      x: celebrationPosition.x,
      y: celebrationPosition.y,
      width: SPECIAL_NODE_WIDTH,
      height: SPECIAL_NODE_HEIGHT,
    });

    frames.set(WORKFLOW_SPECIAL_NODE_IDS.rejected, {
      x: rejectedPosition.x,
      y: rejectedPosition.y,
      width: SPECIAL_NODE_WIDTH,
      height: SPECIAL_NODE_HEIGHT,
    });

    return frames;
  }, [celebrationPosition, rejectedPosition, stepsWithLayout]);

  function applyMinimumHorizontalSpacing(currentSteps: FormStep[]): FormStep[] {
    const laneItems = new Map<number, Array<{ index: number; x: number }>>();

    currentSteps.forEach((step, index) => {
      const position = getStepWorkflowPosition(step, index);
      const laneKey = Math.round(position.y / 88);
      const currentLane = laneItems.get(laneKey) || [];
      currentLane.push({ index, x: position.x });
      laneItems.set(laneKey, currentLane);
    });

    let changed = false;
    const nextSteps = currentSteps.map(step => ({
      ...step,
      workflowPosition: step.workflowPosition ? { ...step.workflowPosition } : step.workflowPosition,
    }));

    laneItems.forEach(items => {
      const ordered = [...items].sort((left, right) => left.x - right.x);
      let previousX: number | null = null;

      ordered.forEach(item => {
        const position = getStepWorkflowPosition(nextSteps[item.index], item.index);

        if (previousX === null) {
          previousX = position.x;
          return;
        }

        const requiredX = previousX + NODE_GAP_X;
        if (position.x < requiredX) {
          nextSteps[item.index] = {
            ...nextSteps[item.index],
            workflowPosition: {
              x: requiredX,
              y: position.y,
            },
          };
          previousX = requiredX;
          changed = true;
          return;
        }

        previousX = position.x;
      });
    });

    return changed ? nextSteps : currentSteps;
  }

  useEffect(() => {
    const spacedSteps = applyMinimumHorizontalSpacing(stepsWithLayout);
    const hasSpacingChange = spacedSteps.some((step, index) => {
      const currentPosition = getStepWorkflowPosition(stepsWithLayout[index], index);
      const nextPosition = getStepWorkflowPosition(step, index);
      return currentPosition.x !== nextPosition.x || currentPosition.y !== nextPosition.y;
    });

    if (hasSpacingChange) {
      onChange(spacedSteps);
    }
  }, [onChange, stepsWithLayout]);

  function updateStep(stepId: string, updates: Partial<FormStep>) {
    onChange(stepsWithLayout.map(step => step.id === stepId ? { ...step, ...updates } : step));
  }

  function updateOption(stepId: string, optionId: string, updater: (option: WorkflowOption) => WorkflowOption) {
    onChange(stepsWithLayout.map(step => {
      if (step.id !== stepId) return step;
      return {
        ...step,
        workflowOptions: (step.workflowOptions || []).map(option => option.id === optionId ? updater(option) : option),
      };
    }));
  }

  function addWorkflowOption() {
    if (!selectedStep || selectedStep.type !== 'pergunta') return;

    const nextCount = (selectedStep.workflowOptions?.length || 0) + 1;
    updateStep(selectedStep.id, {
      workflowOptions: [
        ...(selectedStep.workflowOptions || []),
        {
          id: crypto.randomUUID(),
          label: `Opção ${nextCount}`,
          description: '',
          target: 'next',
        },
      ],
    });
  }

  function removeWorkflowOption(stepId: string, optionId: string) {
    const step = stepsWithLayout.find(item => item.id === stepId);
    if (!step) return;

    updateStep(stepId, {
      workflowOptions: (step.workflowOptions || []).filter(option => option.id !== optionId),
    });
  }

  function insertWorkflowStepAfter(sourceStepId: string, type: Extract<FormStepType, 'pergunta' | 'livre'>) {
    const sourceIndex = stepsWithLayout.findIndex(step => step.id === sourceStepId);
    if (sourceIndex === -1) return;

    const sourceStep = stepsWithLayout[sourceIndex];
    const sourcePosition = getStepWorkflowPosition(sourceStep, sourceIndex);
    const nextX = sourcePosition.x + NODE_GAP_X;
    const nextY = sourcePosition.y + (type === 'pergunta' ? 32 : 0);

    const shiftedSteps = stepsWithLayout.map((step, index) => {
      const position = getStepWorkflowPosition(step, index);
      const sameLane = Math.abs(position.y - sourcePosition.y) < 88;
      const shouldShift = step.id !== sourceStepId && sameLane && position.x >= nextX - 24;

      if (!shouldShift) return step;

      return {
        ...step,
        workflowPosition: {
          x: position.x + NODE_GAP_X,
          y: position.y,
        },
      };
    });

    const newStep = {
      ...createStep(type),
      workflowPosition: {
        x: nextX,
        y: nextY,
      },
    };

    const nextSteps = [
      ...shiftedSteps.slice(0, sourceIndex + 1),
      newStep,
      ...shiftedSteps.slice(sourceIndex + 1),
    ];

    onChange(nextSteps);
    onCurrentStepIndexChange(sourceIndex + 1);
    setInsertMenu(null);
  }

  function deleteWorkflowStep(stepId: string) {
    if (stepsWithLayout.length <= 1) return;

    const deleteIndex = stepsWithLayout.findIndex(step => step.id === stepId);
    if (deleteIndex === -1) return;

    const nextSteps = stepsWithLayout
      .filter(step => step.id !== stepId)
      .map(step => ({
        ...step,
        workflowOptions: (step.workflowOptions || []).map(option => {
          if (option.target === 'step' && option.nextStepId === stepId) {
            return {
              ...option,
              target: 'next' as const,
              nextStepId: undefined,
            };
          }

          return option;
        }),
      }));

    const nextIndex = currentStepIndex > deleteIndex
      ? currentStepIndex - 1
      : Math.min(currentStepIndex, nextSteps.length - 1);

    onChange(nextSteps);
    onCurrentStepIndexChange(nextIndex);
    setInsertMenu(current => current?.sourceStepId === stepId ? null : current);
    setHoverPreview(current => current?.stepIndex === deleteIndex ? null : current);
  }

  function openInsertMenu(stepId: string) {
    const frame = nodeFrames.get(stepId);
    if (!frame) return;

    const x = clamp(frame.x + NODE_WIDTH + INSERT_LINE_WIDTH + INSERT_BUTTON_SIZE + 24, 24, canvasWidth - 236);
    const y = clamp(frame.y + frame.height + 14, 24, canvasHeight - 138);

    setInsertMenu(current => current?.sourceStepId === stepId ? null : {
      sourceStepId: stepId,
      x,
      y,
    });
  }

  function updateHoverPreview(event: ReactMouseEvent<HTMLDivElement>, stepIndex: number) {
    if (dragging) return;

    const viewport = canvasViewportRef.current;
    if (!viewport) return;

    const viewportRect = viewport.getBoundingClientRect();
    const cardRect = event.currentTarget.getBoundingClientRect();
    const previewWidth = Math.min(HOVER_PREVIEW_WIDTH, Math.max(300, viewport.clientWidth - 32));
    const previewHeight = Math.min(HOVER_PREVIEW_HEIGHT, Math.max(360, viewport.clientHeight - 28));

    let x = cardRect.right - viewportRect.left + 32;
    if (x + previewWidth > viewport.clientWidth - 12) {
      x = cardRect.left - viewportRect.left - previewWidth - 28;
    }
    if (x < 12) {
      x = (viewport.clientWidth - previewWidth) / 2;
    }

    let y = cardRect.top - viewportRect.top + (cardRect.height / 2) - (previewHeight / 2);
    y = clamp(y, 12, Math.max(12, viewport.clientHeight - previewHeight - 12));

    setHoverPreview({
      stepIndex,
      x: clamp(x, 12, Math.max(12, viewport.clientWidth - previewWidth - 12)),
      y,
      width: previewWidth,
    });
  }

  function renderConnectionPath(connection: { id: string; fromKey: string; toKey: string; label?: string; accent?: string }) {
    const from = nodeFrames.get(connection.fromKey);
    const to = nodeFrames.get(connection.toKey);

    if (!from || !to) return null;

    const startX = from.x + from.width + 8;
    const startY = from.y + from.height / 2;
    const endX = to.x - 8;
    const endY = to.y + to.height / 2;
    const curve = Math.max(72, Math.abs(endX - startX) / 2);
    const d = `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`;

    const stroke = connection.accent === 'danger'
      ? '#ef4444'
      : connection.accent === 'success'
        ? '#10b981'
        : connection.accent === 'branch'
          ? '#7c3aed'
          : '#cbd5e1';

    const labelX = (startX + endX) / 2;
    const labelY = (startY + endY) / 2 - 10;

    return (
      <g key={connection.id}>
        <path d={d} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <circle cx={startX} cy={startY} r="4" fill={stroke} />
        <circle cx={endX} cy={endY} r="4" fill={stroke} />
        {connection.label && (
          <g>
            <rect x={labelX - 52} y={labelY - 11} width="104" height="22" rx="11" fill="white" opacity="0.96" />
            <text x={labelX} y={labelY + 4} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">
              {connection.label}
            </text>
          </g>
        )}
      </g>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-semibold text-gray-900">Workflow do Funil</p>
          <p className="text-xs text-gray-500">
            Arraste os cards, use o <span className="font-semibold text-gray-700">+</span> para inserir novas etapas e visualize o preview ao passar o mouse.
          </p>
        </div>
        <div className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-700">
          Fluxo visual no estilo n8n
        </div>
      </div>

      <div
        ref={canvasViewportRef}
        className="relative h-full min-h-0 flex-1 overflow-auto rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(107,28,58,0.06),_transparent_28%),linear-gradient(180deg,#ffffff_0%,#faf8fc_100%)]"
      >
        <div className="relative min-h-full" style={{ width: canvasWidth, height: canvasHeight }}>
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {connections.map(renderConnectionPath)}
          </svg>

          {stepsWithLayout.map((step, index) => {
            const position = getStepWorkflowPosition(step, index);
            const selected = index === currentStepIndex;
            const decision = isDecisionStep(step);
            const canDelete = stepsWithLayout.length > 1;

            return (
              <div
                key={step.id}
                className={`group absolute overflow-visible rounded-[28px] border bg-white p-4 shadow-sm transition-all ${selected ? 'z-20 border-[#6B1C3A] shadow-lg shadow-[#6B1C3A]/10' : 'border-gray-200'} ${step.hidden ? 'opacity-60' : ''}`}
                style={{ width: NODE_WIDTH, minHeight: NODE_HEIGHT, left: position.x, top: position.y }}
                onMouseEnter={event => updateHoverPreview(event, index)}
                onMouseMove={event => updateHoverPreview(event, index)}
                onMouseLeave={() => setHoverPreview(current => current?.stepIndex === index ? null : current)}
              >
                <span className={`pointer-events-none absolute -left-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${decision ? 'bg-violet-500' : 'bg-slate-300'}`} />
                <span className={`pointer-events-none absolute -right-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${decision ? 'bg-violet-500' : 'bg-slate-300'}`} />

                <div className="pointer-events-none absolute left-full top-1/2 flex -translate-y-1/2 items-center pl-4">
                  <span className="h-[2px] w-[20px] rounded-full bg-slate-300" />
                </div>

                <button
                  type="button"
                  data-workflow-insert-trigger
                  onMouseEnter={event => {
                    event.stopPropagation();
                    setHoverPreview(current => current?.stepIndex === index ? null : current);
                  }}
                  onMouseMove={event => {
                    event.stopPropagation();
                    setHoverPreview(current => current?.stepIndex === index ? null : current);
                  }}
                  onClick={event => {
                    event.stopPropagation();
                    openInsertMenu(step.id);
                  }}
                  className="absolute left-full top-1/2 z-10 ml-6 flex h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-semibold text-gray-500 shadow-sm transition-all hover:border-[#6B1C3A]/30 hover:text-[#6B1C3A] hover:shadow"
                  aria-label="Inserir etapa após este card"
                >
                  +
                </button>

                <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-500">
                  <button
                    type="button"
                    onMouseDown={event => {
                      event.preventDefault();
                      setDragging({
                        stepId: step.id,
                        startX: position.x,
                        startY: position.y,
                        pointerX: event.clientX,
                        pointerY: event.clientY,
                      });
                      onCurrentStepIndexChange(index);
                    }}
                    className="flex min-w-0 flex-1 cursor-grab items-center gap-2 text-left active:cursor-grabbing"
                  >
                    <span className="truncate">{STEP_TYPE_LABELS[step.type]}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-500">{index + 1}</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={event => event.stopPropagation()}
                    onClick={event => {
                      event.stopPropagation();
                      deleteWorkflowStep(step.id);
                    }}
                    disabled={!canDelete}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Excluir etapa"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5h6v2m-7 0 1 12h6l1-12M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>

                <button type="button" onClick={() => onCurrentStepIndexChange(index)} className="w-full text-left">
                  <p className="text-sm font-semibold text-gray-900">{step.label || STEP_TYPE_LABELS[step.type]}</p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">{summarizeStep(step)}</p>
                </button>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {decision ? (
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">{(step.workflowOptions || []).length} saídas</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">Fluxo linear</span>
                  )}
                  {step.hidden && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">Oculta</span>}
                </div>
              </div>
            );
          })}

          {insertMenu && (
            <div
              data-workflow-insert-menu
              className="absolute z-30 w-52 rounded-3xl border border-gray-200 bg-white p-3 shadow-2xl shadow-gray-900/10"
              style={{ left: insertMenu.x, top: insertMenu.y }}
            >
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Inserir depois</p>
              <div className="mt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => insertWorkflowStepAfter(insertMenu.sourceStepId, 'pergunta')}
                  className="flex w-full items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 px-3 py-3 text-left transition-colors hover:bg-violet-50"
                >
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-violet-700 shadow-sm">?</span>
                  <span>
                    <span className="block text-sm font-semibold text-violet-900">Pergunta de decisão</span>
                    <span className="block text-xs leading-relaxed text-violet-700">Cria outro ponto de ramificação no funil.</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => insertWorkflowStepAfter(insertMenu.sourceStepId, 'livre')}
                  className="flex w-full items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-left transition-colors hover:bg-gray-100"
                >
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-gray-700 shadow-sm">+</span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">Tela livre</span>
                    <span className="block text-xs leading-relaxed text-gray-600">Adiciona uma etapa para criativos e explicações.</span>
                  </span>
                </button>
              </div>
            </div>
          )}

          {hoverPreview && (
            <div
              className="pointer-events-none absolute z-40"
              style={{ left: hoverPreview.x, top: hoverPreview.y, width: hoverPreview.width }}
            >
              <div className="rounded-[32px] shadow-2xl shadow-gray-900/15">
                <FormPreviewPanel
                  form={previewForm}
                  photos={photos}
                  steps={stepsWithLayout}
                  currentIndex={hoverPreview.stepIndex}
                  onCurrentIndexChange={() => undefined}
                  sticky={false}
                />
              </div>
            </div>
          )}

          <div className="absolute rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm" style={{ width: SPECIAL_NODE_WIDTH, minHeight: SPECIAL_NODE_HEIGHT, left: celebrationPosition.x, top: celebrationPosition.y }}>
            <span className="pointer-events-none absolute -left-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Saída</p>
            <p className="mt-2 text-lg font-semibold text-emerald-900">Celebração</p>
            <p className="mt-2 text-xs leading-relaxed text-emerald-700">Todos os caminhos podem convergir para a tela final do funil.</p>
          </div>

          <div className="absolute rounded-[28px] border border-rose-200 bg-rose-50/80 p-4 shadow-sm" style={{ width: SPECIAL_NODE_WIDTH, minHeight: SPECIAL_NODE_HEIGHT, left: rejectedPosition.x, top: rejectedPosition.y }}>
            <span className="pointer-events-none absolute -left-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-rose-500 shadow-sm" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Saída</p>
            <p className="mt-2 text-lg font-semibold text-rose-900">Reprovação</p>
            <p className="mt-2 text-xs leading-relaxed text-rose-700">Use quando a opção deve encerrar o funil fora da qualificação.</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        {!selectedStep ? (
          <div className="space-y-2 text-sm text-gray-500">
            <p className="font-semibold text-gray-800">Selecione uma etapa</p>
            <p>Escolha um card no canvas para editar as saídas e o comportamento dele no workflow.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Etapa selecionada</p>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{selectedStep.label || STEP_TYPE_LABELS[selectedStep.type]}</h3>
                <p className="mt-1 text-sm text-gray-500">{summarizeStep(selectedStep)}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500">
                {STEP_TYPE_LABELS[selectedStep.type]}
              </span>
            </div>

            {selectedStep.type === 'pergunta' ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                  <p className="text-sm font-semibold text-violet-900">Pergunta com múltiplas saídas</p>
                  <p className="mt-1 text-xs leading-relaxed text-violet-700">
                    Quando existir pelo menos uma opção aqui, essa etapa deixa de usar Sim/Não e passa a renderizar cards de escolha no formulário.
                  </p>
                </div>

                <button type="button" onClick={addWorkflowOption} className="w-full rounded-2xl border border-[#6B1C3A]/20 bg-white px-4 py-3 text-sm font-semibold text-[#6B1C3A] transition-colors hover:bg-[#6B1C3A]/5">
                  + Adicionar opção
                </button>

                {(selectedStep.workflowOptions || []).length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500">
                    Nenhuma saída configurada ainda. Adicione opções para começar a ramificar o funil.
                  </div>
                )}

                {(selectedStep.workflowOptions || []).map(option => (
                  <div key={option.id} className="space-y-3 rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900">Opção</p>
                      <button type="button" onClick={() => removeWorkflowOption(selectedStep.id, option.id)} className="text-xs font-semibold text-rose-500 transition-colors hover:text-rose-600">
                        Remover
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Título do card</label>
                      <input type="text" value={option.label} onChange={event => updateOption(selectedStep.id, option.id, current => ({ ...current, label: event.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-[#6B1C3A] focus:ring-2 focus:ring-[#6B1C3A]/10" placeholder="Ex: Nariz largo" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Texto de apoio</label>
                      <textarea value={option.description || ''} onChange={event => updateOption(selectedStep.id, option.id, current => ({ ...current, description: event.target.value }))} rows={2} className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-[#6B1C3A] focus:ring-2 focus:ring-[#6B1C3A]/10" placeholder="Explique rapidamente o tipo de caso para esse caminho." />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Destino</label>
                      <select value={option.target || 'next'} onChange={event => updateOption(selectedStep.id, option.id, current => ({ ...current, target: event.target.value as WorkflowOption['target'], nextStepId: event.target.value === 'step' ? current.nextStepId : undefined }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-[#6B1C3A] focus:ring-2 focus:ring-[#6B1C3A]/10">
                        <option value="next">Próxima tela na ordem</option>
                        <option value="step">Ir para uma tela específica</option>
                        <option value="celebration">Ir para celebração</option>
                        <option value="rejected">Ir para reprovação</option>
                      </select>
                    </div>

                    {(option.target || 'next') === 'step' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Tela de destino</label>
                        <select value={option.nextStepId || ''} onChange={event => updateOption(selectedStep.id, option.id, current => ({ ...current, nextStepId: event.target.value }))} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-[#6B1C3A] focus:ring-2 focus:ring-[#6B1C3A]/10">
                          <option value="">Selecione a etapa</option>
                          {stepsWithLayout.filter(step => step.id !== selectedStep.id).map((step, index) => (
                            <option key={step.id} value={step.id}>{index + 1}. {step.label || STEP_TYPE_LABELS[step.type]}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                Essa etapa segue a ordem padrão do formulário. Para abrir caminhos diferentes, use o <strong>+</strong> ao lado do card ou crie uma etapa do tipo <strong>Pergunta</strong> e configure as opções aqui no workflow.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
