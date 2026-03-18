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
  const conversions = stats['4']?.sim || 0;
  const conversionRate = totalResponses > 0 ? Math.round((conversions / totalResponses) * 100) : 0;

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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Convertidos</p>
          <p className="text-3xl font-bold text-emerald-600">{conversions}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Conversão</p>
          <p className="text-3xl font-bold text-[#6B1C3A]">{conversionRate}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 space-y-6">
        {[1, 2, 3, 4].map(step => {
          const s = stats[String(step)] || { sim: 0, nao: 0 };
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
