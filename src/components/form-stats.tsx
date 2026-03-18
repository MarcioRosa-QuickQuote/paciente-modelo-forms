'use client';

import { useEffect, useState } from 'react';

interface StepStats {
  sim: number;
  nao: number;
}

interface Stats {
  [key: string]: StepStats;
}

const STEP_LABELS: Record<number, string> = {
  1: 'Interesse',
  2: 'Disponibilidade',
  3: 'Valor',
  4: 'Taxa de Reserva',
  5: 'Clicou no Botão do Zap',
};

export default function FormStats({ formId }: { formId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stats/${formId}`)
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [formId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-8 h-8 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <p className="text-gray-400 text-sm">Tabela de respostas não encontrada. Rode o SQL no Supabase.</p>
      </div>
    );
  }

  const totalResponses = (stats['1']?.sim || 0) + (stats['1']?.nao || 0);
  const whatsappClicks = stats['5']?.sim || 0;
  const conversionRate = totalResponses > 0 ? Math.round((whatsappClicks / totalResponses) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Respostas do Formulário</h3>
        <p className="text-sm text-gray-400 mt-1">Acompanhe o desempenho de cada etapa</p>
      </div>

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

          // Step 5 (WhatsApp) only has "sim" clicks - show as total clicks
          if (step === 5) {
            const clicks = s.sim;
            const step4Sim = stats['4']?.sim || 0;
            const clickPct = step4Sim > 0 ? Math.round((clicks / step4Sim) * 100) : 0;

            return (
              <div key={step}>
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
                        {clicks} cliques ({clickPct}% dos que disseram sim na taxa)
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
            <div key={step}>
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
                <div className="flex gap-1 h-10 rounded-xl overflow-hidden">
                  {simPct > 0 && (
                    <div
                      className="bg-emerald-500 flex items-center justify-center transition-all duration-500 rounded-l-xl"
                      style={{ width: `${simPct}%` }}
                    >
                      <span className="text-white text-xs font-bold">
                        Sim {simPct}%
                      </span>
                    </div>
                  )}
                  {naoPct > 0 && (
                    <div
                      className="bg-red-400 flex items-center justify-center transition-all duration-500 rounded-r-xl"
                      style={{ width: `${naoPct}%` }}
                    >
                      <span className="text-white text-xs font-bold">
                        Não {naoPct}%
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <span className="text-xs text-gray-400">Sem respostas</span>
                </div>
              )}

              {/* Numbers below bar */}
              {total > 0 && (
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-emerald-600 font-medium">{s.sim} sim</span>
                  <span className="text-xs text-red-400 font-medium">{s.nao} não</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
