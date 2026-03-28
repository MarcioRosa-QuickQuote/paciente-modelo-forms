'use client';

import { useRouter } from 'next/navigation';
import { FORM_TEMPLATES, FormTemplate } from '@/lib/templates';

interface Props {
  onSelect: (templateId: string) => void;
}

const NICHE_GROUPS = [
  { label: 'Personalizado', ids: ['em-branco'] },
  { label: 'Clínica de Estética', ids: ['paciente-modelo', 'botox-harmonizacao', 'estetica-corporal', 'capilar-micropigmentacao'] },
  { label: 'Odontologia', ids: ['clareamento-dental', 'implante-dental', 'facetas-laminados'] },
  { label: 'Saúde & Fitness', ids: ['nutricao-emagrecimento', 'personal-trainer'] },
  { label: 'Advocacia', ids: ['advocacia-trabalhista', 'advocacia-previdenciaria'] },
  { label: 'Psicologia', ids: ['psicologia-terapia'] },
] as const;

function TemplateCard({ template, onSelect }: { template: FormTemplate; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className="group text-left bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#6B1C3A]/30 transition-all duration-200 overflow-hidden w-full cursor-pointer"
    >
      <div className={`h-16 bg-gradient-to-br ${template.color} flex items-center px-4 gap-3`}>
        <span className="text-3xl">{template.icon}</span>
        <div>
          <p className="text-white font-bold text-sm leading-tight">{template.name}</p>
          <p className="text-white/70 text-xs">{template.niche}</p>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 leading-relaxed mb-3">{template.description}</p>

        {template.data.headline && (
          <p className="text-xs text-gray-400 italic mb-2 line-clamp-2">"{template.data.headline}"</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {template.hasPhotos ? (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">📸 Usa fotos antes/depois</span>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Sem fotos</span>
          )}
          {template.data.procedureDuration && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">⏱ {template.data.procedureDuration}</span>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-1 text-[#6B1C3A] text-sm font-semibold group-hover:gap-2 transition-all">
          <span>Usar modelo</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

function WorkflowStarterCard({ onSelect }: { onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group text-left bg-white rounded-2xl border border-[#6B1C3A]/15 shadow-sm hover:shadow-md hover:border-[#6B1C3A]/35 transition-all duration-200 overflow-hidden w-full cursor-pointer"
    >
      <div className="h-16 bg-gradient-to-br from-[#6B1C3A] to-[#B14576] flex items-center px-4 gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white shadow-sm">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h6v4H4V6zm0 8h6v4H4v-4zm10-8h6v4h-6V6zm0 8h6v4h-6v-4zM10 8h4m-2 0v8" />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Criar com Workflow</p>
          <p className="text-white/70 text-xs">Funil ramificado</p>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Monte caminhos diferentes por resposta e leve cada perfil para a próxima tela certa.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">Fluxo visual</span>
          <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-medium">Arraste e solte</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-1 text-[#6B1C3A] text-sm font-semibold group-hover:gap-2 transition-all">
          <span>Abrir workflow</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

export default function TemplateSelector({ onSelect }: Props) {
  const router = useRouter();
  const templateMap = Object.fromEntries(FORM_TEMPLATES.map(t => [t.id, t]));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-4 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Escolha um modelo</h1>
        <p className="text-gray-500 mt-1">Selecione o modelo mais próximo do seu negócio. Você personaliza tudo depois.</p>
      </div>

      <div className="space-y-8">
        {NICHE_GROUPS.map(group => {
          const templates = group.ids.map(id => templateMap[id]).filter(Boolean);
          if (!templates.length && group.label !== 'Personalizado') return null;

          return (
            <div key={group.label}>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{group.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <TemplateCard key={template.id} template={template} onSelect={onSelect} />
                ))}
                {group.label === 'Personalizado' && (
                  <WorkflowStarterCard onSelect={() => onSelect('workflow-builder')} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
