import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold whitespace-nowrap rounded-[10px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2 cursor-pointer forced-colors:border forced-colors:border-[ButtonText] [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-cobalt-500 text-white shadow-md shadow-cobalt-500/20 hover:bg-cobalt-600 active:scale-[0.98]",
        secondary:
          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white active:scale-[0.98]",
        brand:
          "bg-navy-700 text-white shadow-md hover:bg-navy-800 active:scale-[0.98]",
        ghost:
          "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
        danger:
          "bg-rose-600 text-white shadow-md hover:bg-rose-700 active:scale-[0.98]",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100",
        subtle:
          "bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-[0.98]",
        link:
          "text-cobalt-500 underline-offset-4 hover:underline p-0 h-auto font-normal shadow-none",
      },
      size: {
        sm: "h-10 px-3.5 gap-1.5 text-xs [&_svg]:size-4",
        md: "h-[40px] px-4 gap-2 text-sm [&_svg]:size-[16px]",
        lg: "h-[48px] px-5 gap-2 text-[15px] [&_svg]:size-[18px]",
        // Fallback backward-compatibility aliases
        default: "h-[40px] px-4 gap-2 text-sm [&_svg]:size-[16px]",
        icon: "size-[40px] p-0 justify-center [&_svg]:size-4",
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
        type={props.type || "button"}
        suppressHydrationWarning
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading ? "true" : undefined}
        {...props}
      >
        {loading && (
          <div
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none shrink-0"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
