'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-client';

export default function SettingsPage() {
  const [clinicLogo, setClinicLogo] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadSettings() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClinicLogo(data.clinicLogo || '');
      }
    }
    loadSettings();
  }, []);

  async function uploadLogo(file: File) {
    setUploading(true);
    try {
      const formData = new globalThis.FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) setClinicLogo(data.url);
      else alert(data.error || 'Erro ao fazer upload');
    } catch {
      alert('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ clinicLogo }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Erro ao salvar configurações');
      }
    } catch {
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Personalize sua conta e seus formulários</p>
      </div>

      <div className="space-y-6">
        {/* Identidade Visual */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Identidade Visual</h2>
            <p className="text-sm text-gray-500 mt-0.5">Exibida no topo dos seus formulários públicos</p>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Logomarca da Clínica</label>
            <div className="flex items-start gap-4">
              <div
                onClick={() => logoRef.current?.click()}
                className="relative w-40 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#6B1C3A]/50 transition-colors group flex items-center justify-center"
              >
                {clinicLogo ? (
                  <Image src={clinicLogo} alt="Logo" fill className="object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 group-hover:text-[#6B1C3A] transition-colors">
                    {uploading ? (
                      <div className="w-6 h-6 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs">Clique para enviar</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">PNG, JPG ou WebP. Recomendado: fundo transparente (PNG)</p>
                {clinicLogo && (
                  <button onClick={() => setClinicLogo('')} className="mt-2 text-sm text-red-500 hover:text-red-700 transition-colors">
                    Remover logo
                  </button>
                )}
              </div>
            </div>
            <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Salvo com sucesso!
            </span>
          )}
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-2.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}
