"use client";

import {
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// the duration picker's spring, damped so nothing overshoots
const SPRING = { type: "spring", stiffness: 200, damping: 28, mass: 1 } as const;

// the neck has thinned to nothing by the time the gap is this far open
const NECK_BREAK = 0.22;

// nominal viewBox height; the svg stretches to whatever the tile actually is
const NECK_H = 100;

const FADE_IN = "transition-colors duration-[400ms]";
const FADE_OUT = "transition-colors duration-0";

const DEFAULT_BAR = "bg-slate-100 dark:bg-slate-800";
const DEFAULT_BAR_TEXT = "text-slate-100 dark:text-slate-800";

const SIZES = {
  xs: {
    label: "gap-1 px-2.5 py-1 text-caption font-bold leading-4 [&_svg]:size-3",
    radius: 8,
    separation: 12,
  },
  sm: {
    label: "gap-1.5 px-3 py-1.5 text-xs font-bold leading-4 [&_svg]:size-3.5",
    radius: 10,
    separation: 16,
  },
  md: {
    label: "gap-2 px-3.5 py-2 text-xs font-bold leading-5 [&_svg]:size-3.5",
    radius: 10,
    separation: 18,
  },
  lg: {
    label: "gap-2.5 px-5 py-2.5 text-sm font-bold leading-6 [&_svg]:size-4",
    radius: 12,
    separation: 22,
  },
} as const;

export type GooeyNavSize = keyof typeof SIZES;

export type NavItem = {
  label: ReactNode;
  value?: string | number;
  href?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  className?: string;
};

export type GooeyNavItem = string | NavItem;

const toItem = (item: GooeyNavItem): NavItem =>
  typeof item === "string" ? { label: item, value: item } : item;

export type GooeyNavProps = Omit<ComponentProps<"nav">, "onChange"> & {
  items: GooeyNavItem[];
  value?: number | string;
  defaultValue?: number | string;
  onChange?: (index: number, item?: NavItem) => void;
  onValueChange?: (value: string) => void;
  size?: GooeyNavSize;
  activeColor?: string;
  activeLabelColor?: string;
  barClassName?: string;
  barTextClassName?: string;
  separation?: number;
  radius?: number;
};

// two concave curves pinching toward the middle, drawn in the gap the tiles leave
function neckPath(gap: number, span: number) {
  // a NaN or negative span would otherwise emit a path full of NaN coordinates
  if (!Number.isFinite(gap) || !Number.isFinite(span) || gap <= 0 || span <= 0) {
    return "";
  }
  const waist = NECK_H * (1 - gap / (span * NECK_BREAK));
  if (waist <= 0) return "";
  const start = span - gap;
  const mid = start + gap / 2;
  return `M${start} 0 Q${mid} ${NECK_H - waist} ${span} 0 L${span} ${NECK_H} Q${mid} ${waist} ${start} ${NECK_H} Z`;
}

type SegmentProps = {
  gap: number;
  span: number;
  hasSeam: boolean;
  leftFill: string;
  rightFill: string;
  reduced: boolean;
  radii: Record<string, number>;
  className?: string;
  barTextClassName: string;
  style?: CSSProperties;
  children: ReactNode;
};

function Segment({
  gap,
  span,
  hasSeam,
  leftFill,
  rightFill,
  reduced,
  radii,
  className,
  barTextClassName,
  style,
  children,
}: SegmentProps) {
  const marginLeft = useSpring(gap, SPRING);
  const gradientId = `gooey-neck-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    if (reduced) marginLeft.jump(gap);
    else marginLeft.set(gap);
  }, [gap, marginLeft, reduced]);

  const d = useTransform(marginLeft, (g) => neckPath(g, span));

  return (
    <motion.li
      data-slot="gooey-nav-segment"
      className={cn("relative shrink-0", className)}
      style={{ ...style, marginLeft }}
      initial={false}
      animate={radii}
      transition={reduced ? { duration: 0 } : SPRING}
    >
      {hasSeam && (
        <svg
          aria-hidden
          width={span}
          viewBox={`0 0 ${span} ${NECK_H}`}
          preserveAspectRatio="none"
          className={cn(
            "pointer-events-none absolute top-0 right-full h-full",
            barTextClassName,
          )}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1">
              <stop offset="0" stopColor={leftFill} />
              <stop offset="1" stopColor={rightFill} />
            </linearGradient>
          </defs>
          <motion.path d={d} fill={`url(#${gradientId})`} />
        </svg>
      )}
      {children}
    </motion.li>
  );
}

type NavLabelProps = NavItem & {
  isActive: boolean;
  size: GooeyNavSize;
  activeLabelColor: string;
  onSelect: () => void;
};

