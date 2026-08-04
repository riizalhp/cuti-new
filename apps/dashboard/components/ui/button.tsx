import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-[0_4px_6px_rgba(99,102,241,0.2),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_12px_rgba(99,102,241,0.3),0_2px_4px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:scale-[0.98]",
        secondary:
          "bg-white/10 backdrop-blur-[12px] border border-white/[0.18] text-[#1F2937] hover:bg-white/15 hover:scale-[1.02]",
        ghost:
          "bg-transparent text-[#6366F1] hover:bg-[#6366F1]/10 hover:rounded-lg",
        danger:
          "bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white shadow-[0_4px_6px_rgba(239,68,68,0.2),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_12px_rgba(239,68,68,0.3),0_2px_4px_rgba(0,0,0,0.15)] hover:-translate-y-0.5",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs",
        sm: "h-9 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        style={{
          transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        {...props}
      >
        {loading ? (
          <>
            <div
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              style={{
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
