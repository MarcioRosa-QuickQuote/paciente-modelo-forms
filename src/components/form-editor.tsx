'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, FormInput } from '@/types/form';
import { generateSlug } from '@/lib/utils';
import Image from 'next/image';

interface FormEditorProps {
  initialData?: FormData;
  mode: 'create' | 'edit';
}

export default function FormEditor({ initialData, mode }: FormEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormInput>({
    name: initialData?.name || '',
    procedureName: initialData?.procedureName || '',
    availableDays: initialData?.availableDays || '',
    regularPrice: initialData?.regularPrice || 0,
    modelPrice: initialData?.modelPrice || 0,
    feeAmount: initialData?.feeAmount || 0,
    professionalName: initialData?.professionalName || '',
    instagramHandle: initialData?.instagramHandle || '',
    whatsappNumber: initialData?.whatsappNumber || '',
    beforeImage: initialData?.beforeImage || '',
    afterImage: initialData?.afterImage || '',
  });

  const slug = generateSlug(form.name);

  function updateField<K extends keyof FormInput>(key: K, value: FormInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
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
      const url = mode === 'create' ? '/api/forms' : `/api/forms/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
              URL: /formulario/<span className="text-purple-600 font-medium">{slug}</span>
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
              required
            />
          </div>

          {/* Dias Disponíveis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dias Disponíveis
            </label>
            <input
              type="text"
              value={form.availableDays}
              onChange={e => updateField('availableDays', e.target.value)}
              placeholder="Ex: Segunda e Terça, das 14h às 18h"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
              required
            />
          </div>

          {/* Valores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Normal (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.regularPrice || ''}
                onChange={e => updateField('regularPrice', parseFloat(e.target.value) || 0)}
                placeholder="1500,00"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Paciente Modelo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.modelPrice || ''}
                onChange={e => updateField('modelPrice', parseFloat(e.target.value) || 0)}
                placeholder="350,00"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa de Reserva (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.feeAmount || ''}
                onChange={e => updateField('feeAmount', parseFloat(e.target.value) || 0)}
                placeholder="150,00"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
                required
              />
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={e => updateField('whatsappNumber', e.target.value)}
                placeholder="5511999998888"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
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
                  className="relative aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-purple-400 transition-colors group"
                >
                  {form.beforeImage ? (
                    <Image
                      src={form.beforeImage}
                      alt="Antes"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                      {uploadingBefore ? (
                        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
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
                  className="relative aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-purple-400 transition-colors group"
                >
                  {form.afterImage ? (
                    <Image
                      src={form.afterImage}
                      alt="Depois"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                      {uploadingAfter ? (
                        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
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
            className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : mode === 'create' ? 'Criar Formulário' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </form>
  );
}
