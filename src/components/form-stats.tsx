'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { FormData, FormInput, FormStep } from '@/types/form';
import { StepPreviewContent } from './form-preview-panel';
import { getStepInfo } from './form-step-builder';

interface StepStats {
  sim: number;
  nao: number;
}

interface StatsResponse {
  byPosition: Record<string, StepStats>;
  byStepId: Record<string, StepStats>;
}

interface Lead {
  id: number;
  form_id: string;
  name: string;
  whatsapp: string;
  email: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
}

function getLeadDisplayName(lead: Lead): string {
  if (lead.name?.trim()) return lead.name.trim();
  if (lead.whatsapp || lead.email) return 'Lead sem nome';
  return 'Contato via WhatsApp';
}

type Preset = 'hoje' | 'ontem' | 'semana' | 'mes' | 'periodo';
type ViewMode = 'stats' | 'leads' | 'chart';


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

const PHONE_W = 260;   // px — outer phone width
const SHELL_PAD = 6;   // p-[6px] on the phone shell
const SCREEN_W = PHONE_W - SHELL_PAD * 2; // 248px — actual screen width
const INNER_W = 390;   // px — render width (iPhone size)
const SCALE = SCREEN_W / INNER_W; // 248/390 ≈ 0.636 — fills screen exactly
const PHONE_H = 480;   // px — outer phone height

function StepPhonePreview({ stepIndex, formData, previewSteps }: { stepIndex: number; formData: FormData; previewSteps: FormStep[] }) {
  // Convert FormData → FormInput (superset, cast is safe)
  const formInput = formData as unknown as FormInput;
  const steps = previewSteps;
  const photos = formData.photos || [];
  // step is 1-based; celebration = step > steps.length

  return (
    <div className="flex-shrink-0 shadow-2xl" style={{ width: PHONE_W }}>
      {/* Phone shell */}
      <div className="bg-gray-900 rounded-[26px] p-[6px] overflow-hidden">
        {/* Screen */}
        <div className="bg-white rounded-[22px] overflow-hidden" style={{ height: PHONE_H }}>
          {/* Notch */}
          <div className="bg-gray-900 flex justify-center pt-1 pb-1">
            <div className="w-10 h-[4px] bg-gray-700 rounded-full" />
          </div>
          {/* Scaled content — top-left origin, content fills exactly PHONE_W after scale */}
          <div style={{ overflow: 'hidden', height: PHONE_H - 20 }}>
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
  </div>
  );
}

// ── FormStats ──────────────────────────────────────────────────────────────────

// ── Pie Chart ─────────────────────────────────────────────────────────────────

const PIE_COLORS = ['#6B1C3A', '#9B2D5E', '#e879a0', '#f4a0c0', '#fce4ec', '#b45309', '#f59e0b', '#10b981'];

