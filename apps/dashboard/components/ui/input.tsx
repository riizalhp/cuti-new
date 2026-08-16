import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#1F2937] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-[10px] bg-white/[0.08] backdrop-blur-[12px] border border-white/[0.12] px-4 py-3 text-base text-[#1F2937] placeholder:text-[#9CA3AF] transition-all duration-200",
              "focus:bg-white/[0.12] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20",
              icon && "pl-12",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[#EF4444]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
