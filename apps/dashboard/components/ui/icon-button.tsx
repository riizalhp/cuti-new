import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center shrink-0 rounded-[10px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2 cursor-pointer forced-colors:border forced-colors:border-[ButtonText] active:scale-[0.98] [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        ghost:
          "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
        outline:
          "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
        primary:
          "bg-cobalt-500 text-white hover:bg-cobalt-600 shadow-sm shadow-cobalt-500/20",
        secondary:
          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white",
        danger:
          "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60",
        subtle:
          "bg-white/10 hover:bg-white/20 text-white border border-white/20",
      },
      size: {
        sm: "size-[30px] [&_svg]:size-4",
        md: "size-[40px] [&_svg]:size-[18px]",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  label: string;
  loading?: boolean;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      label,
      title,
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={props.type || "button"}
        aria-label={label}
        title={title ?? label}
        disabled={disabled || loading}
        aria-busy={loading ? "true" : undefined}
        className={cn(iconButtonVariants({ variant, size }), className)}
        {...props}
      >
        {loading ? (
          <div
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none shrink-0"
            aria-hidden="true"
          />
        ) : (
          children
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
