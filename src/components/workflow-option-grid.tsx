'use client';

import { Theme } from '@/lib/themes';
import { WorkflowOption } from '@/types/form';

interface Props {
  options: WorkflowOption[];
  theme: Theme;
  onSelect?: (option: WorkflowOption) => void;
  compact?: boolean;
  className?: string;
}

export default function WorkflowOptionGrid({ options, theme, onSelect, compact = false, className }: Props) {
  if (!options.length) return null;

  return (
    <div className={className || 'w-full grid gap-3'}>
      {options.map(option => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect?.(option)}
          disabled={!onSelect}
          className={`w-full rounded-3xl border border-gray-200 bg-white text-left shadow-sm transition-all ${
            onSelect ? 'hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg' : 'cursor-default'
          } ${compact ? 'px-3 py-3' : 'px-5 py-4'}`}
          style={onSelect ? { boxShadow: `0 10px 30px -20px ${theme.gradientFrom}` } : undefined}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white ${compact ? 'text-sm' : 'text-base'}`}
              style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
            >
              →
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
                {option.label || 'Nova opção'}
              </p>
              {option.description && (
                <p className={`mt-1 leading-relaxed text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {option.description}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
