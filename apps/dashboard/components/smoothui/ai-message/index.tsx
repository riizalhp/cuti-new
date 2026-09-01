'use client';

import { cn } from '@/lib/utils';
import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

const COPIED_RESET_MS = 1600;
const ACTION_STAGGER_MS = 30;

const ACTION_STYLES = `
.ai-message-action {
  opacity: 0;
  transform: translateX(var(--ai-message-slide)) scale(0.9);
  transition:
    opacity 200ms cubic-bezier(.23, 1, .32, 1),
    transform 200ms cubic-bezier(.23, 1, .32, 1),
    background-color 150ms ease,
    color 150ms ease;
}
.ai-message-action-agent { --ai-message-slide: -6px; }
.ai-message-action-user { --ai-message-slide: 6px; }
.ai-message-root:hover .ai-message-action,
.ai-message-root:focus-within .ai-message-action {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.ai-message-pop { animation: ai-message-pop 250ms cubic-bezier(.23, 1, .32, 1); }
@keyframes ai-message-pop {
  0% { transform: scale(1); }
  45% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .ai-message-action { transition-duration: 0ms; transition-delay: 0ms !important; transform: none; }
  .ai-message-root:hover .ai-message-action,
  .ai-message-root:focus-within .ai-message-action { transform: none; }
  .ai-message-pop { animation: none; }
}
`;

export type AIMessageAuthor = 'user' | 'assistant';

export type AIMessageProps = {
  avatar?: ReactNode;
  bubble?: boolean;
  children: ReactNode;
  className?: string;
  copyText?: string;
  from?: AIMessageAuthor;
  onRetry?: () => void;
  onVote?: (vote: 'up' | 'down') => void;
  timestamp?: string;
};

export const AIMessage = ({
  avatar,
  bubble = true,
  children,
  className,
  copyText,
  onRetry,
  onVote,
  from = 'assistant',
  timestamp,
}: AIMessageProps) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);

  const isUser = from === 'user';

  useEffect(() => {
    if (!hasCopied) {
      return;
    }
    const timeout = setTimeout(() => setHasCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timeout);
  }, [hasCopied]);

  const copy = async () => {
    if (!copyText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(copyText);
      setHasCopied(true);
    } catch {
      // Ignore clipboard write issues
    }
  };

  const actions = [
    copyText
      ? {
          active: hasCopied,
          icon: hasCopied ? Check : Copy,
          key: 'copy',
          label: hasCopied ? 'Tersalin' : 'Salin',
          onClick: copy,
        }
      : null,
    onRetry
      ? {
          active: false,
          icon: RotateCcw,
          key: 'retry',
          label: 'Ulangi',
          onClick: onRetry,
        }
      : null,
    onVote && !isUser
      ? {
          active: vote === 'up',
          icon: ThumbsUp,
          key: 'up',
          label: 'Jawaban membantu',
          onClick: () => {
            setVote('up');
            onVote('up');
          },
        }
      : null,
    onVote && !isUser
      ? {
          active: vote === 'down',
          icon: ThumbsDown,
          key: 'down',
          label: 'Kurang membantu',
          onClick: () => {
            setVote('down');
            onVote('down');
          },
        }
      : null,
  ].filter((action): action is NonNullable<typeof action> => action !== null);

  return (
    <div
      className={cn(
        'ai-message-root flex w-full gap-2.5',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: ACTION_STYLES }} />

      {avatar ? <div className="mt-0.5 shrink-0">{avatar}</div> : null}

      <div className={cn('flex min-w-0 flex-col gap-1', isUser && 'items-end')}>
        <div
          className={cn(
            'w-fit max-w-prose text-xs leading-relaxed',
            bubble && 'rounded-[10px] p-2.5 shadow-xs',
            bubble && isUser && 'rounded-tr-none bg-[#1738D1] text-white font-medium',
            bubble && !isUser && 'rounded-tl-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100',
            !bubble && 'text-foreground'
          )}
        >
          {children}
        </div>

        <div
          className={cn(
            'flex items-center gap-1 px-1',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          {timestamp ? (
            <span className="text-slate-400 dark:text-slate-500 text-[9px] tabular-nums">
              {timestamp}
            </span>
          ) : null}

          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                aria-label={action.label}
                aria-pressed={action.active}
                className={cn(
                  'ai-message-action cursor-pointer rounded-md p-1',
                  isUser ? 'ai-message-action-user' : 'ai-message-action-agent',
                  action.active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                )}
                key={action.key}
                onClick={action.onClick}
                style={{ transitionDelay: `${index * ACTION_STAGGER_MS}ms` }}
                type="button"
                title={action.label}
              >
                <Icon
                  aria-hidden="true"
                  className={
                    action.key === 'copy' && hasCopied
                      ? 'ai-message-pop'
                      : undefined
                  }
                  key={action.key === 'copy' && hasCopied ? 'copied' : 'idle'}
                  size={12}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIMessage;
