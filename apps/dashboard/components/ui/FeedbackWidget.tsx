'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';

interface FeedbackWidgetProps {
  feature: string;
  contextId?: string;
  userId: string;
  className?: string;
}

export function FeedbackWidget({ feature, contextId, userId, className = '' }: FeedbackWidgetProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (finalRating: number) => {
    if (sending) return;
    setSending(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          feature,
          context_id: contextId,
          rating: finalRating,
          comment: comment || null,
          page_path: typeof window !== 'undefined' ? window.location.pathname : null,
        }),
      });
      setSubmitted(true);
    } catch {
      // silent fail
    } finally {
      setSending(false);
    }
  };

  const handleThumb = (value: number) => {
    setRating(value);
    if (value === -1) {
      setShowComment(true);
    } else {
      submit(value);
    }
  };

  if (submitted) {
    return (
      <span className={`text-xs text-emerald-600 font-medium ${className}`}>
        Terima kasih!
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {!showComment ? (
        <>
          <button
            onClick={() => handleThumb(1)}
            disabled={sending}
            className={`p-1.5 rounded-[10px] transition ${
              rating === 1
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
            }`}
            title="Ini membantu"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleThumb(-1)}
            disabled={sending}
            className={`p-1.5 rounded-[10px] transition ${
              rating === -1
                ? 'bg-rose-100 text-rose-600'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
            }`}
            title="Ini kurang membantu"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Apa yang bisa diperbaiki?"
            className="px-2.5 py-1.5 rounded-[10px] border border-slate-200 text-xs text-slate-700 w-48 focus:outline-none focus:ring-1 focus:ring-slate-300"
            autoFocus
          />
          <button
            onClick={() => submit(-1)}
            disabled={sending}
            className="p-1.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 text-white transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
