'use client';

import { useEffect, useState, use } from 'react';
import FormEditor from '@/components/form-editor';
import { FormData } from '@/types/form';

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
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

  return <FormEditor initialData={form} mode="edit" />;
}
