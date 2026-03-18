'use client';

import { useRouter } from 'next/navigation';
import { FORM_TEMPLATES } from '@/lib/templates';

interface Props {
  onSelect: (templateId: string) => void;
}

export default function TemplateSelector({ onSelect }: Props) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-4 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Escolha um modelo</h1>
        <p className="text-gray-500 mt-1">Selecione um template para começar — você pode personalizar tudo depois.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FORM_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="group text-left bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#6B1C3A]/30 transition-all duration-200 overflow-hidden"
          >
            {/* Header gradient */}
            <div className={`h-20 bg-gradient-to-br ${template.color} flex items-center justify-center`}>
              <span className="text-4xl">{template.icon}</span>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-base group-hover:text-[#6B1C3A] transition-colors">
                  {template.name}
                </h3>
              </div>
              <p className="text-xs text-[#6B1C3A] font-medium mb-2">{template.niche}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{template.description}</p>

              {/* Preview tags */}
              {template.data.headline && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 italic truncate">"{template.data.headline}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-1.5 text-[#6B1C3A] text-sm font-medium group-hover:gap-2.5 transition-all">
                <span>Usar este modelo</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
