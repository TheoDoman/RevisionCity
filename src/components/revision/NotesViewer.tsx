'use client';

import { useState } from 'react';
import { CheckCircle2, BookOpen, Lightbulb, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

interface NotesViewerProps {
  note: Note;
  onMarkComplete?: () => void;
}

// Simple markdown renderer (for production, use react-markdown)
function renderMarkdown(content: string) {
  // Split into paragraphs
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const ListTag = listType;
      elements.push(
        <ListTag key={elements.length} className={cn(
          "my-4 space-y-2",
          listType === 'ul' ? "list-disc list-inside" : "list-decimal list-inside"
        )}>
          {currentList.map((item, idx) => (
            <li key={idx} className="text-brand-600 leading-relaxed">
              {item}
            </li>
          ))}
        </ListTag>
      );
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={idx} className="text-lg font-semibold text-brand-900 mt-6 mb-3">
          {trimmed.replace('### ', '')}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={idx} className="text-xl font-semibold text-brand-900 mt-8 mb-4">
          {trimmed.replace('## ', '')}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={idx} className="text-2xl font-bold text-brand-950 mt-8 mb-4">
          {trimmed.replace('# ', '')}
        </h2>
      );
    }
    // Bullet points
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(trimmed.replace(/^[-*]\s/, ''));
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmed)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(trimmed.replace(/^\d+\.\s/, ''));
    }
    // Bold text handling within paragraphs
    else if (trimmed.length > 0) {
      flushList();
      // Handle **bold** text
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={idx} className="text-brand-600 leading-relaxed my-3">
          {parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={partIdx} className="text-brand-800 font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    }
  });

  flushList();
  return elements;
}

export function NotesViewer({ note, onMarkComplete }: NotesViewerProps) {
  const [isComplete, setIsComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMarkComplete = () => {
    setIsComplete(true);
    onMarkComplete?.();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-brand-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-100 rounded-xl">
            <BookOpen className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-brand-900">{note.title}</h2>
            <p className="text-sm text-brand-500">Revision Notes</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-success-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Key Points */}
      {note.key_points && note.key_points.length > 0 && (
        <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-accent-500" />
            <h3 className="font-semibold text-brand-900">Key Points</h3>
          </div>
          <ul className="space-y-2">
            {note.key_points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success-500 mt-1 shrink-0" />
                <span className="text-brand-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-brand max-w-none">
        {renderMarkdown(note.content)}
      </div>

      {/* Mark as Complete */}
      <div className="mt-8 pt-6 border-t border-brand-100">
        <button
          onClick={handleMarkComplete}
          disabled={isComplete}
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
            isComplete
              ? "bg-success-100 text-success-700 cursor-default"
              : "btn-primary"
          )}
        >
          {isComplete ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Marked as Complete
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Mark as Complete
            </>
          )}
        </button>
      </div>
    </div>
  );
}
