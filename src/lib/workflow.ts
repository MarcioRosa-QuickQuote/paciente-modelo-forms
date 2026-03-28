import { FormStep, WorkflowOption, WorkflowPosition } from '@/types/form';

export const WORKFLOW_CANVAS_MIN_WIDTH = 1480;
export const WORKFLOW_CANVAS_MIN_HEIGHT = 760;
export const WORKFLOW_SPECIAL_NODE_IDS = {
  celebration: '__workflow_celebration__',
  rejected: '__workflow_rejected__',
} as const;

const START_X = 72;
const START_Y = 96;
const GAP_X = 260;
const GAP_Y = 180;

export type WorkflowSpecialScreen = 'celebration' | 'rejected';
export type WorkflowDestination =
  | { kind: 'step'; stepId: string }
  | { kind: 'special'; screen: WorkflowSpecialScreen };

export interface WorkflowConnection {
  id: string;
  fromKey: string;
  toKey: string;
  label?: string;
  accent?: 'linear' | 'branch' | 'success' | 'danger';
}

export function isDecisionStep(step?: FormStep): boolean {
  return !!step && step.type === 'pergunta' && (step.workflowOptions?.length ?? 0) > 0;
}

export function getDefaultWorkflowPosition(index: number): WorkflowPosition {
  return {
    x: START_X + (index % 4) * GAP_X,
    y: START_Y + Math.floor(index / 4) * GAP_Y,
  };
}

export function getStepWorkflowPosition(step: FormStep, index: number): WorkflowPosition {
  return step.workflowPosition ?? getDefaultWorkflowPosition(index);
}

export function ensureWorkflowLayout(steps: FormStep[]): FormStep[] {
  return steps.map((step, index) => (
    step.workflowPosition
      ? step
      : { ...step, workflowPosition: getDefaultWorkflowPosition(index) }
  ));
}

export function getOrderedVisibleSteps(steps: FormStep[]): FormStep[] {
  return steps.filter(step => !step.hidden);
}

export function getStepOrderIndex(steps: FormStep[], stepId: string): number {
  return steps.findIndex(step => step.id === stepId);
}

export function getLinearNextStepId(steps: FormStep[], currentStepId: string): string | null {
  const visibleSteps = getOrderedVisibleSteps(steps);
  const currentIndex = visibleSteps.findIndex(step => step.id === currentStepId);

  if (currentIndex === -1) return visibleSteps[0]?.id ?? null;
  return visibleSteps[currentIndex + 1]?.id ?? null;
}

export function resolveWorkflowDestination(
  steps: FormStep[],
  currentStepId: string,
  option?: WorkflowOption,
): WorkflowDestination {
  const fallbackStepId = getLinearNextStepId(steps, currentStepId);
  const target = option?.target ?? 'next';

  if (target === 'celebration') {
    return { kind: 'special', screen: 'celebration' };
  }

  if (target === 'rejected') {
    return { kind: 'special', screen: 'rejected' };
  }

  if (target === 'step' && option?.nextStepId) {
    const visibleTarget = getOrderedVisibleSteps(steps).find(step => step.id === option.nextStepId);
    if (visibleTarget) {
      return { kind: 'step', stepId: visibleTarget.id };
    }
  }

  if (fallbackStepId) {
    return { kind: 'step', stepId: fallbackStepId };
  }

  return { kind: 'special', screen: 'celebration' };
}

export function getSpecialWorkflowPosition(steps: FormStep[], screen: WorkflowSpecialScreen): WorkflowPosition {
  const positions = steps.map((step, index) => getStepWorkflowPosition(step, index));
  const maxX = positions.length > 0 ? Math.max(...positions.map(position => position.x)) : START_X;
  const minY = positions.length > 0 ? Math.min(...positions.map(position => position.y)) : START_Y;
  const maxY = positions.length > 0 ? Math.max(...positions.map(position => position.y)) : START_Y + GAP_Y;

  return {
    x: maxX + 320,
    y: screen === 'celebration' ? Math.max(48, minY + 20) : maxY + 160,
  };
}

export function buildWorkflowConnections(steps: FormStep[]): WorkflowConnection[] {
  const connections: WorkflowConnection[] = [];

  steps.forEach((step, index) => {
    if (isDecisionStep(step)) {
      (step.workflowOptions || []).forEach(option => {
        const target = option.target ?? 'next';
        let toKey = '';
        let accent: WorkflowConnection['accent'] = 'branch';

        if (target === 'step' && option.nextStepId) {
          toKey = option.nextStepId;
        } else if (target === 'celebration') {
          toKey = WORKFLOW_SPECIAL_NODE_IDS.celebration;
          accent = 'success';
        } else if (target === 'rejected') {
          toKey = WORKFLOW_SPECIAL_NODE_IDS.rejected;
          accent = 'danger';
        } else {
          toKey = steps[index + 1]?.id ?? WORKFLOW_SPECIAL_NODE_IDS.celebration;
          accent = toKey === WORKFLOW_SPECIAL_NODE_IDS.celebration ? 'success' : 'branch';
        }

        if (!toKey) return;

        connections.push({
          id: `${step.id}-${option.id}-${toKey}`,
          fromKey: step.id,
          toKey,
          label: option.label,
          accent,
        });
      });
      return;
    }

    const nextStep = steps[index + 1];
    const toKey = nextStep?.id ?? WORKFLOW_SPECIAL_NODE_IDS.celebration;

    connections.push({
      id: `${step.id}-linear-${toKey}`,
      fromKey: step.id,
      toKey,
      accent: toKey === WORKFLOW_SPECIAL_NODE_IDS.celebration ? 'success' : 'linear',
    });
  });

  return connections;
}
