'use client';

import { useState } from 'react';
import { 
  ClipboardList, 
  BookOpen, 
  FlaskConical, 
  Lightbulb,
  Download,
  Printer,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SummarySheet } from '@/types';

interface SummarySheetViewerProps {
  summarySheet: SummarySheet;
}

export function SummarySheetViewer({ summarySheet }: SummarySheetViewerProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-brand-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brand-950">{summarySheet.title}</h2>
            <p className="text-sm text-brand-500">One-page summary sheet</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-brand-600 hover:bg-brand-50 
                     rounded-xl transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2">
        {/* Key Concepts */}
        <div className="bg-white rounded-xl border-2 border-brand-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-brand-900">Key Concepts</h3>
          </div>
          <ul className="space-y-2">
            {summarySheet.key_concepts.map((concept, idx) => {
              const id = `concept-${idx}`;
              return (
                <li 
                  key={idx}
                  onClick={() => toggleCheck(id)}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    checkedItems.has(id) ? "bg-success-50" : "hover:bg-brand-50"
                  )}
                >
                  <CheckCircle2 className={cn(
                    "h-5 w-5 shrink-0 mt-0.5 transition-colors",
                    checkedItems.has(id) ? "text-success-500" : "text-brand-300"
                  )} />
                  <span className={cn(
                    "text-sm",
                    checkedItems.has(id) ? "text-brand-500 line-through" : "text-brand-700"
                  )}>
                    {concept}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Definitions */}
        <div className="bg-white rounded-xl border-2 border-brand-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-brand-900">Key Definitions</h3>
          </div>
          <div className="space-y-3">
            {summarySheet.definitions?.map((def, idx) => (
              <div key={idx} className="p-3 bg-brand-50 rounded-lg">
                <p className="font-medium text-brand-800 mb-1">{def.term}</p>
                <p className="text-sm text-brand-600">{def.definition}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulas (if any) */}
        {summarySheet.formulas && summarySheet.formulas.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-brand-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="h-5 w-5 text-brand-600" />
              <h3 className="font-semibold text-brand-900">Key Formulas</h3>
            </div>
            <div className="space-y-3">
              {summarySheet.formulas.map((formula, idx) => (
                <div key={idx} className="p-3 bg-gradient-to-br from-brand-50 to-accent-50 rounded-lg">
                  <p className="font-medium text-brand-800 mb-1">{formula.name}</p>
                  <p className="font-mono text-lg text-brand-900 bg-white px-3 py-2 rounded-lg mb-2">
                    {formula.formula}
                  </p>
                  <p className="text-sm text-brand-600">{formula.usage}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exam Tips */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Exam Tips</h3>
          </div>
          <ul className="space-y-2">
            {summarySheet.exam_tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">💡</span>
                <span className="text-sm text-amber-800">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 p-4 bg-brand-50 rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-600">
            {checkedItems.size} of {summarySheet.key_concepts.length} concepts reviewed
          </span>
          <div className="w-32 progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${(checkedItems.size / summarySheet.key_concepts.length) * 100}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
