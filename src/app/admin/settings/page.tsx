'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-client';

export default function SettingsPage() {
  const [clinicLogo, setClinicLogo] = useState('');
  const [pixelId, setPixelId] = useState('');
  const [capiToken, setCapiToken] = useState('');
  const [showToken, setShowToken] = useState(false);
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
        setPixelId(data.pixelId || '');
        setCapiToken(data.capiToken || '');
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
        body: JSON.stringify({ clinicLogo, pixelId, capiToken }),
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

        {/* Meta Pixel + CAPI */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-gray-900">Meta Ads (Facebook & Instagram)</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Recomendado</span>
            </div>
            <p className="text-sm text-gray-500">Configure o rastreamento para otimizar suas campanhas de anúncios</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Pixel ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID do Pixel</label>
              <p className="text-xs text-gray-400 mb-2">
                Rastreamento no navegador do usuário. Encontre em Gerenciador de Eventos → Configurações.
              </p>
              <input
                type="text"
                value={pixelId}
                onChange={e => setPixelId(e.target.value)}
                placeholder="Ex: 1234567890123456"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
              />
            </div>

            {/* CAPI Token */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">Token da API de Conversões (CAPI)</label>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Server-side</span>
              </div>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={capiToken}
                  onChange={e => setCapiToken(e.target.value)}
                  placeholder="EAAMxxxxxxxx..."
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  title={showToken ? 'Ocultar token' : 'Mostrar token'}
                >
                  {showToken ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-orange-600 mt-1.5">
                ⚠️ Nunca compartilhe este token — ele dá acesso à sua conta de anúncios.
              </p>
            </div>
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
