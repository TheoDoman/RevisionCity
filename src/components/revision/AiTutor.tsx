'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, BookmarkPlus } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  flashcard?: { front: string; back: string } | null;
}

interface AiTutorProps {
  subject: string;
  topic: string;
  examBoard?: string;
}

const CHAR_LIMIT = 500;

function parseFlashcard(text: string): { content: string; flashcard: { front: string; back: string } | null } {
  const match = text.match(/\[FLASHCARD:\s*([\s\S]+?)\s*\|\s*([\s\S]+?)\s*\]/);
  if (!match) return { content: text, flashcard: null };
  const content = text.replace(match[0], '').trim();
  return { content, flashcard: { front: match[1].trim(), back: match[2].trim() } };
}

export function AiTutor({ subject, topic, examBoard }: AiTutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI tutor for **${topic}** (${subject}). Ask me anything about this topic and I'll guide you to the answer through questions — that's the best way to make it stick!\n\nWhat would you like to understand better?`,
      flashcard: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedFlashcards, setSavedFlashcards] = useState<Set<string>>(new Set());
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;

    setInput('');
    setRateLimitError(null);

    const userMsg: Message = { role: 'user', content: q, flashcard: null };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build message history for context (exclude the greeting)
    const apiMessages = messages
      .slice(1)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          subject,
          topic,
          examBoard,
          messages: apiMessages,
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setRateLimitError(`Too many requests. Please wait ${data.retryAfter ?? 60} seconds.`);
        setMessages(prev => prev.slice(0, -1)); // remove user msg
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to connect to tutor');
      }

      const { content, flashcard } = parseFlashcard(data.reply ?? '');
      setMessages(prev => [...prev, { role: 'assistant', content, flashcard }]);
    } catch (err) {
      console.error('[AiTutor]', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble connecting. Please try again.',
          flashcard: null,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const saveFlashcard = (front: string, back: string) => {
    // In a future sprint this would persist to Supabase; for now just mark saved
    setSavedFlashcards(prev => { const s = new Set(prev); s.add(front); return s; });
  };

  const remaining = CHAR_LIMIT - input.length;
  const boardLabel = examBoard === 'edexcel' ? 'Edexcel' : 'Cambridge';

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-900">AI Tutor</p>
            <p className="text-xs text-brand-500">{boardLabel} IGCSE · {topic}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                : 'bg-brand-200'
            }`}>
              {msg.role === 'assistant'
                ? <Bot className="h-4 w-4 text-white" />
                : <User className="h-4 w-4 text-brand-600" />}
            </div>

            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              {/* Bubble */}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-sm'
                  : 'bg-brand-50 text-brand-900 rounded-tl-sm border border-brand-100'
              }`}>
                {msg.content}
              </div>

              {/* Flashcard suggestion */}
              {msg.flashcard && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm w-full">
                  <div className="flex items-center gap-1.5 mb-2 text-amber-700 font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    Flashcard suggestion
                  </div>
                  <p className="text-amber-900 font-medium mb-1">{msg.flashcard.front}</p>
                  <p className="text-amber-700 text-xs">{msg.flashcard.back}</p>
                  <button
                    onClick={() => saveFlashcard(msg.flashcard!.front, msg.flashcard!.back)}
                    disabled={savedFlashcards.has(msg.flashcard.front)}
                    className={`mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                      savedFlashcards.has(msg.flashcard.front)
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                    }`}
                  >
                    <BookmarkPlus className="h-3 w-3" />
                    {savedFlashcards.has(msg.flashcard.front) ? 'Saved!' : 'Save to deck'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-brand-50 border border-brand-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Rate limit error */}
      {rateLimitError && (
        <p className="text-xs text-red-600 mb-2 text-center">{rateLimitError}</p>
      )}

      {/* Input area */}
      <div className="border border-brand-200 rounded-xl focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all bg-white">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value.slice(0, CHAR_LIMIT))}
          onKeyDown={handleKey}
          placeholder={`Ask about ${topic}... (Shift+Enter for new line)`}
          rows={2}
          disabled={loading}
          className="w-full px-4 pt-3 pb-1 text-sm resize-none outline-none rounded-t-xl bg-transparent text-brand-900 placeholder:text-brand-400 disabled:opacity-50"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <span className={`text-xs ${remaining < 50 ? 'text-red-500' : 'text-brand-400'}`}>
            {remaining} chars left
          </span>
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-40 transition-all"
          >
            <Send className="h-3 w-3" />
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}
