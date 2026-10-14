"use client";

import React, {
  createContext,
  useContext,
  useState,
  type ComponentProps,
  type HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

// Cult UI Cutout Inverted Corner Geometry
const CORNER_PATH = "M0 200C155.996 199.961 200.029 156.308 200 0V200H0Z";

interface CutoutCardContextValue {
  hovered: boolean;
}

const CutoutCardContext = createContext<CutoutCardContextValue>({ hovered: false });

export function useCutoutCard() {
  return useContext(CutoutCardContext);
}

export type CutoutCornerProps = ComponentProps<"svg"> & {
  size?: number;
};

export function CutoutCorner({
  className,
  size = 24,
  viewBox = "0 0 200 200",
  ...props
}: CutoutCornerProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
      height={size}
      viewBox={viewBox}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d={CORNER_PATH} fill="currentColor" />
    </svg>
  );
}

export type CutoutCardProps = HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
};

export function CutoutCard({
  className,
  children,
  as: Component = "div",
  ...props
}: CutoutCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <CutoutCardContext.Provider value={{ hovered }}>
      <Component
        className={cn(
          "group/cutout relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-xl hover:border-cobalt-300 dark:hover:border-cobalt-700/80 transition-all duration-300",
          className
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        {children}
      </Component>
    </CutoutCardContext.Provider>
  );
}

export type CutoutCardMediaProps = HTMLAttributes<HTMLDivElement>;

export function CutoutCardMedia({ className, ...props }: CutoutCardMediaProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80",
        className
      )}
      {...props}
    />
  );
}

export type CutoutCardInsetLabelProps = HTMLAttributes<HTMLDivElement>;

export function CutoutCardInsetLabel({
  className,
  ...props
}: CutoutCardInsetLabelProps) {
  return (
    <div
      className={cn(
        "absolute z-10 select-none",
        className
      )}
      {...props}
    />
  );
}

export type CutoutCardPinProps = HTMLAttributes<HTMLDivElement>;

export function CutoutCardPin({ className, ...props }: CutoutCardPinProps) {
  return (
    <div
      className={cn(
        "absolute z-10 select-none",
        className
      )}
      {...props}
    />
  );
}

export type CutoutCardContentProps = HTMLAttributes<HTMLDivElement>;

export function CutoutCardContent({
  className,
  ...props
}: CutoutCardContentProps) {
  return (
    <div
      className={cn("p-5 flex-1 flex flex-col", className)}
      {...props}
    />
  );
}

export type CutoutCardFooterProps = HTMLAttributes<HTMLDivElement>;

export function CutoutCardFooter({
  className,
  ...props
}: CutoutCardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4 text-xs",
        className
      )}
      {...props}
    />
  );
}

export type CutoutCardActionProps = HTMLAttributes<HTMLDivElement> & {
  revealOnHover?: boolean;
};

export function CutoutCardAction({
  className,
  revealOnHover = true,
  children,
  ...props
}: CutoutCardActionProps) {
  return (
    <div
      className={cn(
        "absolute z-20 transition-all duration-300 ease-out",
        revealOnHover
          ? "opacity-0 translate-y-2 pointer-events-none group-hover/cutout:opacity-100 group-hover/cutout:translate-y-0 group-hover/cutout:pointer-events-auto"
          : "opacity-100 translate-y-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
