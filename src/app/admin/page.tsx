'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FormData } from '@/types/form';
import { formatCurrency } from '@/lib/utils';
import FormStats from '@/components/form-stats';
import { supabase } from '@/lib/supabase-client';

async function authFetch(url: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
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
          name: `Copia de ${form.name}`,
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

      if (res.ok) {
        await fetchForms();
        return;
      }

      alert('Erro ao duplicar formulario');
    } catch {
      alert('Erro ao duplicar formulario');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este formulario?')) return;

    try {
      await authFetch(`/api/forms/${id}`, { method: 'DELETE' });
      setForms(prev => prev.filter(form => form.id !== id));
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
    setExpandedStats(prev => (prev === id ? null : id));
  }

  async function handleToggleActive(form: FormData) {
    if (togglingIds.includes(form.id)) return;

    const nextIsActive = !form.isActive;

    setTogglingIds(prev => [...prev, form.id]);
    setForms(prev =>
      prev.map(item => (item.id === form.id ? { ...item, isActive: nextIsActive } : item))
    );

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
      setForms(prev => prev.map(item => (item.id === form.id ? updatedForm : item)));
    } catch (error) {
      console.error('Error toggling form status:', error);
      setForms(prev =>
        prev.map(item => (item.id === form.id ? { ...item, isActive: form.isActive } : item))
      );
      alert('Nao foi possivel atualizar o status do formulario');
    } finally {
      setTogglingIds(prev => prev.filter(id => id !== form.id));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="tracking-tight text-3xl font-bold text-gray-900">Formularios</h1>
        <p className="mt-1 text-gray-500">Gerencie seus formularios de paciente modelo</p>
      </div>

      {forms.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Total</p>
            <p className="text-3xl font-bold text-gray-900">{forms.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Ativos</p>
            <p className="text-3xl font-bold text-emerald-600">{forms.filter(form => form.isActive).length}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Inativos</p>
            <p className="text-3xl font-bold text-gray-400">{forms.filter(form => !form.isActive).length}</p>
          </div>
        </div>
      )}

      {forms.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6B1C3A]/10 to-[#9B2D5E]/10">
            <svg className="h-10 w-10 text-[#6B1C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">Nenhum formulario criado</h3>
          <p className="mx-auto mb-8 max-w-sm text-gray-500">Crie seu primeiro formulario para comecar a captar pacientes modelo</p>
          <Link
            href="/admin/forms/new"
            className="inline-flex rounded-xl bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#6B1C3A]/20 transition-all hover:from-[#5A1731] hover:to-[#8A2653]"
          >
            Criar Primeiro Formulario
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map(form => {
            const isToggling = togglingIds.includes(form.id);
            const isLinkDisabled = !form.isActive || isToggling;

            return (
              <div key={form.id} className="space-y-0">
                <div className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-gray-200 hover:shadow-lg">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h3 className="truncate text-lg font-bold text-gray-900">{form.name}</h3>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            form.isActive
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                          }`}
                        >
                          {form.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
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

                      <div className={`flex w-fit items-center gap-2 rounded-lg px-3 py-1.5 ${form.isActive ? 'bg-gray-50' : 'bg-gray-50/70 opacity-70'}`}>
                        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <code className="text-xs text-gray-500">/formulario/{form.slug}</code>
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-3 xl:ml-4 xl:items-end">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={form.isActive}
                        aria-label={form.isActive ? 'Desativar formulario' : 'Ativar formulario'}
                        disabled={isToggling}
                        onClick={() => handleToggleActive(form)}
                        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${
                          form.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                        } ${isToggling ? 'cursor-wait opacity-70' : 'hover:shadow-sm'}`}
                        title={form.isActive ? 'Desativar formulario' : 'Ativar formulario'}
                      >
                        <span className="sr-only">
                          {form.isActive ? 'Desativar formulario' : 'Ativar formulario'}
                        </span>
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                            form.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>

                      <div className="flex flex-wrap items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => toggleStats(form.id)}
                          className={`rounded-xl p-2.5 transition-all ${
                            expandedStats === form.id
                              ? 'bg-[#6B1C3A]/10 text-[#6B1C3A]'
                              : 'text-gray-400 hover:bg-[#6B1C3A]/5 hover:text-[#6B1C3A]'
                          }`}
                          title="Estatisticas"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => copyLink(form.slug)}
                          disabled={isLinkDisabled}
                          className={`rounded-xl p-2.5 transition-all ${
                            isLinkDisabled
                              ? 'cursor-not-allowed text-gray-300'
                              : 'text-gray-400 hover:bg-[#6B1C3A]/5 hover:text-[#6B1C3A]'
                          }`}
                          title={form.isActive ? 'Copiar link' : 'Link desativado'}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>

                        {form.isActive ? (
                          <Link
                            href={`/formulario/${form.slug}`}
                            target="_blank"
                            className="rounded-xl p-2.5 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                            title="Visualizar"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="cursor-not-allowed rounded-xl p-2.5 text-gray-300"
                            title="Link desativado"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}

                        <button
                          onClick={() => handleDuplicate(form)}
                          className="rounded-xl p-2.5 text-gray-400 transition-all hover:bg-violet-50 hover:text-violet-600"
                          title="Duplicar"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>

                        <Link
                          href={`/admin/forms/${form.id}`}
                          className="rounded-xl p-2.5 text-gray-400 transition-all hover:bg-amber-50 hover:text-amber-600"
                          title="Editar"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>

                        <button
                          onClick={() => handleDelete(form.id)}
                          className="rounded-xl p-2.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                          title="Excluir"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

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
