import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "rounded-[10px]-[28px] border border-white/[0.18] backdrop-blur-[16px] backdrop-saturate-[180%] transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white/10 shadow-[0_4px_6px_rgba(0,0,0,0.05),0_10px_15px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)]",
        medium: "bg-white/15",
        heavy: "bg-white/25",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      hover: {
        true: "hover:transform hover:-translate-y-1 hover:scale-[1.01] cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      hover: false,
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ variant, padding, hover }), className)}
        style={{
          transition: "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };
