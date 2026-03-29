'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, FormInput, PhotoPair, FormStep, FormStepType, CustomTexts, WorkflowOption } from '@/types/form';
import { generateSlug } from '@/lib/utils';
import { THEMES, getTheme } from '@/lib/themes';
import { STEP_ICON_OPTIONS, StepIconGlyph, canCustomizeStepIcon, getDefaultStepIconId, isPresetStepIcon, isUploadedStepIcon } from '@/lib/step-icons';
import {
  getDefaultHeadline,
  getDefaultSupportText,
  getDefaultWhatsappMessage,
  getNewStepDefaults,
  isBlankFormLike,
  mergeCustomTextsWithDefaults,
} from '@/lib/form-text-defaults';
import { supabase } from '@/lib/supabase-client';
import Image from 'next/image';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/style.css';
import FormStepBuilder, { StepCardsList } from './form-step-builder';
import FormPreviewPanel from './form-preview-panel';
import RichTextField from './rich-text-field';
import CanvasBuilder, { CanvasBuilderShortcut } from './canvas-builder';
import WorkflowEditor from './workflow-editor';
import { ensureWorkflowLayout, isDecisionStep, syncDecisionBranchSteps } from '@/lib/workflow';
import { formInputSchema } from '@/lib/validators';

const DEFAULT_STEPS: FormStep[] = [
  { id: 'default-foto', type: 'foto' },
  { id: 'default-disponibilidade', type: 'disponibilidade' },
  { id: 'default-preco', type: 'preco' },
  { id: 'default-taxa', type: 'taxa' },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function formatBRL(value: number): string {
  if (!value) return '';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

interface TemplateData {
  procedureName?: string;
  headline?: string;
  supportText?: string;
  professionalName?: string;
  procedureDuration?: string;
  theme?: string;
}

interface FormEditorProps {
  initialData?: FormData;
  mode: 'create' | 'edit';
  templateId?: string;
  templateData?: TemplateData;
  initialEditorMode?: 'step' | 'workflow';
}

export default function FormEditor({ initialData, mode, templateId, templateData, initialEditorMode = 'step' }: FormEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<string | null>(null);
  const [uploadingStepIcon, setUploadingStepIcon] = useState(false);
  const saveRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [stepPickerOpen, setStepPickerOpen] = useState(false);
  const [insertPanelOpen, setInsertPanelOpen] = useState(false);
  const [stepIconPickerOpen, setStepIconPickerOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'step' | 'workflow'>(initialEditorMode);
  const [workflowStepModalOpen, setWorkflowStepModalOpen] = useState(false);
  const [pendingBuilderScroll, setPendingBuilderScroll] = useState(false);
  const [persistedFormId, setPersistedFormId] = useState<string | null>(initialData?.id || null);
  const [isDraftDocument, setIsDraftDocument] = useState(mode === 'create' || initialData?.isDraft === true);
  const [authReady, setAuthReady] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [autoSaveErrorMessage, setAutoSaveErrorMessage] = useState<string | null>(null);
  const photoRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const stepIconInputRef = useRef<HTMLInputElement | null>(null);
  const elementsBuilderRef = useRef<HTMLDivElement | null>(null);
  const persistedFormIdRef = useRef<string | null>(initialData?.id || null);
  const createBaselineRef = useRef<string | null>(null);
  const draftCreationInFlightRef = useRef(false);
  const lastAutoSavedSnapshotRef = useRef<string | null>(null);
  const savedToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialProcedureName = initialData?.procedureName || templateData?.procedureName || '';
  const initialProcedureDuration = initialData?.procedureDuration || templateData?.procedureDuration || '';
  const shouldPrefillTextDefaults = templateId !== 'em-branco' && (mode === 'create' || !isBlankFormLike(initialData));
  const initialCustomTexts = mergeCustomTextsWithDefaults(initialData?.customTexts, initialProcedureDuration, shouldPrefillTextDefaults);

  // Parse initial dates from string
  const parseDates = (str: string): Date[] => {
    if (!str) return [];
    return str.split(', ').map(d => {
      const parts = d.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
      return null;
    }).filter(Boolean) as Date[];
  };

  const [selectedDates, setSelectedDates] = useState<Date[]>(
    initialData?.availableDays ? parseDates(initialData.availableDays) : []
  );

  // Build initial photos from data
  const buildInitialPhotos = (): PhotoPair[] => {
    if (initialData?.photos?.length) return initialData.photos;
    if (initialData?.beforeImage || initialData?.afterImage) {
      return [{ before: initialData.beforeImage || '', after: initialData.afterImage || '' }];
    }
    return [{ before: '', after: '' }];
  };

  const [photos, setPhotos] = useState<PhotoPair[]>(buildInitialPhotos());

  function buildStepForEditor(type: FormStepType): FormStep {
    return {
      id: crypto.randomUUID(),
      type,
      ...getNewStepDefaults(type, shouldPrefillTextDefaults),
    };
  }

  const buildInitialSteps = (): FormStep[] => {
    if (initialData?.steps?.length) return initialData.steps;
    return DEFAULT_STEPS.map(s => buildStepForEditor(s.type));
  };

  const [steps, setSteps] = useState<FormStep[]>(buildInitialSteps());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [customTexts, setCustomTexts] = useState<CustomTexts>(initialCustomTexts);

  const [form, setForm] = useState<FormInput>({
    name: initialData?.name || '',
    isDraft: initialData?.isDraft ?? (mode === 'create'),
    procedureName: initialProcedureName,
    availableDays: initialData?.availableDays || '',
    regularPrice: initialData?.regularPrice || 0,
    modelPrice: initialData?.modelPrice || 0,
    feeAmount: initialData?.feeAmount || 0,
    installmentCount: initialData?.installmentCount || 0,
    installmentAmount: initialData?.installmentAmount || 0,
    procedureDuration: initialProcedureDuration,
    professionalName: initialData?.professionalName || templateData?.professionalName || '',
    instagramHandle: initialData?.instagramHandle || '',
    whatsappNumber: initialData?.whatsappNumber ? formatPhone(initialData.whatsappNumber) : '',
    beforeImage: initialData?.beforeImage || '',
    afterImage: initialData?.afterImage || '',
    photos: buildInitialPhotos(),
    singlePhoto: initialData?.singlePhoto ?? false,
    showOnlyInstallment: initialData?.showOnlyInstallment ?? false,
    headline: initialData?.headline || templateData?.headline || (shouldPrefillTextDefaults ? getDefaultHeadline(initialProcedureName) : ''),
    supportText: initialData?.supportText || templateData?.supportText || (shouldPrefillTextDefaults ? getDefaultSupportText() : ''),
    isActive: initialData?.isActive ?? true,
    whatsappMessage: initialData?.whatsappMessage || (shouldPrefillTextDefaults ? getDefaultWhatsappMessage(initialProcedureName) : ''),
    finalScreenType: initialData?.finalScreenType || 'whatsapp',
    formFields: initialData?.formFields || { name: true, whatsapp: true, email: true },
    theme: initialData?.theme || templateData?.theme || 'purple',
    pixelId: initialData?.pixelId || '',
    capiToken: initialData?.capiToken || '',
    steps: [],
    customTexts: initialCustomTexts,
  });

  const [regularPriceDisplay, setRegularPriceDisplay] = useState(formatBRL(form.regularPrice));
  const [modelPriceDisplay, setModelPriceDisplay] = useState(formatBRL(form.modelPrice));
  const [feePriceDisplay, setFeePriceDisplay] = useState(formatBRL(form.feeAmount));
  const [installmentAmountDisplay, setInstallmentAmountDisplay] = useState(formatBRL(form.installmentAmount));

  const slug = generateSlug(form.name);

  if (mode === 'create' && createBaselineRef.current === null) {
    const firstPhoto = photos[0] || { before: '', after: '' };
    createBaselineRef.current = JSON.stringify({
      ...form,
      isDraft: false,
      isActive: form.isActive,
      whatsappNumber: form.whatsappNumber.replace(/\D/g, ''),
      photos,
      beforeImage: firstPhoto.before,
      afterImage: firstPhoto.after,
      steps: ensureWorkflowLayout(steps),
      customTexts,
    });
  }

  function showSavedAutomaticallyToast() {
    setAutoSaveErrorMessage(null);
    setSavedToast(true);
    if (savedToastTimeoutRef.current) {
      clearTimeout(savedToastTimeoutRef.current);
    }
    savedToastTimeoutRef.current = setTimeout(() => {
      setSavedToast(false);
    }, 2000);
  }

  function describeAutoSaveError(status: number, rawMessage: string, isDraftRequest: boolean) {
    const normalizedMessage = rawMessage.toLowerCase();

    if (status === 401 || normalizedMessage.includes('não autenticado') || normalizedMessage.includes('nao autenticado')) {
      return 'Sua sessão não foi reconhecida. Recarregue a página e faça login novamente.';
    }

    if (normalizedMessage.includes('is_draft')) {
      return 'O banco de produção ainda não tem a coluna is_draft. Rode o SQL: ALTER TABLE forms ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;';
    }

    if (
      normalizedMessage.includes('column')
      || normalizedMessage.includes('does not exist')
      || normalizedMessage.includes('violates')
      || normalizedMessage.includes('null value')
      || normalizedMessage.includes('constraint')
    ) {
      return rawMessage;
    }

    if (status >= 500) {
      return isDraftRequest
        ? 'O servidor falhou ao criar o rascunho automático.'
        : 'O servidor falhou ao salvar as alterações automaticamente.';
    }

    return rawMessage || 'O salvamento automático falhou.';
  }

  async function readAutoSaveErrorMessage(response: Response) {
    const rawText = await response.text();

    try {
      const parsed = JSON.parse(rawText) as { error?: unknown; details?: unknown };
      const detailText = typeof parsed.details === 'string' ? parsed.details : '';
      const errorText = typeof parsed.error === 'string' ? parsed.error : '';
      return detailText || errorText || rawText;
    } catch {
      return rawText;
    }
  }

  function updateField<K extends keyof FormInput>(key: K, value: FormInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const handleDateSelect = useCallback((dates: Date[] | undefined) => {
    const sorted = (dates || []).sort((a, b) => a.getTime() - b.getTime());
    setSelectedDates(sorted);
    const formatted = sorted.map(d => format(d, 'dd/MM/yyyy', { locale: ptBR })).join(', ');
    updateField('availableDays', formatted);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMoneyInput(value: string, setter: (v: string) => void, field: 'regularPrice' | 'modelPrice' | 'feeAmount' | 'installmentAmount') {
    let digits = value.replace(/\D/g, '');
    if (!digits) {
      setter('');
      updateField(field, 0);
      return;
    }
    const numValue = parseInt(digits) / 100;
    setter(formatBRL(numValue));
    updateField(field, numValue);
  }

  function handlePhoneInput(value: string) {
    const formatted = formatPhone(value);
    updateField('whatsappNumber', formatted);
  }

  function addPhotoPair() {
    const newPhotos = [...photos, { before: '', after: '' }];
    setPhotos(newPhotos);
    updateField('photos', newPhotos);
  }

  function removePhotoPair(index: number) {
    if (photos.length <= 1) return;
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    updateField('photos', newPhotos);
  }

  function updatePhoto(index: number, type: 'before' | 'after', url: string) {
    const newPhotos = photos.map((p, i) => i === index ? { ...p, [type]: url } : p);
    setPhotos(newPhotos);
    updateField('photos', newPhotos);
  }

  async function uploadPhotoImage(index: number, type: 'before' | 'after', file: File) {
    const key = `${index}-${type}`;
    setUploadingIndex(key);

    try {
      const url = await uploadImageFile(file);
      updatePhoto(index, type, url);
    } catch {
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploadingIndex(null);
    }
  }

  async function uploadImageFile(file: File): Promise<string> {
    const fd = new globalThis.FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();

    if (!res.ok || !data.url) {
      throw new Error(data.error || 'Erro ao fazer upload');
    }

    return data.url;
  }

  async function uploadCanvasImage(file: File): Promise<string> {
    try {
      return await uploadImageFile(file);
    } catch {
      alert('Erro ao fazer upload da imagem');
      return '';
    }
  }

  async function uploadStepIcon(file: File) {
    const currentStepId = steps[currentStepIndex]?.id;
    if (!currentStepId) return;

    setUploadingStepIcon(true);
    try {
      const url = await uploadImageFile(file);
      setSteps(prev => prev.map(step => step.id === currentStepId ? { ...step, icon: url } : step));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao fazer upload do ícone');
    } finally {
      setUploadingStepIcon(false);
    }
  }

  function updateCurrentStep(updates: Partial<FormStep>) {
    setSteps(prev => prev.map((s, i) => i === currentStepIndex ? { ...s, ...updates } : s));
  }

  function buildSeededWorkflowOptions(existingOptions?: WorkflowOption[], minimum = 2): WorkflowOption[] {
    const options = [...(existingOptions || [])];

    while (options.length < minimum) {
      options.push({
        id: crypto.randomUUID(),
        label: `Opcao ${options.length + 1}`,
        description: '',
        target: 'next' as const,
      });
    }

    return options;
  }

  function syncDecisionBranches(nextSteps: FormStep[], decisionStepId: string) {
    return syncDecisionBranchSteps(nextSteps, decisionStepId, () => buildStepForEditor('livre'));
  }

  function updateCurrentWorkflowOption(optionId: string, updates: Partial<WorkflowOption>) {
    setSteps(prev => {
      const currentStep = prev[currentStepIndex];
      const updatedSteps = prev.map((step, index) => {
        if (index !== currentStepIndex) return step;
        return {
          ...step,
          workflowOptions: (step.workflowOptions || []).map(option => option.id === optionId ? { ...option, ...updates } : option),
        };
      });

      return currentStep?.id ? syncDecisionBranches(updatedSteps, currentStep.id) : updatedSteps;
    });
  }

  function addCurrentWorkflowOption() {
    setSteps(prev => {
      const currentStep = prev[currentStepIndex];
      const updatedSteps = prev.map((step, index) => {
        if (index !== currentStepIndex) return step;
        const nextCount = (step.workflowOptions?.length || 0) + 1;
        return {
          ...step,
          workflowOptions: [
            ...(step.workflowOptions || []),
            {
              id: crypto.randomUUID(),
              label: `Opcao ${nextCount}`,
              description: '',
              target: 'next' as const,
            },
          ],
        };
      });

      return currentStep?.id ? syncDecisionBranches(updatedSteps, currentStep.id) : updatedSteps;
    });
  }

  function removeCurrentWorkflowOption(optionId: string) {
    setSteps(prev => {
      const currentStep = prev[currentStepIndex];
      const updatedSteps = prev.map((step, index) => {
        if (index !== currentStepIndex) return step;
        return {
          ...step,
          workflowOptions: (step.workflowOptions || []).filter(option => option.id !== optionId),
        };
      });

      return currentStep?.id ? syncDecisionBranches(updatedSteps, currentStep.id) : updatedSteps;
    });
  }

  async function getAuthHeaders() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let token = authToken;

    if (!token) {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token ?? null;
    }

    if (!token) {
      try {
        const { data } = await supabase.auth.refreshSession();
        token = data.session?.access_token ?? null;
      } catch {
        token = null;
      }
    }

    if (!token) {
      return null;
    }

    if (token !== authToken) {
      setAuthToken(token);
    }

    headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  function buildEditorPayload(options?: { isDraft?: boolean; isActive?: boolean }) {
    const firstPhoto = photos[0] || { before: '', after: '' };
    return {
      ...form,
      isDraft: options?.isDraft ?? isDraftDocument,
      isActive: options?.isActive ?? form.isActive,
      whatsappNumber: form.whatsappNumber.replace(/\D/g, ''),
      photos,
      beforeImage: firstPhoto.before,
      afterImage: firstPhoto.after,
      steps,
      customTexts,
    };
  }

  function buildEditorSnapshot(options?: { isDraft?: boolean; isActive?: boolean }) {
    return JSON.stringify(buildEditorPayload(options));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const headers = await getAuthHeaders();
      if (!headers) {
        alert('Sua sessao ainda nao foi carregada. Aguarde um instante e tente novamente.');
        return;
      }
      const submitData = buildEditorPayload({
        isDraft: false,
        isActive: form.isActive,
      });
      const validation = formInputSchema.safeParse(submitData);
      if (!validation.success) {
        const errMsg = validation.error.flatten().formErrors[0]
          || Object.values(validation.error.flatten().fieldErrors).flat()[0]
          || 'Preencha os campos obrigatorios antes de publicar o formulario';
        alert(errMsg);
        return;
      }
      const targetId = persistedFormIdRef.current || persistedFormId || initialData?.id || null;
      const url = targetId ? `/api/forms/${targetId}` : '/api/forms';
      const method = targetId ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: JSON.stringify(submitData) });

      if (res.ok) {
        lastAutoSavedSnapshotRef.current = buildEditorSnapshot({
          isDraft: false,
          isActive: form.isActive,
        });
        setIsDraftDocument(false);
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        const errMsg = typeof data.error === 'string'
          ? data.error
          : data.error?.formErrors?.[0] || JSON.stringify(data.error) || 'Erro ao salvar formulário';
        alert(errMsg);
      }
    } catch {
      alert('Erro ao salvar formulário');
    } finally {
      setSaving(false);
    }
  }

  // Auto-save / draft persistence — ref stores latest save fn to avoid stale closures
  saveRef.current = async () => {
    if (saving || !authReady) return;

    try {
      const headers = await getAuthHeaders();
      if (!headers) {
        setAutoSaveErrorMessage('Sua sessão não foi carregada. Recarregue a página e tente novamente.');
        return;
      }
      const targetId = persistedFormIdRef.current || persistedFormId || initialData?.id || null;

      if (!targetId) {
        if (mode !== 'create' || createBaselineRef.current === null || draftCreationInFlightRef.current) return;

        const draftChangeSnapshot = buildEditorSnapshot({ isDraft: false, isActive: form.isActive });
        if (draftChangeSnapshot === createBaselineRef.current) return;

        const draftRequestSnapshot = buildEditorSnapshot({ isDraft: true, isActive: false });
        if (draftRequestSnapshot === lastAutoSavedSnapshotRef.current) return;

        draftCreationInFlightRef.current = true;
        const res = await fetch('/api/forms', {
          method: 'POST',
          headers,
          keepalive: true,
          body: JSON.stringify(buildEditorPayload({ isDraft: true, isActive: false })),
        });

        if (res.ok) {
          const data = await res.json();
          persistedFormIdRef.current = data.id;
          setPersistedFormId(data.id);
          setIsDraftDocument(true);
          lastAutoSavedSnapshotRef.current = draftRequestSnapshot;
          showSavedAutomaticallyToast();
        } else {
          const rawMessage = await readAutoSaveErrorMessage(res);
          setAutoSaveErrorMessage(describeAutoSaveError(res.status, rawMessage, true));
          console.error('Falha ao criar rascunho automaticamente', rawMessage);
        }
        return;
      }

      const updateSnapshot = buildEditorSnapshot({
        isDraft: isDraftDocument,
        isActive: isDraftDocument ? false : form.isActive,
      });
      if (updateSnapshot === lastAutoSavedSnapshotRef.current) return;

      const res = await fetch(`/api/forms/${targetId}`, {
        method: 'PUT',
        headers,
        keepalive: true,
        body: JSON.stringify(buildEditorPayload({
          isDraft: isDraftDocument,
          isActive: isDraftDocument ? false : form.isActive,
        })),
      });
      if (res.ok) {
        lastAutoSavedSnapshotRef.current = updateSnapshot;
        showSavedAutomaticallyToast();
      } else {
        const rawMessage = await readAutoSaveErrorMessage(res);
        setAutoSaveErrorMessage(describeAutoSaveError(res.status, rawMessage, false));
        console.error('Falha ao salvar formulario automaticamente', rawMessage);
      }
    } catch (error) {
      setAutoSaveErrorMessage('Erro inesperado ao salvar automaticamente. Tente novamente em alguns segundos.');
      console.error('Erro no autosave do formulario', error);
    }
    finally {
      draftCreationInFlightRef.current = false;
    }
  };

  useEffect(() => {
    let active = true;

    async function hydrateAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        setAuthToken(session?.access_token ?? null);
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    }

    hydrateAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthToken(session?.access_token ?? null);
      setAuthReady(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
      if (savedToastTimeoutRef.current) {
        clearTimeout(savedToastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mode !== 'edit') return;
    if (lastAutoSavedSnapshotRef.current !== null) return;

    lastAutoSavedSnapshotRef.current = buildEditorSnapshot({
      isDraft: initialData?.isDraft ?? false,
      isActive: initialData?.isDraft ? false : (initialData?.isActive ?? form.isActive),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData?.id]);

  useEffect(() => {
    persistedFormIdRef.current = persistedFormId || initialData?.id || null;
  }, [persistedFormId, initialData?.id]);

  useEffect(() => {
    if (mode !== 'edit' && !(mode === 'create' && createBaselineRef.current !== null)) return;
    if (!authReady) return;
    const timer = setTimeout(() => saveRef.current?.(), 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, authToken, mode, form, photos, steps, customTexts, persistedFormId, isDraftDocument]);

  useEffect(() => {
    if (!authReady) return;

    function flushPendingSave() {
      void saveRef.current?.();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        flushPendingSave();
      }
    }

    window.addEventListener('pagehide', flushPendingSave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', flushPendingSave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authReady]);

  useEffect(() => {
    setInsertPanelOpen(false);
    setStepIconPickerOpen(false);
  }, [currentStepIndex, stepPickerOpen, configModalOpen]);

  useEffect(() => {
    if (!steps.some(step => !step.workflowPosition)) return;
    setSteps(prev => ensureWorkflowLayout(prev));
  }, [steps]);

  useEffect(() => {
    if (editorMode === 'step') return;
    setInsertPanelOpen(false);
  }, [editorMode]);

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900";
  const stepInputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  const currentStep = steps[currentStepIndex];
  const currentStepIsDecision = !!currentStep && isDecisionStep(currentStep);
  const isStepEditorVisible = !!currentStep && (editorMode === 'step' || workflowStepModalOpen);
  const showElementsBuilder = isStepEditorVisible && !!currentStep && (currentStep.type === 'livre' || insertPanelOpen);
  const currentTheme = getTheme(form.theme);
  const currentStepSupportsIcon = !!currentStep && canCustomizeStepIcon(currentStep.type);
  const activeStepIcon = currentStepSupportsIcon ? (currentStep.icon?.trim() || getDefaultStepIconId(currentStep.type)) : '';
  const hasUploadedStepIcon = currentStepSupportsIcon && isUploadedStepIcon(currentStep?.icon);
  const hasLegacyCustomIcon = currentStepSupportsIcon && !!currentStep?.icon && !isPresetStepIcon(currentStep.icon) && !hasUploadedStepIcon;
  const showSidePreview = editorMode !== 'workflow';

  function toggleWorkflowMode() {
    setEditorMode(prev => prev === 'workflow' ? 'step' : 'workflow');
  }

  function openInsertBuilder() {
    setInsertPanelOpen(true);
    setPendingBuilderScroll(true);
  }

  function openWorkflowStepModal(index: number) {
    setCurrentStepIndex(index);
    setWorkflowStepModalOpen(true);
    setInsertPanelOpen(false);
    setStepIconPickerOpen(false);
  }

  function closeWorkflowStepModal() {
    setWorkflowStepModalOpen(false);
    setInsertPanelOpen(false);
    setStepIconPickerOpen(false);
  }

  function handleCanvasShortcut(action: CanvasBuilderShortcut) {
    if (action !== 'multiperguntas' || !currentStep || currentStepIndex >= steps.length) return;

    const defaultQuestion = currentStep.question?.trim() || 'O que mais te incomoda?';

    if (currentStep.type === 'pergunta') {
      setSteps(prev => syncDecisionBranches(prev.map((step, index) => {
        if (index !== currentStepIndex) return step;
        return {
          ...step,
          question: defaultQuestion,
          workflowOptions: buildSeededWorkflowOptions(step.workflowOptions, 2),
        };
      }), currentStep.id));
      setInsertPanelOpen(false);
      return;
    }

    const insertIndex = currentStepIndex + 1;
    const newDecisionStep: FormStep = {
      ...buildStepForEditor('pergunta'),
      question: defaultQuestion,
      workflowOptions: buildSeededWorkflowOptions([], 2),
    };

    setSteps(prev => {
      const next = [...prev];
      next.splice(insertIndex, 0, newDecisionStep);
      return syncDecisionBranches(next, newDecisionStep.id);
    });
    setCurrentStepIndex(insertIndex);
    setInsertPanelOpen(false);
  }

  useEffect(() => {
    if (!pendingBuilderScroll || !showElementsBuilder) return;

    const frameId = window.requestAnimationFrame(() => {
      elementsBuilderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingBuilderScroll(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [pendingBuilderScroll, showElementsBuilder, currentStepIndex]);

  return (
    <div className="w-full">
    <div className={showSidePreview ? 'xl:grid xl:grid-cols-[1fr_500px] xl:gap-6 xl:items-start' : ''}>
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">

        {/* ── Form name + Anterior/Próximo ── */}
        <div className="mb-2 flex items-center justify-between gap-4 px-1">
          <div className="min-w-0 flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-gray-900">{form.name || 'Novo formulário'}</p>
            {editorMode === 'workflow' && (
              <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                Modo workflow
              </span>
            )}
            {savedToast && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Salvo automaticamente
              </span>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentStepIndex(i => Math.max(0, i - 1))}
              disabled={currentStepIndex === 0}
              className="cursor-pointer rounded-xl px-3 py-1.5 text-sm font-semibold text-[#6B1C3A] transition-all hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={() => setCurrentStepIndex(i => Math.min(steps.length, i + 1))}
              disabled={currentStepIndex === steps.length}
              className="cursor-pointer rounded-xl px-3 py-1.5 text-sm font-semibold text-[#6B1C3A] transition-all hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
            >
              Próximo →
            </button>
          </div>
        </div>

        {/* ── Step tabs card ── */}
        {autoSaveErrorMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm">
            <p className="font-semibold">Falha no salvamento automático</p>
            <p className="mt-1 leading-relaxed">{autoSaveErrorMessage}</p>
          </div>
        )}

        <div
          className={editorMode === 'workflow'
            ? 'relative left-1/2 w-[calc(100vw-16px)] max-w-none -translate-x-1/2 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col'
            : 'rounded-2xl border border-gray-200 bg-white shadow-sm'}
          style={editorMode === 'workflow' ? { maxHeight: 'calc(100dvh - 116px)' } : undefined}
        >

          {/* Navigation bar + dots (from FormStepBuilder) */}
          <FormStepBuilder
            steps={steps}
            onChange={setSteps}
            currentIndex={currentStepIndex}
            onCurrentIndexChange={setCurrentStepIndex}
            createStep={buildStepForEditor}
            hasCelebration
            onConfigOpen={() => setConfigModalOpen(true)}
            onPickerChange={setStepPickerOpen}
            onInsertButtonClick={openInsertBuilder}
            onWorkflowToggle={toggleWorkflowMode}
            workflowActive={editorMode === 'workflow'}
            insertButtonActive={insertPanelOpen}
            showInsertButton={editorMode === 'step' && currentStepIndex < steps.length && currentStep?.type !== 'livre'}
          />

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Step content area */}
          {stepPickerOpen && (
            <div className="flex min-h-[240px] items-center justify-center p-6 text-sm text-gray-300">
              Escolha o tipo de etapa acima
            </div>
          )}
          {!stepPickerOpen && editorMode === 'workflow' && (
            <div className="h-full w-full overflow-hidden flex-1 min-h-0 bg-[#fcfbfd]">
              <WorkflowEditor
                steps={steps}
                onChange={setSteps}
                currentStepIndex={currentStepIndex}
                onCurrentStepIndexChange={setCurrentStepIndex}
                onStepEditRequest={openWorkflowStepModal}
                createStep={buildStepForEditor}
                previewForm={{ ...form, customTexts, slug }}
                photos={photos}
              />
            </div>
          )}
          {!stepPickerOpen && currentStep && (editorMode === 'step' || workflowStepModalOpen) && (
            <div
              className={workflowStepModalOpen ? 'fixed inset-0 z-[70] overflow-y-auto bg-black/45 p-4 backdrop-blur-sm' : ''}
              onClick={workflowStepModalOpen ? (event => {
                if (event.target === event.currentTarget) closeWorkflowStepModal();
              }) : undefined}
            >
              <div className={workflowStepModalOpen ? 'mx-auto flex w-full max-w-[min(96vw,1440px)] flex-col rounded-[28px] bg-white shadow-2xl' : 'contents'}>
                {workflowStepModalOpen && (
                  <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Editar tela</p>
                      <h3 className="truncate text-lg font-semibold text-gray-900">{currentStep.label || `Tela ${currentStepIndex + 1}`}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {savedToast && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Salvo automaticamente
                        </span>
                      )}
                      {currentStep.type !== 'livre' && (
                        <button
                          type="button"
                          onClick={openInsertBuilder}
                          className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200"
                        >
                          Inserir Botao
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={closeWorkflowStepModal}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                )}
                <div className={workflowStepModalOpen ? 'grid xl:grid-cols-[minmax(0,1fr)_420px]' : 'p-6 space-y-5'}>
                  <div className={workflowStepModalOpen ? 'space-y-5 p-6' : 'p-6 space-y-5'}>

              {currentStepSupportsIcon && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                      style={{ background: currentTheme.iconBg }}
                    >
                      <StepIconGlyph
                        value={activeStepIcon}
                        type={currentStep.type}
                        svgClassName="w-6 h-6 text-white"
                        emojiClassName="text-2xl leading-none"
                        imgClassName="w-7 h-7 object-contain"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-gray-900">Icone da etapa</p>
                      <p className="text-xs text-gray-400">Escolha um icone comum ou envie um icone proprio em imagem.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStepIconPickerOpen(prev => !prev)}
                    className="w-full flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-[#6B1C3A]">
                        <StepIconGlyph
                          value={activeStepIcon}
                          type={currentStep.type}
                          svgClassName="w-5 h-5 text-[#6B1C3A]"
                          emojiClassName="text-xl leading-none"
                          imgClassName="w-6 h-6 object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Escolher ícone</p>
                        <p className="text-xs text-gray-400">
                          {hasUploadedStepIcon ? 'Imagem personalizada selecionada.' : 'Clique para ver os ícones disponíveis.'}
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${stepIconPickerOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
                    </svg>
                  </button>

                  {stepIconPickerOpen && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-2">
                        {STEP_ICON_OPTIONS.map(option => {
                          const isActive = activeStepIcon === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => updateCurrentStep({ icon: option.id })}
                              className={`rounded-xl border p-2 transition-all cursor-pointer ${
                                isActive
                                  ? 'border-[#6B1C3A] bg-[#6B1C3A]/8 shadow-sm'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                              title={option.label}
                            >
                              <div className="flex items-center justify-center text-[#6B1C3A]">
                                {option.render('w-5 h-5')}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => stepIconInputRef.current?.click()}
                          className="px-4 py-3 text-xs font-semibold text-[#6B1C3A] bg-white border border-[#6B1C3A]/20 rounded-xl hover:bg-[#6B1C3A]/5 transition-all cursor-pointer"
                        >
                          {uploadingStepIcon ? 'Enviando ícone...' : hasUploadedStepIcon ? 'Trocar ícone' : 'Enviar ícone'}
                        </button>
                        <input
                          ref={stepIconInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) uploadStepIcon(file);
                            e.currentTarget.value = '';
                          }}
                        />
                        {hasUploadedStepIcon && (
                          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                            <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center">
                              <StepIconGlyph
                                value={currentStep.icon}
                                type={currentStep.type}
                                svgClassName="w-5 h-5 text-white"
                                emojiClassName="text-xl leading-none"
                                imgClassName="w-6 h-6 object-contain"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-emerald-700">ícone enviado</p>
                              <p className="text-[11px] text-emerald-600">PNG, JPG, WebP ou SVG.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {hasLegacyCustomIcon && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                      Este icone foi salvo no formato antigo. Escolha um da lista ou envie uma imagem para substituir.
                    </p>
                  )}
                </div>
              )}

              {/* ── FOTO ── */}
              {currentStep.type === 'foto' && (
                <>
                  <div>
                    <label className={labelClass}>
                      Headline da 1ª tela
                      <span className="ml-2 text-xs text-gray-400 font-normal">
                        Pergunta principal · selecione texto para colorir
                      </span>
                    </label>
                    <RichTextField
                      value={form.headline}
                      onChange={v => updateField('headline', v)}
                      placeholder="Ex: Suas orelhas te incomodam?"
                      singleLine
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                    />
                  </div>

                  {/* Fotos */}
                  <div>
                    {/* Checkbox Apenas 1 foto */}
                    <label className="flex items-center gap-2 mb-3 cursor-pointer select-none w-fit">
                      <input
                        type="checkbox"
                        checked={form.singlePhoto}
                        onChange={e => updateField('singlePhoto', e.target.checked)}
                        className="w-4 h-4 rounded accent-[#6B1C3A] cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700">Apenas 1 foto</span>
                    </label>

                    <div className="flex items-center justify-between mb-2">
                      <label className={labelClass + ' mb-0'}>{form.singlePhoto ? 'Foto' : 'Fotos Antes e Depois'}</label>
                      <button type="button" onClick={addPhotoPair}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#6B1C3A]/10 text-[#6B1C3A] rounded-lg text-xs font-medium hover:bg-[#6B1C3A]/20 transition-colors cursor-pointer">
                        + Foto{form.singlePhoto ? '' : 's'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {(form.singlePhoto ? ['before'] as const : ['before', 'after'] as const).map(type => {
                            const key = `${index}-${type}`;
                            return (
                              <div key={type} className="flex-1 relative">
                                <button
                                  type="button"
                                  onClick={() => photoRefs.current[key]?.click()}
                                  className={`w-full flex items-center gap-2 px-3 py-2 border rounded-lg text-xs transition-colors cursor-pointer ${
                                    photo[type]
                                      ? 'border-[#6B1C3A]/40 bg-[#6B1C3A]/5 text-[#6B1C3A]'
                                      : 'border-dashed border-gray-300 text-gray-400 hover:border-[#6B1C3A]/40 hover:text-[#6B1C3A]'
                                  }`}
                                >
                                  {uploadingIndex === key ? (
                                    <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin flex-shrink-0" />
                                  ) : (
                                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                  <span className="truncate">
                                    {photo[type]
                                      ? `✓ ${form.singlePhoto ? 'Foto' : (type === 'before' ? 'Antes' : 'Depois')}`
                                      : (form.singlePhoto ? 'Foto' : (type === 'before' ? 'Foto Antes' : 'Foto Depois'))}
                                  </span>
                                </button>
                                <input
                                  ref={el => { photoRefs.current[key] = el; }}
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadPhotoImage(index, type, file);
                                  }}
                                />
                              </div>
                            );
                          })}
                          {photos.length > 1 && (
                            <button type="button" onClick={() => removePhotoPair(index)}
                              className="p-1.5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Texto de apoio
                      <span className="ml-2 text-xs text-gray-400 font-normal">
                        Abaixo das fotos · selecione texto para colorir
                      </span>
                    </label>
                    <RichTextField
                      value={form.supportText}
                      onChange={v => updateField('supportText', v)}
                      placeholder="Ex: Corrija orelha de abano sem cirurgia, sem cortes e sem cicatriz."
                      singleLine
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                    />
                  </div>

                  {/* Botão Sim / Não */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Botão Sim</label>
                      <input
                        type="text"
                        value={currentStep.yesText || ''}
                        onChange={e => updateCurrentStep({ yesText: e.target.value })}
                        placeholder="Quero corrigir!"
                        className={stepInputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Botão Não</label>
                      <input
                        type="text"
                        value={currentStep.noText || ''}
                        onChange={e => updateCurrentStep({ noText: e.target.value })}
                        placeholder="Não"
                        className={stepInputClass}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── DISPONIBILIDADE ── */}
              {currentStep.type === 'disponibilidade' && (
                <>
                  <div>
                    <label className={labelClass}>Pergunta principal <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                    <RichTextField
                      value={customTexts.availabilityQuestion || ''}
                      onChange={v => setCustomTexts(prev => ({ ...prev, availabilityQuestion: v }))}
                      placeholder="Você teria disponibilidade em algum desses dias?"
                      singleLine
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Texto da duração <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                    <RichTextField
                      value={customTexts.durationNote || ''}
                      onChange={v => setCustomTexts(prev => ({ ...prev, durationNote: v }))}
                      placeholder={`O procedimento dura cerca de ${form.procedureDuration || '2h'}.`}
                      singleLine
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Dias disponíveis</label>
                    <div onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl cursor-pointer min-h-[48px] flex items-center gap-2 flex-wrap">
                      {selectedDates.length > 0 ? (
                        selectedDates.map((date, i) => (
                          <span key={i} className="inline-flex items-center bg-[#6B1C3A]/10 text-[#6B1C3A] text-sm font-medium px-2.5 py-1 rounded-lg">
                            {format(date, 'dd/MM/yyyy')}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">Clique para selecionar as datas</span>
                      )}
                    </div>
                    {showCalendar && (
                      <div className="mt-2 border border-gray-200 rounded-xl p-4 bg-white shadow-lg">
                        <DayPicker mode="multiple" selected={selectedDates} onSelect={handleDateSelect} locale={ptBR}
                          disabled={{ before: new Date() }}
                          classNames={{
                            today: 'font-bold text-[#6B1C3A]',
                            selected: 'bg-[#6B1C3A] text-white rounded-full',
                            chevron: 'fill-[#6B1C3A]',
                          }} />
                        <div className="flex justify-end mt-2">
                          <button type="button" onClick={() => setShowCalendar(false)}
                            className="px-4 py-2 bg-[#6B1C3A] text-white rounded-lg text-sm font-medium hover:bg-[#5A1731] transition-colors">
                            Confirmar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Botão Sim</label>
                      <input
                        type="text"
                        value={currentStep.yesText || ''}
                        onChange={e => updateCurrentStep({ yesText: e.target.value })}
                        placeholder="Sim, tenho!"
                        className={stepInputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Botão Não</label>
                      <input
                        type="text"
                        value={currentStep.noText || ''}
                        onChange={e => updateCurrentStep({ noText: e.target.value })}
                        placeholder="Não"
                        className={stepInputClass}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── PREÇO ── */}
              {currentStep.type === 'preco' && (
                <>
                  <div>
                    <label className={labelClass}>Nome do Procedimento <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                    <RichTextField
                      value={form.procedureName}
                      onChange={v => updateField('procedureName', v)}
                      placeholder="Ex: Preenchimento Labial"
                      singleLine
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Contexto (1ª linha) <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                    <RichTextField
                      value={customTexts.pricingContext || ''}
                      onChange={v => setCustomTexts(prev => ({ ...prev, pricingContext: v }))}
                      placeholder={`Sabendo que um paciente de ${stripHtml(form.procedureName) || 'Procedimento'} pagaria em média [preço].`}
                      singleLine
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Pergunta principal <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                    <RichTextField
                      value={customTexts.pricingQuestion || ''}
                      onChange={v => setCustomTexts(prev => ({ ...prev, pricingQuestion: v }))}
                      placeholder="E por ser PACIENTE MODELO ganharia uma condição especial..."
                      singleLine
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Rótulo do card <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                    <RichTextField
                      value={customTexts.pricingLabel || ''}
                      onChange={v => setCustomTexts(prev => ({ ...prev, pricingLabel: v }))}
                      placeholder="Valor especial paciente modelo"
                      singleLine
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Valor Normal (R$)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={regularPriceDisplay}
                          onChange={e => handleMoneyInput(e.target.value, setRegularPriceDisplay, 'regularPrice')}
                          placeholder="0,00"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Valor Paciente Modelo (R$)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={modelPriceDisplay}
                          onChange={e => handleMoneyInput(e.target.value, setModelPriceDisplay, 'modelPrice')}
                          placeholder="0,00"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Exibir somente parcelado */}
                  <label className="flex items-center justify-between gap-3 py-2 cursor-pointer select-none">
                    <span className="text-sm font-medium text-gray-700">Exibir somente valor parcelado</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.showOnlyInstallment}
                      onClick={() => updateField('showOnlyInstallment', !form.showOnlyInstallment)}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.showOnlyInstallment ? 'bg-[#6B1C3A]' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.showOnlyInstallment ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </label>

                  {/* Parcelamento */}
                  <div>
                    <label className={labelClass}>
                      Parcelamento
                      <span className="ml-2 text-xs text-gray-400 font-normal">Deixe em 0 para não exibir parcelamento</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Número de parcelas</label>
                        <input
                          type="number"
                          min="0"
                          max="48"
                          value={form.installmentCount || ''}
                          onChange={e => updateField('installmentCount', parseInt(e.target.value) || 0)}
                          placeholder="Ex: 12"
                          className={stepInputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Valor da parcela</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={installmentAmountDisplay}
                            onChange={e => handleMoneyInput(e.target.value, setInstallmentAmountDisplay, 'installmentAmount')}
                            placeholder="0,00"
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Botão Sim</label>
                      <input
                        type="text"
                        value={currentStep.yesText || ''}
                        onChange={e => updateCurrentStep({ yesText: e.target.value })}
                        placeholder="Sim!"
                        className={stepInputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Botão Não</label>
                      <input
                        type="text"
                        value={currentStep.noText || ''}
                        onChange={e => updateCurrentStep({ noText: e.target.value })}
                        placeholder="Não"
                        className={stepInputClass}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── TAXA ── */}
              {currentStep.type === 'taxa' && (
                <>
                  <div>
                    <label className={labelClass}>Texto antes do valor <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                    <RichTextField
                      value={customTexts.feeTextPrefix || ''}
                      onChange={v => setCustomTexts(prev => ({ ...prev, feeTextPrefix: v }))}
                      placeholder="Para reservar seu horário na agenda, solicitamos um valor simbólico de"
                      singleLine
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Texto secundário <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                    <RichTextField
                      value={customTexts.feeBenefitText || ''}
                      onChange={v => setCustomTexts(prev => ({ ...prev, feeBenefitText: v }))}
                      placeholder="Mas fique tranquilo(a)! Esse valor será abatido do valor do procedimento."
                      singleLine
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Badge "Abatido"</label>
                      <RichTextField
                        value={customTexts.feeDeductedLabel || ''}
                        onChange={v => setCustomTexts(prev => ({ ...prev, feeDeductedLabel: v }))}
                        placeholder="Valor abatido"
                        singleLine
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Badge "Seguro"</label>
                      <RichTextField
                        value={customTexts.feeSafeLabel || ''}
                        onChange={v => setCustomTexts(prev => ({ ...prev, feeSafeLabel: v }))}
                        placeholder="Seguro"
                        singleLine
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Valor da Taxa (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={feePriceDisplay}
                        onChange={e => handleMoneyInput(e.target.value, setFeePriceDisplay, 'feeAmount')}
                        placeholder="0,00"
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Botão Sim</label>
                      <input
                        type="text"
                        value={currentStep.yesText || ''}
                        onChange={e => updateCurrentStep({ yesText: e.target.value })}
                        placeholder="Sim, concordo!"
                        className={stepInputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Botão Não</label>
                      <input
                        type="text"
                        value={currentStep.noText || ''}
                        onChange={e => updateCurrentStep({ noText: e.target.value })}
                        placeholder="Não"
                        className={stepInputClass}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── PERGUNTA ── */}
              {currentStep.type === 'pergunta' && (
                <>
                  <div>
                    <label className={labelClass}>Pergunta <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                    <RichTextField
                      value={currentStep.question || ''}
                      onChange={v => updateCurrentStep({ question: v })}
                      placeholder="Ex: Você está disposto a fazer uma sessão de fotos para o nosso portfólio?"
                      singleLine
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                    />
                  </div>

                  {currentStepIsDecision ? (
                    <div className="space-y-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                      <div className="sticky top-0 z-10 -mx-4 border-b border-violet-100 bg-violet-50/95 px-4 pb-4 pt-1 backdrop-blur">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-violet-900">Multiperguntas ativo</p>
                            <p className="mt-1 text-xs leading-relaxed text-violet-700">
                              Cada resposta vira um card no formulário e pode apontar para uma tela diferente no workflow.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={addCurrentWorkflowOption}
                              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-100"
                            >
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-sm leading-none text-violet-700">+</span>
                              Adicionar resposta
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setWorkflowStepModalOpen(false);
                                setEditorMode('workflow');
                              }}
                              className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100"
                            >
                              Abrir Workflow
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pb-2">
                        {(currentStep.workflowOptions || []).map((option, index) => (
                          <div key={option.id} className="rounded-2xl border border-violet-100 bg-white p-3">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-500">Resposta {index + 1}</p>
                              <button
                                type="button"
                                onClick={() => removeCurrentWorkflowOption(option.id)}
                                className="text-xs font-semibold text-rose-500 transition-colors hover:text-rose-600"
                              >
                                Remover
                              </button>
                            </div>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={option.label}
                                onChange={event => updateCurrentWorkflowOption(option.id, { label: event.target.value })}
                                placeholder="Ex: A ponta"
                                className={stepInputClass}
                              />
                              <input
                                type="text"
                                value={option.description || ''}
                                onChange={event => updateCurrentWorkflowOption(option.id, { description: event.target.value })}
                                placeholder="Texto opcional do card"
                                className={stepInputClass}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Botão Sim</label>
                        <input
                          type="text"
                          value={currentStep.yesText || ''}
                          onChange={e => updateCurrentStep({ yesText: e.target.value })}
                          placeholder="Sim, topo!"
                          className={stepInputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Botão Não</label>
                        <input
                          type="text"
                          value={currentStep.noText || ''}
                          onChange={e => updateCurrentStep({ noText: e.target.value })}
                          placeholder="Não, obrigado"
                          className={stepInputClass}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── LIVRE ── */}
              {currentStep.type === 'livre' && (
                <div>
                  <label className={labelClass}>Nome da tela</label>
                  <input
                    type="text"
                    value={currentStep.label || ''}
                    onChange={e => updateCurrentStep({ label: e.target.value })}
                    placeholder="Tela Livre"
                    className={stepInputClass}
                  />
                </div>
              )}

              {showElementsBuilder && (
                <div ref={elementsBuilderRef} className="border-t border-gray-100 pt-5">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {currentStep.type === 'livre' ? 'Conteúdo da tela' : 'Blocos extras desta tela'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {currentStep.type === 'livre'
                        ? 'Arraste os elementos para montar a tela do zero.'
                        : 'Adicione título, texto, imagem, vídeo e outros blocos abaixo do conteúdo padrão desta etapa.'}
                    </p>
                  </div>

                  <CanvasBuilder
                    elements={currentStep.elements || []}
                    onChange={elements => updateCurrentStep({ elements })}
                    onImageUpload={uploadCanvasImage}
                    onShortcutAction={handleCanvasShortcut}
                  />
                </div>
              )}

                  </div>
                  {workflowStepModalOpen && (
                    <div className="hidden border-l border-gray-100 bg-gray-50/50 p-4 xl:block">
                      <div className="sticky top-4">
                        <FormPreviewPanel
                          form={{ ...form, customTexts, slug }}
                          photos={photos}
                          steps={steps}
                          currentIndex={currentStepIndex}
                          onCurrentIndexChange={setCurrentStepIndex}
                          sticky={false}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Aba Celebração ── */}
          {!stepPickerOpen && currentStepIndex === steps.length && (
            <div className="space-y-5 p-6">
              <div>
                <label className={labelClass}>Título <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                <RichTextField
                  value={customTexts.celebrationTitle || ''}
                  onChange={v => setCustomTexts(prev => ({ ...prev, celebrationTitle: v }))}
                  placeholder="Parabéns!"
                  singleLine
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                />
              </div>

              <div>
                <label className={labelClass}>Subtítulo <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                <RichTextField
                  value={customTexts.celebrationSubtitle || ''}
                  onChange={v => setCustomTexts(prev => ({ ...prev, celebrationSubtitle: v }))}
                  placeholder="Você foi qualificada para ser nossa paciente modelo!"
                  singleLine
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                />
              </div>

              <div>
                <label className={labelClass}>Mensagem <span className="text-xs text-gray-400 font-normal">· selecione texto para colorir</span></label>
                <RichTextField
                  value={customTexts.celebrationMessage || ''}
                  onChange={v => setCustomTexts(prev => ({ ...prev, celebrationMessage: v }))}
                  placeholder="É só chamar a gente no WhatsApp e aguardar o retorno de uma das nossas consultoras"
                  singleLine
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                />
              </div>
            </div>
          )}

        </div>

        {/* ── Step cards list ── */}
        {editorMode === 'step' && (
          <StepCardsList
            steps={steps}
            onChange={setSteps}
            currentIndex={currentStepIndex}
            onCurrentIndexChange={setCurrentStepIndex}
            hasCelebration
          />
        )}

        {/* ── Config Modal ── */}
        {configModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setConfigModalOpen(false); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <span className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações gerais
                </span>
                <button type="button" onClick={() => setConfigModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-6 space-y-6">

                {/* Nome do formulário */}
                <div>
                  <label className={labelClass}>Nome do Formulário</label>
                  <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)}
                    placeholder="Ex: Botox Março 2026" className={inputClass} required />
                </div>

                {/* Nome do procedimento */}
                <div>
                  <label className={labelClass}>
                    Nome do Procedimento
                    <span className="ml-2 text-xs text-gray-400 font-normal">Aparece nas telas de foto e preço · selecione texto para colorir</span>
                  </label>
                  <RichTextField
                    value={form.procedureName}
                    onChange={v => updateField('procedureName', v)}
                    placeholder="Ex: Preenchimento Labial"
                    singleLine
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 cursor-text"
                  />
                </div>

                {/* Profissional */}
                <div>
                  <label className={labelClass}>Nome da Profissional</label>
                  <input type="text" value={form.professionalName} onChange={e => updateField('professionalName', e.target.value)}
                    placeholder="Ex: Dra. Maria Silva" className={inputClass} required />
                </div>

                {/* Instagram e WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Instagram</label>
                    <input type="text" value={form.instagramHandle} onChange={e => updateField('instagramHandle', e.target.value)}
                      placeholder="@dra.mariasilva" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>WhatsApp</label>
                    <input type="text" inputMode="numeric" value={form.whatsappNumber}
                      onChange={e => handlePhoneInput(e.target.value)}
                      placeholder="(91) 9 8382-8928" className={inputClass} required />
                  </div>
                </div>

                {/* Tema de Cores */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Tema de Cores</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.values(THEMES).map((theme) => (
                      <button key={theme.id} type="button" onClick={() => updateField('theme', theme.id)} title={theme.name}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          form.theme === theme.id ? 'border-gray-800 shadow-md scale-105' : 'border-gray-200 hover:border-gray-400'
                        }`}>
                        <div className="w-10 h-10 rounded-full shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${theme.preview[0]}, ${theme.preview[1]})` }} />
                        <span className="text-xs text-gray-600 font-medium text-center leading-tight">{theme.name}</span>
                        {form.theme === theme.id && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tela Final */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Configuração da Tela Final</h3>
                  <div className="mb-6">
                    <label className={labelClass}>
                      Quando o paciente disser Sim em tudo, o que acontece?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => updateField('finalScreenType', 'whatsapp')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          form.finalScreenType === 'whatsapp' ? 'border-[#6B1C3A] bg-[#6B1C3A]/5' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          <span className="font-semibold text-sm text-gray-900">Botão do WhatsApp</span>
                        </div>
                        <p className="text-xs text-gray-500">Redireciona para o WhatsApp</p>
                      </button>
                      <button type="button" onClick={() => updateField('finalScreenType', 'form')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          form.finalScreenType === 'form' ? 'border-[#6B1C3A] bg-[#6B1C3A]/5' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-5 h-5 text-[#6B1C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-semibold text-sm text-gray-900">Formulário de Dados</span>
                        </div>
                        <p className="text-xs text-gray-500">Preenche dados e envia pro painel</p>
                      </button>
                    </div>
                  </div>

                  {form.finalScreenType === 'whatsapp' && (
                    <div>
                      <label className={labelClass}>Mensagem do WhatsApp</label>
                      <textarea value={form.whatsappMessage} onChange={e => updateField('whatsappMessage', e.target.value)}
                        placeholder="Ex: Olá! Tenho interesse em ser paciente modelo para o procedimento!"
                        rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900 resize-none" />
                      <p className="text-xs text-gray-400 mt-1">Deixe vazio para usar a mensagem padrão</p>
                    </div>
                  )}

                  {form.finalScreenType === 'form' && (
                    <div>
                      <label className={labelClass}>Campos do formulário de dados</label>
                      <div className="space-y-3">
                        {(['name', 'whatsapp', 'email'] as const).map(field => (
                          <div key={field} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {field === 'name' ? 'Nome' : field === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
                            </span>
                            <button type="button"
                              onClick={() => updateField('formFields', { ...form.formFields, [field]: !form.formFields[field] })}
                              className={`relative w-11 h-6 rounded-full transition-colors ${form.formFields[field] ? 'bg-[#6B1C3A]' : 'bg-gray-300'}`}>
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.formFields[field] ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Meta Pixel */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">Meta Ads (Facebook & Instagram)</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Opcional</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Rastreamento exclusivo para este formulário</p>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>ID do Pixel</label>
                      <p className="text-xs text-gray-400 mb-2">Encontre em Gerenciador de Eventos → Configurações.</p>
                      <input type="text" value={form.pixelId} onChange={e => updateField('pixelId', e.target.value)}
                        placeholder="Ex: 1234567890123456" className={inputClass} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className={labelClass}>Token da API de Conversões (CAPI)</label>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Server-side</span>
                      </div>
                      <input type="password" value={form.capiToken} onChange={e => updateField('capiToken', e.target.value)}
                        placeholder="EAAMxxxxxxxx..." className={`${inputClass} font-mono text-sm`} />
                      <p className="text-xs text-orange-600 mt-1.5">⚠️ Nunca compartilhe este token.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setConfigModalOpen(false)}
                    className="px-8 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
                    Fechar
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ── Submit bar: só aparece no modo criar ── */}
        {isDraftDocument && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex justify-end">
            <button type="submit" disabled={saving}
              className="px-8 py-2.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Salvando...' : (persistedFormId ? 'Publicar Formulário' : 'Criar Formulário')}
            </button>
          </div>
        )}

        {/* ── Toast auto-save (edit mode) ── */}
        {savedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-2xl shadow-xl text-sm font-medium animate-fade-in">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Salvo automaticamente
          </div>
        )}

      </div>
    </form>

    {/* Live preview — only on large screens */}
    {showSidePreview && (
      <div className="hidden xl:block">
        <FormPreviewPanel form={{ ...form, customTexts, slug }} photos={photos} steps={steps} currentIndex={currentStepIndex} onCurrentIndexChange={setCurrentStepIndex} />
      </div>
    )}
    </div>
    </div>
  );
}





