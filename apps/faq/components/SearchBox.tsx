"use client";

import React, { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBoxProps {
  initialValue?: string;
  size?: "md" | "lg";
  autoFocus?: boolean;
}

export function SearchBox({ initialValue = "", size = "md", autoFocus = false }: SearchBoxProps) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();
  const searchInputId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/cari?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full" role="search">
      <label htmlFor={searchInputId} className="sr-only">
        Cari artikel atau panduan bantuan
      </label>
      <Search
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${
          size === "lg" ? "w-5 h-5" : "w-4 h-4"
        }`}
        aria-hidden="true"
      />
      <input
        id={searchInputId}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari jawaban, misalnya: cetak CV, tracker lamaran, evaluasi CV..."
        autoFocus={autoFocus}
        aria-label="Cari jawaban atau panduan"
        className={`w-full rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition shadow-xs ${
          size === "lg"
            ? "pl-11 pr-24 py-3.5 text-sm sm:text-base"
            : "pl-10 pr-20 py-2.5 text-xs sm:text-sm"
        }`}
      />
      <button
        type="submit"
        aria-label="Kirim pencarian"
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-[8px] bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold transition-all cursor-pointer border-0 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 ${
          size === "lg" ? "px-4 py-2 text-xs sm:text-sm" : "px-3 py-1.5 text-xs"
        }`}
      >
        Cari
      </button>
    </form>
  );
}
