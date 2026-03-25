'use client';

import { useEffect, useState, useRef } from 'react';
import { FormData, FormInput } from '@/types/form';
import { StepPreviewContent } from './form-preview-panel';

interface StepStats {
  sim: number;
  nao: number;
}

interface Stats {
  [key: string]: StepStats;
}

type Preset = 'hoje' | 'ontem' | 'semana' | 'mes' | 'periodo';

const STEP_LABELS: Record<number, string> = {
  1: 'Interesse',
  2: 'Disponibilidade',
  3: 'Valor',
  4: 'Taxa de Agendamento',
  5: 'Clicou no Botão do Zap',
};

function toLocalISO(date: Date, endOfDay = false): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return endOfDay ? `${y}-${m}-${d}T23:59:59` : `${y}-${m}-${d}T00:00:00`;
}

function getPresetRange(preset: Preset): { from?: string; to?: string } {
  const today = new Date();
  if (preset === 'hoje') {
    return { from: toLocalISO(today), to: toLocalISO(today, true) };
  }
  if (preset === 'ontem') {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return { from: toLocalISO(yesterday), to: toLocalISO(yesterday, true) };
  }
  if (preset === 'semana') {
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    return { from: toLocalISO(from), to: toLocalISO(today, true) };
  }
  if (preset === 'mes') {
    const from = new Date(today);
    from.setDate(today.getDate() - 29);
    return { from: toLocalISO(from), to: toLocalISO(today, true) };
  }
  return {};
}

// ── Phone mockup preview ──────────────────────────────────────────────────────

const PHONE_W = 260; // px — outer phone width
const INNER_W = 390; // px — render width (iPhone size)
const SCALE = PHONE_W / INNER_W; // ~0.667
const PHONE_H = 480; // px — outer phone height