function NavLabel({
  label,
  href,
  icon,
  badge,
  className,
  isActive,
  size,
  activeLabelColor,
  onSelect,
}: NavLabelProps) {
  const props = {
    "data-slot": "gooey-nav-item",
    "data-active": isActive,
    "aria-current": isActive ? (href ? "page" : true) : undefined,
    className: cn(
      "flex cursor-pointer items-center justify-center whitespace-nowrap font-bold transition-colors select-none [&_svg]:shrink-0 [&_svg]:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-1 rounded-[inherit]",
      isActive ? FADE_IN : FADE_OUT,
      SIZES[size].label,
      !isActive && "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
      className,
    ),
    style: isActive ? { color: activeLabelColor } : undefined,
    onClick: onSelect,
  } as const;

  return href ? (
    <Link href={href} {...props}>
      {icon}
      <span>{label}</span>
      {badge}
    </Link>
  ) : (
    <button type="button" {...props}>
      {icon}
      <span>{label}</span>
      {badge}
    </button>
  );
}

export function GooeyNav({
  items,
  value,
  defaultValue = 0,
  onChange,
  onValueChange,
  size = "md",
  activeColor = "#1738D1",
  activeLabelColor = "#ffffff",
  barClassName = DEFAULT_BAR,
  barTextClassName = DEFAULT_BAR_TEXT,
  separation,
  radius,
  className,
  ...props
}: GooeyNavProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;

  const routeIndex = items.findIndex((item) => {
    const it = toItem(item);
    return it.href && pathname ? it.href === pathname : false;
  });

  const getIndexFromValue = (val: string | number | undefined): number => {
    if (val === undefined) return -1;
    if (typeof val === "number") return val >= 0 && val < items.length ? val : -1;
    return items.findIndex((item) => {
      const it = toItem(item);
      return it.value === val || it.label === val;
    });
  };

  const initialIndex = () => {
    const valIndex = getIndexFromValue(value ?? defaultValue);
    if (valIndex !== -1) return valIndex;
    if (routeIndex !== -1) return routeIndex;
    return 0;
  };

  const [uncontrolled, setUncontrolled] = useState<number>(initialIndex);
  const [seenRoute, setSeenRoute] = useState(routeIndex);

  // in render, not an effect: an effect here cascades renders
  if (routeIndex !== seenRoute) {
    setSeenRoute(routeIndex);
    if (routeIndex !== -1 && value === undefined) setUncontrolled(routeIndex);
  }

  const activeIndex = typeof value !== "undefined" ? getIndexFromValue(value) : uncontrolled;
  const active = activeIndex !== -1 ? activeIndex : (uncontrolled >= 0 && uncontrolled < items.length ? uncontrolled : 0);

  const span = separation ?? SIZES[size].separation;
  const corner = radius ?? SIZES[size].radius;

  const open = (seam: number) =>
    seam === 0 ||
    seam === items.length ||
    seam - 1 === active ||
    seam === active;

  const fill = (i: number) => (i === active ? activeColor : "currentColor");

  return (
    <nav
      data-slot="gooey-nav"
      className={cn("inline-block max-w-full overflow-x-auto no-scrollbar py-0.5", className)}
      {...props}
    >
      <ul className="flex items-center min-w-max" role="tablist">
        {items.map((item, i) => {
          const navItem = toItem(item);
          const isActive = i === active;
          const key = typeof navItem.value !== "undefined"
            ? String(navItem.value)
            : typeof navItem.label === "string"
              ? navItem.label
              : String(i);

          return (
            <Segment
              key={key}
              // closed seams pull in a pixel so no hairline shows through
              gap={i === 0 ? 0 : open(i) ? span : -1}
              span={span}
              hasSeam={i > 0}
              leftFill={fill(i - 1)}
              rightFill={fill(i)}
              reduced={reduced}
              radii={{
                borderTopLeftRadius: open(i) ? corner : 0,
                borderBottomLeftRadius: open(i) ? corner : 0,
                borderTopRightRadius: open(i + 1) ? corner : 0,
                borderBottomRightRadius: open(i + 1) ? corner : 0,
              }}
              className={cn(barClassName, isActive ? FADE_IN : FADE_OUT)}
              barTextClassName={barTextClassName}
              style={{ backgroundColor: isActive ? activeColor : undefined }}
            >
              <NavLabel
                {...navItem}
                isActive={isActive}
                size={size}
                activeLabelColor={activeLabelColor}
                onSelect={() => {
                  if (value === undefined) setUncontrolled(i);
                  onChange?.(i, navItem);
                  const resolvedVal = navItem.value !== undefined
                    ? navItem.value
                    : typeof navItem.label === "string"
                      ? navItem.label
                      : String(i);
                  onValueChange?.(String(resolvedVal));
                }}
              />
            </Segment>
          );
        })}
      </ul>
    </nav>
  );
}
