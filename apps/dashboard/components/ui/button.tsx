import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3BD9] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-[#0D3BD9] text-white shadow-md hover:bg-[#0B33BD] hover:-translate-y-0.5 active:scale-[0.98]",
        secondary:
          "bg-white/10 backdrop-blur-[12px] border border-white/[0.18] text-[#1F2937] hover:bg-white/15 hover:scale-[1.02]",
        ghost:
          "bg-transparent text-[#0D3BD9] hover:bg-[#0D3BD9]/10 hover:rounded-lg",
        danger:
          "bg-[#EF4444] text-white shadow-md hover:bg-[#DC2626] hover:-translate-y-0.5",
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