function PieChart({ leads }: { leads: Lead[] }) {
  const counts: Record<string, number> = {};
  for (const l of leads) {
    const key = l.utm_source || 'Direto';
    counts[key] = (counts[key] || 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = leads.length;
  if (total === 0) return <p className="text-center text-gray-400 text-sm py-8">Nenhum lead cadastrado ainda</p>;

  let cumAngle = -Math.PI / 2;
  const R = 80;
  const CX = 100;
  const CY = 100;

  function slice(value: number, i: number) {
    const angle = (value / total) * 2 * Math.PI;
    const x1 = CX + R * Math.cos(cumAngle);
    const y1 = CY + R * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = CX + R * Math.cos(cumAngle);
    const y2 = CY + R * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="p-6">
      <h4 className="text-sm font-bold text-gray-700 mb-4">Origem dos leads</h4>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {entries.map(([, v], i) => (
            <path key={i} d={slice(v, i)} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="white" strokeWidth="2" />
          ))}
        </svg>
        <div className="space-y-2 flex-1">
          {entries.map(([label, count], i) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="text-sm text-gray-700 flex-1">{label}</span>
              <span className="text-sm font-bold text-gray-900">{count}</span>
              <span className="text-xs text-gray-400">({Math.round((count / total) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Leads List ─────────────────────────────────────────────────────────────────

function LeadsList({ leads, loading }: { leads: Lead[]; loading: boolean }) {
  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <div className="w-8 h-8 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
    </div>
  );
  if (leads.length === 0) return <p className="text-center text-gray-400 text-sm py-8">Nenhum lead cadastrado ainda</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Pessoa</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Data / Hora</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">De onde veio</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(l => (
            <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <p className="font-semibold text-gray-900">{getLeadDisplayName(l)}</p>
                {l.whatsapp && <p className="text-xs text-gray-400 mt-0.5">{l.whatsapp}</p>}
              </td>
              <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                {new Date(l.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                <br />
                <span className="text-gray-400">{new Date(l.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </td>
              <td className="py-3 px-4">
                {l.utm_source || l.utm_medium || l.utm_campaign ? (
                  <div className="flex flex-col gap-0.5">
                    {l.utm_source && <span className="px-2 py-0.5 bg-[#6B1C3A]/10 text-[#6B1C3A] rounded-full text-xs font-semibold w-fit">{l.utm_source}</span>}
                    {l.utm_medium && <span className="text-xs text-gray-400">{l.utm_medium}{l.utm_campaign ? ` · ${l.utm_campaign}` : ''}</span>}
                  </div>
                ) : (
                  <span className="text-xs text-gray-300">Direto</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── FormStats ──────────────────────────────────────────────────────────────────

export default function FormStats({ formId, formData }: { formId: string; formData: FormData }) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [preset, setPreset] = useState<Preset>('mes');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [hoveredPreviewIndex, setHoveredPreviewIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoveredTargetRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('stats');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const visibleSteps = (formData.steps || []).filter(s => !s.hidden);

  function getPositionStats(position: number): StepStats {
    return stats?.byPosition?.[String(position)] || { sim: 0, nao: 0 };
  }

  function getStepStats(step: FormStep, position: number): StepStats {
    return stats?.byStepId?.[step.id] || getPositionStats(position);
  }

  const positionTooltip = useCallback((targetRect: DOMRect) => {
    const container = containerRef.current;
    if (!container) return;

    const gap = 20;
    const bounds = 12;
    const containerRect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const previewWidth = tooltipRef.current?.offsetWidth || (PHONE_W + 24);
    const previewHeight = tooltipRef.current?.offsetHeight || (PHONE_H + 24);
    const centeredLeft = Math.max(bounds, (viewportWidth - previewWidth) / 2);

    let fixedTop = targetRect.top + (targetRect.height / 2) - (previewHeight / 2);
    fixedTop = Math.max(bounds, Math.min(fixedTop, viewportHeight - previewHeight - bounds));

    const spaceRight = viewportWidth - targetRect.right;
    const spaceLeft = targetRect.left;
    let fixedLeft = targetRect.right + gap;

    if (spaceRight < previewWidth + gap && spaceLeft > spaceRight) {
      fixedLeft = targetRect.left - previewWidth - gap;
    }

    fixedLeft = Math.max(bounds, Math.min(fixedLeft, viewportWidth - previewWidth - bounds));

    if (viewportWidth < 1400) {
      fixedLeft = centeredLeft;
    } else {
      fixedLeft = Math.round((fixedLeft + centeredLeft) / 2);
    }

    setTooltipPos({
      top: fixedTop - containerRect.top,
      left: fixedLeft - containerRect.left,
    });
  }, []);

  function handleBarMouseEnter(previewIndex: number, event: React.MouseEvent<HTMLDivElement>) {
    setHoveredPreviewIndex(previewIndex);
    hoveredTargetRef.current = event.currentTarget;
    positionTooltip(event.currentTarget.getBoundingClientRect());
  }

  function handleBarMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (hoveredPreviewIndex === null) return;
    hoveredTargetRef.current = event.currentTarget;
    positionTooltip(event.currentTarget.getBoundingClientRect());
  }

  function handleBarMouseLeave() {
    setHoveredPreviewIndex(null);
    hoveredTargetRef.current = null;
    setTooltipPos(null);
  }

  useEffect(() => {
    if (hoveredPreviewIndex === null) return;

    const syncTooltipPosition = () => {
      if (!hoveredTargetRef.current) return;
      positionTooltip(hoveredTargetRef.current.getBoundingClientRect());
    };

    window.addEventListener('scroll', syncTooltipPosition, true);
    window.addEventListener('resize', syncTooltipPosition);

    return () => {
      window.removeEventListener('scroll', syncTooltipPosition, true);
      window.removeEventListener('resize', syncTooltipPosition);
    };
  }, [hoveredPreviewIndex, positionTooltip]);

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

  function fetchLeads() {
    setLeadsLoading(true);
    fetch(`/api/leads?formId=${formId}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLeads(data); })
      .catch(() => {})
      .finally(() => setLeadsLoading(false));
  }

  function switchView(mode: ViewMode) {
    setViewMode(mode);
    if ((mode === 'leads' || mode === 'chart') && leads.length === 0) {
      fetchLeads();
    }
  }

  async function handleClear() {
    if (!confirm('Tem certeza que deseja zerar todas as respostas deste formulário?')) return;
    setClearing(true);
    try {
      await fetch(`/api/stats/${formId}`, { method: 'DELETE' });
      setStats({ byPosition: {}, byStepId: {} });
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

  const visibleStepCount = visibleSteps.length;
  const firstStepStats = visibleSteps[0] ? getStepStats(visibleSteps[0], 1) : { sim: 0, nao: 0 };
  const totalResponses = firstStepStats.sim + firstStepStats.nao;
  const whatsappClicks = getPositionStats(visibleStepCount + 1).sim || 0;
  const conversionRate = totalResponses > 0 ? Math.round((whatsappClicks / totalResponses) * 100) : 0;

  return (
    <div ref={containerRef} className="relative">
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

      {/* Date filters + view toggles */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-2">
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => { switchView('stats'); applyPreset(p.key); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'stats' && preset === p.key
                ? 'bg-[#6B1C3A] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}

        {/* Separator */}
        <span className="w-px h-5 bg-gray-200 mx-1" />

        {/* Ver por pessoa (leads) */}
        <button
          onClick={() => switchView('leads')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            viewMode === 'leads'
              ? 'bg-[#6B1C3A] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Ver por pessoa
        </button>

        {/* Gráfico pizza */}
        <button
          onClick={() => switchView('chart')}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'chart'
              ? 'bg-[#6B1C3A] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Gráfico de origens (UTM)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </button>

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

      {/* Leads view */}
      {viewMode === 'leads' && (
        <LeadsList leads={leads} loading={leadsLoading} />
      )}

      {/* Chart view */}
      {viewMode === 'chart' && (
        leadsLoading
          ? <div className="flex items-center justify-center py-10"><div className="w-8 h-8 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" /></div>
          : <PieChart leads={leads} />
      )}

      {/* Stats view */}
      {viewMode === 'stats' && (loading ? (
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
            {(() => {
              const finalStepNum = visibleSteps.length + 1; // WhatsApp click

              return (
                <>
                  {visibleSteps.map((step, idx) => {
                    const s = getStepStats(step, idx + 1);
                    const total = s.sim + s.nao;
                    const simPct = total > 0 ? Math.round((s.sim / total) * 100) : 0;
                    const naoPct = total > 0 ? Math.round((s.nao / total) * 100) : 0;
                    const stepLabel = getStepInfo(step.type, step.label).label;

                    return (
                      <div key={step.id}
                        onMouseEnter={e => handleBarMouseEnter(idx, e)}
                        onMouseMove={handleBarMouseMove}
                        onMouseLeave={handleBarMouseLeave}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-semibold text-gray-700">{stepLabel}</span>
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

                  {/* WhatsApp click bar */}
                  {(() => {
                    const s = getPositionStats(finalStepNum);
                    const clicks = s.sim;
                    const prevSim = visibleSteps.length > 0
                      ? getStepStats(visibleSteps[visibleSteps.length - 1], visibleSteps.length).sim
                      : 0;
                    const clickPct = prevSim > 0 ? Math.round((clicks / prevSim) * 100) : 0;
                    return (
                      <div
                        onMouseEnter={e => handleBarMouseEnter(visibleSteps.length, e)}
                        onMouseMove={handleBarMouseMove}
                        onMouseLeave={handleBarMouseLeave}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                            </span>
                            <span className="text-sm font-semibold text-gray-700">Clicou no Botão do Zap</span>
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
                                {clicks} cliques ({clickPct}% dos que aceitaram)
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
                  })()}
                </>
              );
            })()}
          </div>
        </>
      ))}

      {/* Floating phone preview — centered on screen */}
      </div>

      {hoveredPreviewIndex !== null && tooltipPos && (
        <div
          ref={tooltipRef}
          className="absolute z-[300] pointer-events-none"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          <StepPhonePreview stepIndex={hoveredPreviewIndex} formData={formData} previewSteps={visibleSteps} />
        </div>
      )}
    </div>
  );
}
