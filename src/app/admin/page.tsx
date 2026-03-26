'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FormData } from '@/types/form';
import { formatCurrency } from '@/lib/utils';
import FormStats from '@/components/form-stats';
import { supabase } from '@/lib/supabase-client';

async function authFetch(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  return fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });
}

export default function AdminDashboard() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStats, setExpandedStats] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<string[]>([]);

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    try {
      const res = await authFetch('/api/forms');
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDuplicate(form: FormData) {
    try {
      const res = await authFetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Cópia de ${form.name}`,
          procedureName: form.procedureName,
          availableDays: form.availableDays,
          regularPrice: form.regularPrice,
          modelPrice: form.modelPrice,
          feeAmount: form.feeAmount,
          installmentCount: form.installmentCount,
          installmentAmount: form.installmentAmount,
          procedureDuration: form.procedureDuration,
          professionalName: form.professionalName,
          instagramHandle: form.instagramHandle,
          whatsappNumber: form.whatsappNumber,
          beforeImage: form.beforeImage,
          afterImage: form.afterImage,
          photos: form.photos,
          singlePhoto: form.singlePhoto,
          showOnlyInstallment: form.showOnlyInstallment,
          headline: form.headline,
          supportText: form.supportText,
          whatsappMessage: form.whatsappMessage,
          finalScreenType: form.finalScreenType,
          formFields: form.formFields,
          theme: form.theme,
          pixelId: form.pixelId,
          capiToken: form.capiToken,
          steps: form.steps,
          customTexts: form.customTexts,
        }),
      });
      if (res.ok) await fetchForms();
      else alert('Erro ao duplicar formulário');
    } catch {
      alert('Erro ao duplicar formulário');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este formulário?')) return;

    try {
      await authFetch(`/api/forms/${id}`, { method: 'DELETE' });
      setForms(forms.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/formulario/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado!');
  }

  function toggleStats(id: string) {
    setExpandedStats(prev => prev === id ? null : id);
  }

  async function handleToggleActive(form: FormData) {
    if (togglingIds.includes(form.id)) return;

    const nextIsActive = !form.isActive;

    setTogglingIds(prev => [...prev, form.id]);
    setForms(prev => prev.map(item => (
      item.id === form.id
        ? { ...item, isActive: nextIsActive }
        : item
    )));

    try {
      const res = await authFetch(`/api/forms/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextIsActive }),
      });

      if (!res.ok) {
        throw new Error('toggle_failed');
      }

      const updatedForm = await res.json();
      setForms(prev => prev.map(item => (
        item.id === form.id
          ? updatedForm
          : item
      )));
    } catch (error) {
      console.error('Error toggling form status:', error);
      setForms(prev => prev.map(item => (
        item.id === form.id
          ? { ...item, isActive: form.isActive }
          : item
      )));
      alert('Não foi possível atualizar o status do formulário');
    } finally {
      setTogglingIds(prev => prev.filter(id => id !== form.id));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Formulários</h1>
        <p className="text-gray-500 mt-1">Gerencie seus formulários de paciente modelo</p>
      </div>

      {/* Stats */}
      {forms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{forms.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ativos</p>
            <p className="text-3xl font-bold text-emerald-600">{forms.filter(f => f.isActive).length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Inativos</p>
            <p className="text-3xl font-bold text-gray-400">{forms.filter(f => !f.isActive).length}</p>
          </div>
        </div>
      )}

      {forms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-[#6B1C3A]/10 to-[#9B2D5E]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#6B1C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum formulário criado</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Crie seu primeiro formulário para começar a captar pacientes modelo</p>
          <Link
            href="/admin/forms/new"
            className="inline-flex px-8 py-3.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20"
          >
            Criar Primeiro Formulário
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => {
            const isToggling = togglingIds.includes(form.id);

            return (
              <div key={form.id} className="space-y-0">
              <div
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{form.name}</h3>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                          form.isActive
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                        }`}
                      >
                        {form.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                      <p className="text-sm text-gray-500">
                        <span className="text-gray-400">Procedimento:</span>{' '}
                        <span className="font-semibold text-gray-700">{form.procedureName?.replace(/<[^>]*>/g, '')}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="text-gray-400">Profissional:</span>{' '}
                        <span className="font-semibold text-gray-700">{form.professionalName}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="text-gray-400">Valor modelo:</span>{' '}
                        <span className="font-semibold text-[#6B1C3A]">{formatCurrency(form.modelPrice)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 w-fit">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <code className="text-xs text-gray-500">/formulario/{form.slug}</code>
                    </div>
                  </div>
                  <div className="flex flex-col items-stretch gap-3 xl:items-end xl:ml-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.isActive}
                      aria-label={form.isActive ? 'Desativar formulário' : 'Ativar formulário'}
                      disabled={isToggling}
                      onClick={() => handleToggleActive(form)}
                      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                        form.isActive
                          ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      } ${isToggling ? 'cursor-wait opacity-70' : 'hover:shadow-sm'}`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                          {isToggling ? 'Atualizando' : 'Publicação'}
                        </p>
                        <p className="text-sm font-semibold">
                          {form.isActive ? 'Formulário ativo' : 'Formulário inativo'}
                        </p>
                      </div>
                      <span
                        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                          form.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                            form.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </span>
                    </button>
                    <div className="flex flex-wrap items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => toggleStats(form.id)}
                      className={`p-2.5 rounded-xl transition-all ${
                        expandedStats === form.id
                          ? 'text-[#6B1C3A] bg-[#6B1C3A]/10'
                          : 'text-gray-400 hover:text-[#6B1C3A] hover:bg-[#6B1C3A]/5'
                      }`}
                      title="Estatísticas"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => copyLink(form.slug)}
                      className="p-2.5 text-gray-400 hover:text-[#6B1C3A] hover:bg-[#6B1C3A]/5 rounded-xl transition-all"
                      title="Copiar link"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                    <Link
                      href={`/formulario/${form.slug}`}
                      target="_blank"
                      className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Visualizar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDuplicate(form)}
                      className="p-2.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                      title="Duplicar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <Link
                      href={`/admin/forms/${form.id}`}
                      className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(form.id)}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Excluir"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats panel - expands below the card */}
              {expandedStats === form.id && (
                <div className="mt-2">
                  <FormStats formId={form.id} formData={form} />
                </div>
              )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
