'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

const SOLID_COLORS = [
  { label: 'Roxo',    value: '#7c3aed' },
  { label: 'Rosa',    value: '#ec4899' },
  { label: 'Vermelho',value: '#ef4444' },
  { label: 'Laranja', value: '#f97316' },
  { label: 'Azul',    value: '#3b82f6' },
  { label: 'Verde',   value: '#22c55e' },
  { label: 'Dourado', value: '#d4a843' },
  { label: 'Preto',   value: '#111827' },
];

const GRADIENTS = [
  { from: '#7c3aed', to: '#ec4899' },
  { from: '#f43f5e', to: '#f97316' },
  { from: '#2563eb', to: '#06b6d4' },
  { from: '#059669', to: '#10b981' },
  { from: '#92400e', to: '#d4a843' },
];

interface ToolbarPos { top: number; left: number }

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  singleLine?: boolean;
  className?: string;
}

export default function RichTextField({ value, onChange, placeholder, singleLine, className }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtml = useRef('');
  const [toolbar, setToolbar] = useState<ToolbarPos | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Sync prop → DOM only when value originates from outside (not from internal typing)
  useEffect(() => {
    if (!editorRef.current) return;
    if (value !== lastHtml.current) {
      editorRef.current.innerHTML = value || '';
      lastHtml.current = value || '';
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastHtml.current = html;
    onChange(html);
  }, [onChange]);

  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editorRef.current?.contains(sel.anchorNode)) {
      setToolbar(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setToolbar({
      top: rect.top + window.scrollY - 56,
      left: Math.max(8, rect.left + rect.width / 2 - 140),
    });
  }, []);

  // Hide toolbar when clicking outside
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (
        toolbarRef.current?.contains(e.target as Node) ||
        editorRef.current?.contains(e.target as Node)
      ) return;
      setToolbar(null);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function getSelectionText(): string {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return '';
    return sel.getRangeAt(0).toString();
  }

  function replaceSelectionWith(node: Node) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
    // Move cursor after the inserted node
    const newRange = document.createRange();
    newRange.setStartAfter(node);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    onChange(editorRef.current!.innerHTML);
    lastHtml.current = editorRef.current!.innerHTML;
    setToolbar(null);
  }

  function applyColor(color: string) {
    const text = getSelectionText();
    if (!text) return;
    const span = document.createElement('span');
    span.style.color = color;
    span.textContent = text;
    replaceSelectionWith(span);
  }

  function applyGradient(from: string, to: string) {
    const text = getSelectionText();
    if (!text) return;
    const span = document.createElement('span');
    span.style.cssText = `background: linear-gradient(to right, ${from}, ${to}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`;
    span.textContent = text;
    replaceSelectionWith(span);
  }

  function clearFormatting() {
    const text = getSelectionText();
    if (!text) return;
    replaceSelectionWith(document.createTextNode(text));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (singleLine && e.key === 'Enter') e.preventDefault();
  }

  return (
    <>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onMouseUp={checkSelection}
        onKeyUp={checkSelection}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className={`${className || ''} outline-none`}
      />

      {toolbar && (
        <div
          ref={toolbarRef}
          className="fixed z-[300] bg-white rounded-2xl shadow-2xl border border-gray-100 px-2.5 py-2 flex items-center gap-2 select-none"
          style={{ top: toolbar.top, left: toolbar.left }}
          onMouseDown={e => e.preventDefault()}
        >
          {/* Solid colors */}
          <div className="flex items-center gap-1">
            {SOLID_COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onMouseDown={e => { e.preventDefault(); applyColor(c.value); }}
                className="w-5 h-5 rounded-full border-2 border-white shadow hover:scale-125 transition-transform"
                style={{ background: c.value }}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

          {/* Gradients */}
          <div className="flex items-center gap-1">
            {GRADIENTS.map((g, i) => (
              <button
                key={i}
                type="button"
                title="Degradê"
                onMouseDown={e => { e.preventDefault(); applyGradient(g.from, g.to); }}
                className="w-5 h-5 rounded-full border-2 border-white shadow hover:scale-125 transition-transform"
                style={{ background: `linear-gradient(to right, ${g.from}, ${g.to})` }}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

          {/* Clear */}
          <button
            type="button"
            title="Remover cor"
            onMouseDown={e => { e.preventDefault(); clearFormatting(); }}
            className="flex items-center gap-1 px-2 py-0.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpar
          </button>
        </div>
      )}
    </>
  );
}
