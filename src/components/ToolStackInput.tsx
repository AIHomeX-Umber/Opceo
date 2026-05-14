'use client';

import { useState, type KeyboardEvent } from 'react';
import { Wrench, X } from 'lucide-react';
import { getToolIconUrl } from '@/lib/tool-icons';

interface ToolStackInputProps {
  value: string[];
  onChange: (tools: string[]) => void;
  maxItems?: number;
}

export function ToolStackInput({ value, onChange, maxItems = 10 }: ToolStackInputProps) {
  const [input, setInput] = useState('');

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = input.trim();
      if (
        trimmed &&
        value.length < maxItems &&
        !value.some((t) => t.toLowerCase() === trimmed.toLowerCase())
      ) {
        onChange([...value, trimmed]);
        setInput('');
      }
    }
    if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const previewIconUrl = input.trim() ? getToolIconUrl(input.trim()) : null;

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tool, i) => {
            const iconUrl = getToolIconUrl(tool);
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm rounded-md font-mono
                  bg-white/5 border border-white/10 text-white/60 group"
              >
                {iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconUrl} alt="" className="w-4 h-4 shrink-0" />
                ) : (
                  <Wrench size={14} className="shrink-0 opacity-40" />
                )}
                {tool}
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/70"
                  aria-label={`Remove ${tool}`}
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? 'Claude Code, Supabase, n8n, Figma…' : 'Add another tool…'}
          disabled={value.length >= maxItems}
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white
            placeholder-white/20 focus:outline-none focus:border-[#534AB7] transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
        />
        {previewIconUrl && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewIconUrl} alt="" className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex justify-between text-xs text-white/25">
        <span>Press Enter to add</span>
        <span>{value.length}/{maxItems}</span>
      </div>
    </div>
  );
}
