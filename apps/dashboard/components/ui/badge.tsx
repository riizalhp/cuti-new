import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-[8px] border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white/15 border-white/20 text-[#1F2937]",
        premium: "bg-[#0D3BD9] border-[#0D3BD9]/30 text-white shadow-sm",
        success: "bg-[#10B981]/20 border-[#10B981]/30 text-[#065F46]",
        warning: "bg-[#F59E0B]/20 border-[#F59E0B]/30 text-[#92400E]",
        error: "bg-[#EF4444]/20 border-[#EF4444]/30 text-[#991B1B]",
        info: "bg-[#3B82F6]/20 border-[#3B82F6]/30 text-[#1E40AF]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      >
        {icon && <span className="inline-flex">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
