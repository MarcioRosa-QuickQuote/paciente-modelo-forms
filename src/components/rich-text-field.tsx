'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { sanitizeRichTextHtml, sanitizeRichTextStyle } from '@/lib/rich-text';

const SOLID_COLORS = [
  { label: 'Roxo', value: '#7c3aed' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Laranja', value: '#f97316' },
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Verde', value: '#22c55e' },
  { label: 'Dourado', value: '#d4a843' },
  { label: 'Preto', value: '#111827' },
];

const GRADIENTS = [
  { from: '#7c3aed', to: '#ec4899' },
  { from: '#f43f5e', to: '#f97316' },
  { from: '#2563eb', to: '#06b6d4' },
  { from: '#059669', to: '#10b981' },
  { from: '#92400e', to: '#d4a843' },
];

interface ToolbarPos {
  top: number;
  left: number;
}

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  singleLine?: boolean;
  className?: string;
}

function unwrapElement(element: HTMLElement) {
  const parent = element.parentNode;
  if (!parent) return;

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  parent.removeChild(element);
}

function cleanupRichTextDom(root: ParentNode, stripColorOnly = false) {
  const elements = Array.from(root.querySelectorAll('*')).reverse();

  elements.forEach(node => {
    if (!(node instanceof HTMLElement)) return;

    const currentStyle = node.getAttribute('style');
    if (currentStyle) {
      const sanitizedStyle = sanitizeRichTextStyle(currentStyle, { stripColorOnly });
      if (sanitizedStyle) node.setAttribute('style', sanitizedStyle);
      else node.removeAttribute('style');
    }

    if ((node.tagName === 'SPAN' || node.tagName === 'FONT') && node.attributes.length === 0) {
      unwrapElement(node);
    }
  });
}

export default function RichTextField({ value, onChange, placeholder, singleLine, className }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtml = useRef('');
  const savedRangeRef = useRef<Range | null>(null);
  const [toolbar, setToolbar] = useState<ToolbarPos | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const syncEditorHtml = useCallback(() => {
    if (!editorRef.current) return '';

    cleanupRichTextDom(editorRef.current);

    const normalizedHtml = sanitizeRichTextHtml(editorRef.current.innerHTML, { singleLine });
    if (editorRef.current.innerHTML !== normalizedHtml) {
      editorRef.current.innerHTML = normalizedHtml;
    }

    if (normalizedHtml !== lastHtml.current) {
      lastHtml.current = normalizedHtml;
      onChange(normalizedHtml);
    }

    return normalizedHtml;
  }, [onChange, singleLine]);

  useEffect(() => {
    if (!editorRef.current) return;

    const normalizedValue = sanitizeRichTextHtml(value || '', { singleLine });
    if (normalizedValue !== lastHtml.current || editorRef.current.innerHTML !== normalizedValue) {
      editorRef.current.innerHTML = normalizedValue;
      lastHtml.current = normalizedValue;
    }
  }, [singleLine, value]);

  const handleInput = useCallback(() => {
    syncEditorHtml();
  }, [syncEditorHtml]);

  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    const editor = editorRef.current;

    if (!sel || !editor || sel.isCollapsed || !editor.contains(sel.anchorNode) || !editor.contains(sel.focusNode)) {
      savedRangeRef.current = null;
      setToolbar(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    savedRangeRef.current = range.cloneRange();
    setToolbar({
      top: rect.top + window.scrollY - 56,
      left: Math.max(8, rect.left + rect.width / 2 - 140),
    });
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (
        toolbarRef.current?.contains(e.target as Node) ||
        editorRef.current?.contains(e.target as Node)
      ) return;

      savedRangeRef.current = null;
      setToolbar(null);
    }

    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function restoreSelection(): Range | null {
    const editor = editorRef.current;
    const savedRange = savedRangeRef.current;
    if (!editor || !savedRange) return null;

    const sel = window.getSelection();
    if (!sel) return null;

    const range = savedRange.cloneRange();
    sel.removeAllRanges();
    sel.addRange(range);
    return range;
  }

  function insertNodeAtRange(range: Range, node: Node) {
    range.deleteContents();
    range.insertNode(node);

    const sel = window.getSelection();
    if (sel) {
      const newRange = document.createRange();
      newRange.setStartAfter(node);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    savedRangeRef.current = null;
    setToolbar(null);
    syncEditorHtml();
  }

  function getCleanSelectionFragment(range: Range, stripColorOnly = false): DocumentFragment {
    const extracted = range.extractContents();
    const holder = document.createElement('div');
    holder.appendChild(extracted);
    cleanupRichTextDom(holder, stripColorOnly);

    const fragment = document.createDocumentFragment();
    while (holder.firstChild) {
      fragment.appendChild(holder.firstChild);
    }

    return fragment;
  }

  function wrapSelection(styleText?: string) {
    const range = restoreSelection();
    if (!range || range.collapsed) return;

    const fragment = getCleanSelectionFragment(range, true);
    const span = document.createElement('span');

    if (styleText) span.style.cssText = styleText;
    span.appendChild(fragment);

    insertNodeAtRange(range, span);
  }

  function applyColor(color: string) {
    wrapSelection(`color:${color}`);
  }

  function applyGradient(from: string, to: string) {
    wrapSelection(
      `background-image:linear-gradient(to right, ${from}, ${to});background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent`
    );
  }

  function clearFormatting() {
    wrapSelection();
  }

  function insertPlainText(text: string) {
    const sel = window.getSelection();
    const editor = editorRef.current;
    if (!sel || !editor || !editor.contains(sel.anchorNode)) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const fragment = document.createDocumentFragment();
    const normalizedText = singleLine ? text.replace(/\s+/g, ' ') : text.replace(/\r\n?/g, '\n');
    const parts = normalizedText.split('\n');

    parts.forEach((part, index) => {
      fragment.appendChild(document.createTextNode(part));
      if (index < parts.length - 1) {
        if (singleLine) fragment.appendChild(document.createTextNode(' '));
        else fragment.appendChild(document.createElement('br'));
      }
    });

    const marker = document.createTextNode('');
    fragment.appendChild(marker);
    range.insertNode(fragment);

    const nextRange = document.createRange();
    nextRange.setStartBefore(marker);
    nextRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(nextRange);
    marker.remove();

    syncEditorHtml();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    insertPlainText(e.clipboardData.getData('text/plain'));
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
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className={`${className || ''} outline-none leading-normal`}
      />

      {toolbar && (
        <div
          ref={toolbarRef}
          className="fixed z-[300] bg-white rounded-2xl shadow-2xl border border-gray-100 px-2.5 py-2 flex items-center gap-2 select-none"
          style={{ top: toolbar.top, left: toolbar.left }}
          onMouseDown={e => e.preventDefault()}
        >
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

          <div className="flex items-center gap-1">
            {GRADIENTS.map((g, i) => (
              <button
                key={i}
                type="button"
                title="Degrade"
                onMouseDown={e => { e.preventDefault(); applyGradient(g.from, g.to); }}
                className="w-5 h-5 rounded-full border-2 border-white shadow hover:scale-125 transition-transform"
                style={{ background: `linear-gradient(to right, ${g.from}, ${g.to})` }}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

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
