"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-[10px] text-slate-600 dark:text-slate-400 select-none overflow-x-auto no-scrollbar",
  {
    variants: {
      variant: {
        pill: "bg-slate-100 p-1 dark:bg-slate-800/80 gap-1 border border-slate-200/50 dark:border-slate-700/50",
        underline:
          "w-full justify-start rounded-none border-b border-slate-200 dark:border-slate-800 bg-transparent p-0 gap-4",
      },
    },
    defaultVariants: {
      variant: "pill",
    },
  }
);

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "pill", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:shrink-0 [&_svg]:text-current forced-colors:border",
  {
    variants: {
      variant: {
        pill: "rounded-[8px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:bg-cobalt-500 data-[state=active]:text-white data-[state=active]:shadow-sm forced-colors:data-[state=active]:bg-[Highlight] forced-colors:data-[state=active]:text-[HighlightText]",
        underline:
          "rounded-none border-b-2 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:border-cobalt-500 data-[state=active]:text-cobalt-600 dark:data-[state=active]:text-cobalt-400 pb-2.5 pt-2",
      },
      size: {
        xs: "h-[32px] min-h-[44px] sm:min-h-0 px-3 gap-1.5 text-caption [&_svg]:size-3.5",
        sm: "h-10 min-h-[44px] sm:min-h-[40px] px-3.5 gap-1.5 text-xs [&_svg]:size-4",
        md: "h-[44px] min-h-[44px] px-4 gap-2 text-sm [&_svg]:size-[16px]",
      },
    },
    defaultVariants: {
      variant: "pill",
      size: "md",
    },
  }
);

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant = "pill", size = "md", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, size }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// NavPills: For route/link-based tab navigation (with aria-current="page" instead of role="tab")
export interface NavPillItem {
  label: React.ReactNode;
  href: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  isActive?: boolean;
}

export interface NavPillsProps {
  items: NavPillItem[];
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function NavPills({ items, size = "md", className }: NavPillsProps) {
  return (
    <nav
      aria-label="Navigasi Halaman"
      className={cn(
        "inline-flex items-center gap-1 rounded-[10px] bg-slate-100 p-1 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto no-scrollbar",
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          key={item.href || idx}
          href={item.href}
          aria-current={item.isActive ? "page" : undefined}
          className={cn(
            tabsTriggerVariants({ variant: "pill", size }),
            item.isActive
              ? "bg-cobalt-500 text-white shadow-sm forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          )}
        >
          {item.icon}
          <span>{item.label}</span>
          {item.badge}
        </Link>
      ))}
    </nav>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
