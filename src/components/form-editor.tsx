'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, FormInput } from '@/types/form';
import { generateSlug } from '@/lib/utils';
import Image from 'next/image';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/style.css';

function formatBRL(value: number): string {
  if (!value) return '';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseBRL(value: string): number {
  const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

interface FormEditorProps {
  initialData?: FormData;
  mode: 'create' | 'edit';
}

export default function FormEditor({ initialData, mode }: FormEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

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

  const [form, setForm] = useState<FormInput>({
    name: initialData?.name || '',
    procedureName: initialData?.procedureName || '',
    availableDays: initialData?.availableDays || '',
    regularPrice: initialData?.regularPrice || 0,
    modelPrice: initialData?.modelPrice || 0,
    feeAmount: initialData?.feeAmount || 0,
    professionalName: initialData?.professionalName || '',
    instagramHandle: initialData?.instagramHandle || '',
    whatsappNumber: initialData?.whatsappNumber ? formatPhone(initialData.whatsappNumber) : '',
    beforeImage: initialData?.beforeImage || '',
    afterImage: initialData?.afterImage || '',
    whatsappMessage: initialData?.whatsappMessage || '',
    finalScreenType: initialData?.finalScreenType || 'whatsapp',
    formFields: initialData?.formFields || { name: true, whatsapp: true, email: true },
  });

  const [regularPriceDisplay, setRegularPriceDisplay] = useState(formatBRL(form.regularPrice));
  const [modelPriceDisplay, setModelPriceDisplay] = useState(formatBRL(form.modelPrice));
  const [feePriceDisplay, setFeePriceDisplay] = useState(formatBRL(form.feeAmount));

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

  function handleMoneyInput(value: string, setter: (v: string) => void, field: 'regularPrice' | 'modelPrice' | 'feeAmount') {
    // Remove tudo que não é número
    let digits = value.replace(/\D/g, '');
    if (!digits) {
      setter('');
      updateField(field, 0);
      return;
    }
    // Converte para centavos
    const numValue = parseInt(digits) / 100;
    setter(formatBRL(numValue));
    updateField(field, numValue);
  }

  function handlePhoneInput(value: string) {
    const formatted = formatPhone(value);
    updateField('whatsappNumber', formatted);
  }

  async function uploadImage(file: File, type: 'before' | 'after') {
    const setUploading = type === 'before' ? setUploadingBefore : setUploadingAfter;
    setUploading(true);

    try {
      const formData = new globalThis.FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        updateField(type === 'before' ? 'beforeImage' : 'afterImage', data.url);
      } else {
        alert(data.error || 'Erro ao fazer upload');
      }
    } catch {
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // Enviar o whatsapp só com dígitos
      const submitData = {
        ...form,
        whatsappNumber: form.whatsappNumber.replace(/\D/g, ''),
      };

      const url = mode === 'create' ? '/api/forms' : `/api/forms/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao salvar formulário');
      }
    } catch {
      alert('Erro ao salvar formulário');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Novo Formulário' : 'Editar Formulário'}
          </h2>
          {slug && (
            <p className="text-sm text-gray-400 mt-1">
              URL: /formulario/<span className="text-[#6B1C3A] font-medium">{slug}</span>
            </p>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Nome do formulário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Formulário
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Ex: Botox Março 2026"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
              required
            />
          </div>

          {/* Procedimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Procedimento
            </label>
            <input
              type="text"
              value={form.procedureName}
              onChange={e => updateField('procedureName', e.target.value)}
              placeholder="Ex: Botox, Preenchimento Labial, Harmonização Facial"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
              required
            />
          </div>

          {/* Dias Disponíveis - Calendário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dias Disponíveis
            </label>
            <div
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-purple-500 cursor-pointer min-h-[48px] flex items-center gap-2 flex-wrap"
            >
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
                <DayPicker
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                  disabled={{ before: new Date() }}
                  classNames={{
                    today: 'font-bold text-[#6B1C3A]',
                    selected: 'bg-[#6B1C3A] text-white rounded-full',
                    chevron: 'fill-[#6B1C3A]',
                  }}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(false)}
                    className="px-4 py-2 bg-[#6B1C3A] text-white rounded-lg text-sm font-medium hover:bg-[#5A1731] transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Valores com máscara BRL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Normal
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Paciente Modelo
              </label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa de Reserva
              </label>
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
          </div>

          {/* Profissional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Profissional
            </label>
            <input
              type="text"
              value={form.professionalName}
              onChange={e => updateField('professionalName', e.target.value)}
              placeholder="Ex: Dra. Maria Silva"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
              required
            />
          </div>

          {/* Instagram e WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={form.instagramHandle}
                onChange={e => updateField('instagramHandle', e.target.value)}
                placeholder="@dra.mariasilva"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.whatsappNumber}
                onChange={e => handlePhoneInput(e.target.value)}
                placeholder="(91) 9 8382-8928"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
                required
              />
            </div>
          </div>

          {/* Imagens Antes e Depois */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Fotos Antes e Depois
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Antes */}
              <div>
                <p className="text-xs text-gray-500 mb-2 text-center font-medium uppercase tracking-wide">Antes</p>
                <div
                  onClick={() => beforeInputRef.current?.click()}
                  className="relative aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#6B1C3A]/50 transition-colors group"
                >
                  {form.beforeImage ? (
                    <Image
                      src={form.beforeImage}
                      alt="Antes"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-[#6B1C3A] transition-colors">
                      {uploadingBefore ? (
                        <div className="w-8 h-8 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs">Clique para enviar</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={beforeInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file, 'before');
                  }}
                />
              </div>

              {/* Depois */}
              <div>
                <p className="text-xs text-gray-500 mb-2 text-center font-medium uppercase tracking-wide">Depois</p>
                <div
                  onClick={() => afterInputRef.current?.click()}
                  className="relative aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#6B1C3A]/50 transition-colors group"
                >
                  {form.afterImage ? (
                    <Image
                      src={form.afterImage}
                      alt="Depois"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-[#6B1C3A] transition-colors">
                      {uploadingAfter ? (
                        <div className="w-8 h-8 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs">Clique para enviar</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={afterInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file, 'after');
                  }}
                />
              </div>
            </div>
          </div>
          {/* Separador - Tela Final */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Configuração da Tela Final</h3>

            {/* Tipo da tela final */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quando o paciente disser Sim em tudo, o que acontece?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField('finalScreenType', 'whatsapp')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.finalScreenType === 'whatsapp'
                      ? 'border-[#6B1C3A] bg-[#6B1C3A]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="font-semibold text-sm text-gray-900">Botão do WhatsApp</span>
                  </div>
                  <p className="text-xs text-gray-500">Redireciona para o WhatsApp</p>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('finalScreenType', 'form')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.finalScreenType === 'form'
                      ? 'border-[#6B1C3A] bg-[#6B1C3A]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
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

            {/* Opções do WhatsApp */}
            {form.finalScreenType === 'whatsapp' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem do WhatsApp
                </label>
                <textarea
                  value={form.whatsappMessage}
                  onChange={e => updateField('whatsappMessage', e.target.value)}
                  placeholder="Ex: Olá! Tenho interesse em ser paciente modelo para o procedimento!"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Deixe vazio para usar a mensagem padrão</p>
              </div>
            )}

            {/* Opções do Formulário de Dados */}
            {form.finalScreenType === 'form' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Campos do formulário de dados
                </label>
                <div className="space-y-3">
                  {/* Nome */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">Nome</span>
                    <button
                      type="button"
                      onClick={() => updateField('formFields', { ...form.formFields, name: !form.formFields.name })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        form.formFields.name ? 'bg-[#6B1C3A]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          form.formFields.name ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  {/* WhatsApp */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                    <button
                      type="button"
                      onClick={() => updateField('formFields', { ...form.formFields, whatsapp: !form.formFields.whatsapp })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        form.formFields.whatsapp ? 'bg-[#6B1C3A]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          form.formFields.whatsapp ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  {/* E-mail */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">E-mail</span>
                    <button
                      type="button"
                      onClick={() => updateField('formFields', { ...form.formFields, email: !form.formFields.email })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        form.formFields.email ? 'bg-[#6B1C3A]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          form.formFields.email ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : mode === 'create' ? 'Criar Formulário' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </form>
  );
}
