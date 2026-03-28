import { CustomTexts, FormData, FormInput, FormStep, FormStepType } from '@/types/form';

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

function hasText(value?: string): boolean {
  return stripHtml(value || '').trim().length > 0;
}

type BlankFormCandidate = Pick<FormData, 'procedureName' | 'headline' | 'supportText' | 'whatsappMessage' | 'customTexts' | 'steps'>
  | Pick<FormInput, 'procedureName' | 'headline' | 'supportText' | 'whatsappMessage' | 'customTexts' | 'steps'>;

export function isBlankFormLike(form?: BlankFormCandidate): boolean {
  if (!form) return true;

  if (
    hasText(form.procedureName) ||
    hasText(form.headline) ||
    hasText(form.supportText) ||
    hasText(form.whatsappMessage)
  ) {
    return false;
  }

  if (Object.values(form.customTexts || {}).some(value => hasText(value))) {
    return false;
  }

  if ((form.steps || []).some(step => hasText(step.label) || hasText(step.question) || hasText(step.yesText) || hasText(step.noText))) {
    return false;
  }

  return true;
}

export function getDefaultHeadline(procedureName?: string): string {
  const plainProcedureName = stripHtml(procedureName || '').trim();
  if (!plainProcedureName) {
    return 'Você tem interesse em ser paciente modelo?';
  }
  return `Você tem interesse em ser paciente modelo de <strong>${plainProcedureName}</strong>?`;
}

export function getDefaultSupportText(): string {
  return 'Responda às próximas perguntas para verificar se você se qualifica.';
}

export function getDefaultWhatsappMessage(procedureName?: string): string {
  const plainProcedureName = stripHtml(procedureName || '').trim();
  if (!plainProcedureName) {
    return 'Olá! Tenho interesse em ser paciente modelo!';
  }
  return `Olá! Tenho interesse em ser paciente modelo para ${plainProcedureName}!`;
}

export function getDefaultCustomTexts(procedureDuration?: string): CustomTexts {
  const plainProcedureDuration = stripHtml(procedureDuration || '').trim() || '2h';

  return {
    availabilityQuestion: 'Você teria disponibilidade em algum desses dias?',
    durationNote: `O procedimento dura cerca de ${plainProcedureDuration}.`,
    pricingContext: 'Sabendo que um paciente de <strong>{procedureName}</strong> pagaria em média <span style="text-decoration:line-through;color:#9ca3af">{preco}</span>.',
    pricingQuestion: 'E por ser <strong>PACIENTE MODELO</strong> ganharia uma condição especial, teria disponibilidade de investir o valor abaixo?',
    pricingLabel: 'Valor especial paciente modelo',
    feeTextPrefix: 'Para reservar seu horário na agenda, solicitamos um valor simbólico de',
    feeBenefitText: 'Mas fique tranquilo(a)! Esse valor será abatido do valor do procedimento.',
    feeDeductedLabel: 'Valor abatido',
    feeSafeLabel: 'Seguro',
    celebrationTitle: 'Parabéns!',
    celebrationSubtitle: 'Você foi qualificada para ser nossa paciente modelo!',
    celebrationMessage: 'É só chamar a gente no WhatsApp e aguardar o retorno de uma das nossas consultoras 🥰',
  };
}

export function mergeCustomTextsWithDefaults(customTexts: CustomTexts | undefined, procedureDuration: string, enabled: boolean): CustomTexts {
  const source = customTexts || {};
  if (!enabled) return { ...source };

  const defaults = getDefaultCustomTexts(procedureDuration);
  return {
    ...defaults,
    ...Object.fromEntries(
      Object.entries(source).filter(([, value]) => hasText(value))
    ),
  };
}

export function getNewStepDefaults(type: FormStepType, enabled: boolean): Partial<FormStep> {
  if (!enabled) {
    if (type === 'pergunta') return { question: '', yesText: '', noText: '', workflowOptions: [] };
    if (type === 'livre') return { label: '' };
    return { yesText: '', noText: '' };
  }

  switch (type) {
    case 'foto':
      return { yesText: 'Tenho interesse', noText: 'Não' };
    case 'disponibilidade':
      return { yesText: 'Sim, tenho', noText: 'Não' };
    case 'preco':
      return { yesText: 'Sim, posso', noText: 'Não' };
    case 'taxa':
      return { yesText: 'Sim, concordo', noText: 'Não' };
    case 'pergunta':
      return { question: 'Você está de acordo?', yesText: 'Sim', noText: 'Não', workflowOptions: [] };
    case 'livre':
      return { label: 'Tela Livre' };
    default:
      return {};
  }
}
