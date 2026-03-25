'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

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
  forms: { name: string } | null;
}

function formatPhone(digits: string): string {
  if (!digits || digits.length < 10) return digits;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

function getLeadDisplayName(lead: Lead): string {
  if (lead.name?.trim()) return lead.name.trim();
  if (lead.whatsapp || lead.email) return 'Lead sem nome';
  return 'Contato via WhatsApp';
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const token = session?.access_token ?? '';
      fetch('/api/leads', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setLeads(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leads</h1>
        <p className="text-gray-500 mt-1">Cliques no WhatsApp e envios do formulario final</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6 w-fit">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total de Leads</p>
        <p className="text-3xl font-bold text-[#6B1C3A]">{leads.length}</p>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum lead ainda</h3>
          <p className="text-gray-400 text-sm">Quando pacientes responderem seus formularios, eles aparecerao aqui</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">WhatsApp</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">E-mail</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Origem</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Formulario</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{getLeadDisplayName(lead)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.whatsapp ? (
                        <a
                          href={`https://wa.me/${lead.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium hover:text-green-700"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          {formatPhone(lead.whatsapp)}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{lead.email || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.utm_source || lead.utm_medium || lead.utm_campaign ? (
                        <div className="flex flex-col gap-0.5">
                          {lead.utm_source && (
                            <span className="px-2 py-0.5 bg-[#6B1C3A]/10 text-[#6B1C3A] rounded-full text-xs font-semibold w-fit">
                              {lead.utm_source}
                            </span>
                          )}
                          {lead.utm_medium && (
                            <span className="text-xs text-gray-400">
                              {lead.utm_medium}{lead.utm_campaign ? ` · ${lead.utm_campaign}` : ''}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Direto</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-[#6B1C3A]/10 text-[#6B1C3A] px-2.5 py-1 rounded-lg font-medium">
                        {lead.forms?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
