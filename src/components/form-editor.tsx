'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, FormInput, PhotoPair, FormStep, CustomTexts } from '@/types/form';
import { generateSlug } from '@/lib/utils';
import { THEMES } from '@/lib/themes';
import { supabase } from '@/lib/supabase-client';
import Image from 'next/image';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/style.css';
import FormStepBuilder from './form-step-builder';
import FormPreviewPanel from './form-preview-panel';
import RichTextField from './rich-text-field';

const DEFAULT_STEPS: FormStep[] = [
  { id: 'default-foto', type: 'foto' },
  { id: 'default-disponibilidade', type: 'disponibilidade' },
  { id: 'default-preco', type: 'preco' },
  { id: 'default-taxa', type: 'taxa' },
];

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
  templateData?: TemplateData;
}

export default function FormEditor({ initialData, mode, templateData }: FormEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const photoRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const buildInitialSteps = (): FormStep[] => {
    if (initialData?.steps?.length) return initialData.steps;
    return DEFAULT_STEPS.map(s => ({ ...s, id: crypto.randomUUID() }));
  };

  const [steps, setSteps] = useState<FormStep[]>(buildInitialSteps());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [customTexts, setCustomTexts] = useState<CustomTexts>(initialData?.customTexts || {});

  const [form, setForm] = useState<FormInput>({
    name: initialData?.name || '',
    procedureName: initialData?.procedureName || templateData?.procedureName || '',
    availableDays: initialData?.availableDays || '',
    regularPrice: initialData?.regularPrice || 0,
    modelPrice: initialData?.modelPrice || 0,
    feeAmount: initialData?.feeAmount || 0,
    installmentCount: initialData?.installmentCount || 0,
    installmentAmount: initialData?.installmentAmount || 0,
    procedureDuration: initialData?.procedureDuration || templateData?.procedureDuration || '',
    professionalName: initialData?.professionalName || templateData?.professionalName || '',
    instagramHandle: initialData?.instagramHandle || '',
    whatsappNumber: initialData?.whatsappNumber ? formatPhone(initialData.whatsappNumber) : '',
    beforeImage: initialData?.beforeImage || '',
    afterImage: initialData?.afterImage || '',
    photos: buildInitialPhotos(),
    headline: initialData?.headline || templateData?.headline || '',
    supportText: initialData?.supportText || templateData?.supportText || '',
    whatsappMessage: initialData?.whatsappMessage || '',
    finalScreenType: initialData?.finalScreenType || 'whatsapp',
    formFields: initialData?.formFields || { name: true, whatsapp: true, email: true },
    theme: initialData?.theme || templateData?.theme || 'purple',
    steps: [],
    customTexts: initialData?.customTexts || {},
  });

  const [regularPriceDisplay, setRegularPriceDisplay] = useState(formatBRL(form.regularPrice));
  const [modelPriceDisplay, setModelPriceDisplay] = useState(formatBRL(form.modelPrice));
  const [feePriceDisplay, setFeePriceDisplay] = useState(formatBRL(form.feeAmount));
  const [installmentAmountDisplay, setInstallmentAmountDisplay] = useState(formatBRL(form.installmentAmount));

  const slug = generateSlug(form.name);

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
      const formData = new globalThis.FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        updatePhoto(index, type, data.url);
      } else {
        alert(data.error || 'Erro ao fazer upload');
      }
    } catch {
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploadingIndex(null);
    }
  }

  function updateCurrentStep(updates: Partial<FormStep>) {
    setSteps(steps.map((s, i) => i === currentStepIndex ? { ...s, ...updates } : s));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const firstPhoto = photos[0] || { before: '', after: '' };
      const submitData = {
        ...form,
        whatsappNumber: form.whatsappNumber.replace(/\D/g, ''),
        photos,
        beforeImage: firstPhoto.before,
        afterImage: firstPhoto.after,
        steps,
        customTexts,
      };

      const url = mode === 'create' ? '/api/forms' : `/api/forms/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, { method, headers, body: JSON.stringify(submitData) });

      if (res.ok) {
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

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900";
  const stepInputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  const currentStep = steps[currentStepIndex];

  return (
    <div className="w-full">
    <div className="xl:grid xl:grid-cols-[1fr_500px] xl:gap-6 xl:items-start">
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">

        {/* ── Step tabs card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100dvh - 160px)' }}>

          {/* Navigation bar + dots (from FormStepBuilder) */}
          <FormStepBuilder
            steps={steps}
            onChange={setSteps}
            currentIndex={currentStepIndex}
            onCurrentIndexChange={setCurrentStepIndex}
            hasCelebration
            onConfigOpen={() => setConfigModalOpen(true)}
          />

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Step content area */}
          {currentStep && (
            <div className="p-6 space-y-5 overflow-y-auto flex-1">

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

                  {/* Fotos Antes e Depois */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelClass + ' mb-0'}>Fotos Antes e Depois</label>
                      <button type="button" onClick={addPhotoPair}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#6B1C3A]/10 text-[#6B1C3A] rounded-lg text-xs font-medium hover:bg-[#6B1C3A]/20 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        + Fotos
                      </button>
                    </div>

                    <div className="space-y-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {(['before', 'after'] as const).map(type => {
                            const key = `${index}-${type}`;
                            return (
                              <div key={type} className="flex-1 relative">
                                <button
                                  type="button"
                                  onClick={() => photoRefs.current[key]?.click()}
                                  className={`w-full flex items-center gap-2 px-3 py-2 border rounded-lg text-xs transition-colors ${
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
                                  <span className="truncate">{photo[type] ? `✓ ${type === 'before' ? 'Antes' : 'Depois'}` : (type === 'before' ? 'Foto Antes' : 'Foto Depois')}</span>
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
                    <label className={labelClass}>Pergunta principal</label>
                    <input
                      type="text"
                      value={customTexts.availabilityQuestion || ''}
                      onChange={e => setCustomTexts(prev => ({ ...prev, availabilityQuestion: e.target.value }))}
                      placeholder="Você teria disponibilidade em algum desses dias?"
                      className={stepInputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Texto da duração</label>
                    <input
                      type="text"
                      value={customTexts.durationNote || ''}
                      onChange={e => setCustomTexts(prev => ({ ...prev, durationNote: e.target.value }))}
                      placeholder={`O procedimento dura cerca de ${form.procedureDuration || '2h'}.`}
                      className={stepInputClass}
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
                    <label className={labelClass}>Contexto (1ª linha)</label>
                    <input
                      type="text"
                      value={customTexts.pricingContext || ''}
                      onChange={e => setCustomTexts(prev => ({ ...prev, pricingContext: e.target.value }))}
                      placeholder="Sabendo que um paciente pagaria em média [preço]."
                      className={stepInputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Pergunta principal</label>
                    <input
                      type="text"
                      value={customTexts.pricingQuestion || ''}
                      onChange={e => setCustomTexts(prev => ({ ...prev, pricingQuestion: e.target.value }))}
                      placeholder="E por ser PACIENTE MODELO ganharia uma condição especial..."
                      className={stepInputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Rótulo do card</label>
                    <input
                      type="text"
                      value={customTexts.pricingLabel || ''}
                      onChange={e => setCustomTexts(prev => ({ ...prev, pricingLabel: e.target.value }))}
                      placeholder="Valor especial paciente modelo"
                      className={stepInputClass}
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
                    <label className={labelClass}>Texto antes do valor</label>
                    <input
                      type="text"
                      value={customTexts.feeTextPrefix || ''}
                      onChange={e => setCustomTexts(prev => ({ ...prev, feeTextPrefix: e.target.value }))}
                      placeholder="Para reservar seu horário na agenda, solicitamos um valor simbólico de"
                      className={stepInputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Texto secundário</label>
                    <input
                      type="text"
                      value={customTexts.feeBenefitText || ''}
                      onChange={e => setCustomTexts(prev => ({ ...prev, feeBenefitText: e.target.value }))}
                      placeholder="Mas fique tranquilo(a)! Esse valor será abatido do valor do procedimento."
                      className={stepInputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Badge "Abatido"</label>
                      <input
                        type="text"
                        value={customTexts.feeDeductedLabel || ''}
                        onChange={e => setCustomTexts(prev => ({ ...prev, feeDeductedLabel: e.target.value }))}
                        placeholder="Valor abatido"
                        className={stepInputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Badge "Seguro"</label>
                      <input
                        type="text"
                        value={customTexts.feeSafeLabel || ''}
                        onChange={e => setCustomTexts(prev => ({ ...prev, feeSafeLabel: e.target.value }))}
                        placeholder="Seguro"
                        className={stepInputClass}
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
                    <label className={labelClass}>Pergunta</label>
                    <input
                      type="text"
                      value={currentStep.question || ''}
                      onChange={e => updateCurrentStep({ question: e.target.value })}
                      placeholder="Ex: Você está disposto a fazer uma sessão de fotos para o nosso portfólio?"
                      className={stepInputClass}
                    />
                  </div>

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
                </>
              )}

            </div>
          )}

          {/* ── Aba Celebração ── */}
          {currentStepIndex === steps.length && (
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className={labelClass}>Título</label>
                <input
                  type="text"
                  value={customTexts.celebrationTitle || ''}
                  onChange={e => setCustomTexts(prev => ({ ...prev, celebrationTitle: e.target.value }))}
                  placeholder="Parabéns!"
                  className={stepInputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Subtítulo</label>
                <input
                  type="text"
                  value={customTexts.celebrationSubtitle || ''}
                  onChange={e => setCustomTexts(prev => ({ ...prev, celebrationSubtitle: e.target.value }))}
                  placeholder="Você foi qualificada para ser nossa paciente modelo!"
                  className={stepInputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Mensagem</label>
                <input
                  type="text"
                  value={customTexts.celebrationMessage || ''}
                  onChange={e => setCustomTexts(prev => ({ ...prev, celebrationMessage: e.target.value }))}
                  placeholder="É só chamar a gente no WhatsApp e aguardar o retorno de uma das nossas consultoras"
                  className={stepInputClass}
                />
              </div>
            </div>
          )}

        </div>

        {/* ── Config Modal ── */}
        {configModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setConfigModalOpen(false); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8">
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

                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setConfigModalOpen(false)}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all">
                    Fechar
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ── Submit bar — aparece apenas na aba de Celebração ── */}
        {currentStepIndex === steps.length && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
            <button type="button" onClick={() => router.push('/admin')}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-8 py-2.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Salvando...' : mode === 'create' ? 'Criar Formulário' : 'Salvar Alterações'}
            </button>
          </div>
        )}

      </div>
    </form>

    {/* Live preview — only on large screens */}
    <div className="hidden xl:block">
      <FormPreviewPanel form={{ ...form, customTexts }} photos={photos} steps={steps} currentIndex={currentStepIndex} onCurrentIndexChange={setCurrentStepIndex} />
    </div>
    </div>
    </div>
  );
}
