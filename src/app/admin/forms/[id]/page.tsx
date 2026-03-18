'use client';

import { useEffect, useState, use } from 'react';
import FormEditor from '@/components/form-editor';
import FormStats from '@/components/form-stats';
import { FormData } from '@/types/form';

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`/api/forms/${id}`);
        if (res.ok) {
          const data = await res.json();
          setForm(data);
        }
      } catch (error) {
        console.error('Error fetching form:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">Formulário não encontrado</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats toggle */}
      <div>
        <button
          onClick={() => setShowStats(prev => !prev)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            showStats
              ? 'bg-[#6B1C3A]/10 text-[#6B1C3A] border-[#6B1C3A]/20'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#6B1C3A]/30 hover:text-[#6B1C3A]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {showStats ? 'Ocultar estatísticas' : 'Ver estatísticas'}
        </button>
        {showStats && (
          <div className="mt-4">
            <FormStats formId={id} />
          </div>
        )}
      </div>

      <FormEditor initialData={form} mode="edit" />
    </div>
  );
}
