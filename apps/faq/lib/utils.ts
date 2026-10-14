import { twMerge } from "tailwind-merge";

export type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

function toVal(mix: ClassValue): string {
  let k: number;
  let y: any;
  let str = "";

  if (typeof mix === "string" || typeof mix === "number") {
    str += mix;
  } else if (typeof mix === "object") {
    if (Array.isArray(mix)) {
      for (k = 0; k < mix.length; k++) {
        if (mix[k]) {
          if ((y = toVal(mix[k]))) {
            if (str) str += " ";
            str += y;
          }
        }
      }
    } else if (mix !== null) {
      for (const key in mix) {
        if (mix[key]) {
          if (str) str += " ";
          str += key;
        }
      }
    }
  }

  return str;
}

export function cn(...inputs: ClassValue[]): string {
  let i = 0;
  let tmp: ClassValue;
  let x: string;
  let str = "";
  while (i < inputs.length) {
    if ((tmp = inputs[i++])) {
      if ((x = toVal(tmp))) {
        if (str) str += " ";
        str += x;
      }
    }
  }
  return twMerge(str);
}
