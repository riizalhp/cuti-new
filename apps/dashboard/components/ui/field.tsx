import * as React from "react";
import { cn } from "@/lib/utils";

export const inputClassName =
  "h-[40px] px-3.5 text-sm rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full";

export const textareaClassName =
  "px-3.5 py-2.5 text-sm rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full resize-y min-h-[80px]";

export interface FieldProps {
  id?: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string | null;
  optional?: boolean;
  required?: boolean;
  className?: string;
  children:
    | React.ReactNode
    | ((props: {
        id: string;
        "aria-describedby"?: string;
        "aria-invalid"?: boolean;
        hasError: boolean;
      }) => React.ReactNode);
}

export function Field({
  id: customId,
  label,
  hint,
  error,
  optional,
  required,
  className,
  children,
}: FieldProps) {
  const generatedId = React.useId();
  const id = customId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const hasError = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={id}
            className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1 cursor-pointer select-none"
          >
            {label}
            {required && (
              <span className="text-rose-700 dark:text-rose-400" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {optional && (
            <span className="text-caption text-slate-500 dark:text-slate-500">
              Opsional
            </span>
          )}
        </div>
      )}

      <div>
        {typeof children === "function"
          ? children({
              id,
              "aria-describedby": describedBy,
              "aria-invalid": hasError ? true : undefined,
              hasError,
            })
          : React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              id: (children.props as any).id ?? id,
              "aria-describedby":
                (children.props as any)["aria-describedby"] ?? describedBy,
              "aria-invalid":
                (children.props as any)["aria-invalid"] ??
                (hasError ? true : undefined),
              className: cn(
                (children.props as any).className,
                hasError && "border-rose-500 focus-visible:ring-rose-500"
              ),
            })
          : children}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-caption text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1.5"
        >
          <svg
            className="size-3.5 shrink-0"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="7" />
            <line x1="8" y1="4" x2="8" y2="9" />
            <circle cx="8" cy="12" r="0.5" fill="currentColor" />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={hintId} className="text-caption text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          inputClassName,
          hasError && "border-rose-500 focus-visible:ring-rose-500",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          textareaClassName,
          hasError && "border-rose-500 focus-visible:ring-rose-500",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