function StepPhonePreview({ step, formData }: { step: number; formData: FormData }) {
  // Convert FormData → FormInput (superset, cast is safe)
  const formInput = formData as unknown as FormInput;
  const steps = formData.steps || [];
  const photos = formData.photos || [];
  // step is 1-based; celebration = step > steps.length
  const stepIndex = step - 1; // 0-based; >= steps.length means celebration

  return (
    <div className="flex-shrink-0 shadow-2xl" style={{ width: PHONE_W }}>
      {/* Phone shell */}
      <div className="bg-gray-900 rounded-[26px] p-[6px]">
        {/* Screen */}
        <div className="bg-white rounded-[22px] overflow-hidden" style={{ height: PHONE_H }}>
          {/* Notch */}
          <div className="bg-gray-900 flex justify-center pt-1 pb-1">
            <div className="w-10 h-[4px] bg-gray-700 rounded-full" />
          </div>
          {/* Scaled content */}
          <div style={{
            width: INNER_W,
            transform: `scale(${SCALE})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}>
            <StepPreviewContent
              form={formInput}
              photos={photos}
              steps={steps}
              stepIndex={stepIndex}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FormStats ──────────────────────────────────────────────────────────────────

export default function FormStats({ formId, formData }: { formId: string; formData: FormData }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [preset, setPreset] = useState<Preset>('mes');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  function handleBarMouseEnter(step: number, e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.right;
    const left = spaceOnRight >= PHONE_W + 24
      ? rect.right + 16
      : rect.left - PHONE_W - 16;
    setHoveredStep(step);
    setTooltipPos({ top: rect.top + window.scrollY + rect.height / 2, left });
  }

  function handleBarMouseLeave() {
    setHoveredStep(null);
    setTooltipPos(null);
  }

  function fetchStats(from?: string, to?: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString() ? `?${params.toString()}` : '';
    fetch(`/api/stats/${formId}${qs}`)
      .then(r => r.json())
      .then(data => { if (data && !data.error) setStats(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const { from, to } = getPresetRange('mes');
    fetchStats(from, to);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  function applyPreset(p: Preset) {
    setPreset(p);
    if (p !== 'periodo') {
      const { from, to } = getPresetRange(p);
      fetchStats(from, to);
    }
  }

  function applyCustomPeriod() {
    if (!customFrom || !customTo) return;
    fetchStats(`${customFrom}T00:00:00`, `${customTo}T23:59:59`);
  }

  async function handleClear() {
    if (!confirm('Tem certeza que deseja zerar todas as respostas deste formulário?')) return;
    setClearing(true);
    try {
      await fetch(`/api/stats/${formId}`, { method: 'DELETE' });
      setStats({ '1': { sim: 0, nao: 0 }, '2': { sim: 0, nao: 0 }, '3': { sim: 0, nao: 0 }, '4': { sim: 0, nao: 0 }, '5': { sim: 0, nao: 0 } });
    } catch {
      alert('Erro ao zerar respostas');
    } finally {
      setClearing(false);
    }
  }

  const PRESETS: { key: Preset; label: string }[] = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'ontem', label: 'Ontem' },
    { key: 'semana', label: '7 dias' },
    { key: 'mes', label: '30 dias' },
    { key: 'periodo', label: 'Período' },
  ];

  const totalResponses = (stats?.['1']?.sim || 0) + (stats?.['1']?.nao || 0);
  const whatsappClicks = stats?.['5']?.sim || 0;
  const conversionRate = totalResponses > 0 ? Math.round((whatsappClicks / totalResponses) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Respostas do Formulário</h3>
          <p className="text-sm text-gray-400 mt-1">Acompanhe o desempenho de cada etapa</p>
        </div>
        <button
          onClick={handleClear}
          disabled={clearing}
          className="shrink-0 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all disabled:opacity-50"
        >
          {clearing ? 'Zerando...' : 'Zerar respostas'}
        </button>
      </div>

      {/* Date filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-2">
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => applyPreset(p.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              preset === p.key
                ? 'bg-[#6B1C3A] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}

        {preset === 'periodo' && (
          <div className="flex items-center gap-2 mt-2 w-full sm:w-auto sm:mt-0">
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none"
            />
            <span className="text-gray-400 text-xs">até</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none"
            />
            <button
              onClick={applyCustomPeriod}
              disabled={!customFrom || !customTo}
              className="px-3 py-1.5 bg-[#6B1C3A] text-white rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-[#5A1731] transition-all"
            >
              Filtrar
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
        </div>
      ) : !stats ? (
        <div className="p-6 text-center">
          <p className="text-gray-400 text-sm">Tabela de respostas não encontrada. Rode o SQL no Supabase.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-100">
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-900">{totalResponses}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Clicaram no Zap</p>
              <p className="text-3xl font-bold text-emerald-600">{whatsappClicks}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Conversão</p>
              <p className="text-3xl font-bold text-[#6B1C3A]">{conversionRate}%</p>
            </div>
          </div>

          {/* Chart */}
          <div className="p-6 space-y-6">
            {[1, 2, 3, 4, 5].map(step => {
              const s = stats[String(step)] || { sim: 0, nao: 0 };

              if (step === 5) {
                const clicks = s.sim;
                const step4Sim = stats['4']?.sim || 0;
                const clickPct = step4Sim > 0 ? Math.round((clicks / step4Sim) * 100) : 0;
                return (
                  <div key={step}
                    onMouseEnter={e => handleBarMouseEnter(step, e)}
                    onMouseLeave={handleBarMouseLeave}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </span>
                        <span className="text-sm font-semibold text-gray-700">{STEP_LABELS[step]}</span>
                      </div>
                      <span className="text-xs text-gray-400">{clicks} cliques</span>
                    </div>
                    {clicks > 0 ? (
                      <div className="flex gap-1 h-10 rounded-xl overflow-hidden">
                        <div
                          className="bg-green-500 flex items-center justify-center transition-all duration-500 rounded-xl"
                          style={{ width: `${Math.max(clickPct, 10)}%` }}
                        >
                          <span className="text-white text-xs font-bold">
                            {clicks} cliques ({clickPct}% dos que aceitaram a taxa)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                        <span className="text-xs text-gray-400">Nenhum clique ainda</span>
                      </div>
                    )}
                  </div>
                );
              }

              const total = s.sim + s.nao;
              const simPct = total > 0 ? Math.round((s.sim / total) * 100) : 0;
              const naoPct = total > 0 ? Math.round((s.nao / total) * 100) : 0;

              return (
                <div key={step}
                  onMouseEnter={e => handleBarMouseEnter(step, e)}
                  onMouseLeave={handleBarMouseLeave}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                        {step}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">{STEP_LABELS[step]}</span>
                    </div>
                    <span className="text-xs text-gray-400">{total} respostas</span>
                  </div>
                  {total > 0 ? (
                    <>
                      <div className="flex gap-1 h-10 rounded-xl overflow-hidden">
                        {simPct > 0 && (
                          <div
                            className="bg-emerald-500 flex items-center justify-center transition-all duration-500 rounded-l-xl"
                            style={{ width: `${simPct}%` }}
                          >
                            <span className="text-white text-xs font-bold">Sim {simPct}%</span>
                          </div>
                        )}
                        {naoPct > 0 && (
                          <div
                            className="bg-red-400 flex items-center justify-center transition-all duration-500 rounded-r-xl"
                            style={{ width: `${naoPct}%` }}
                          >
                            <span className="text-white text-xs font-bold">Não {naoPct}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-emerald-600 font-medium">{s.sim} sim</span>
                        <span className="text-xs text-red-400 font-medium">{s.nao} não</span>
                      </div>
                    </>
                  ) : (
                    <div className="h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                      <span className="text-xs text-gray-400">Sem respostas</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Floating phone preview tooltip */}
      {hoveredStep !== null && tooltipPos && (
        <div
          ref={tooltipRef}
          className="fixed z-[300] pointer-events-none"
          style={{ top: tooltipPos.top, left: tooltipPos.left, transform: 'translateY(-50%)' }}
        >
          <StepPhonePreview step={hoveredStep} formData={formData} />
        </div>
      )}
    </div>
  );
}
