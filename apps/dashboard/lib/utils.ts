import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["text-caption"],
    },
  },
});

/**
 * Combines class names with clsx and merges Tailwind classes with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
