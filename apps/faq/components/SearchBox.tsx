"use client";

import React, { useState } from "react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/cari?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full" role="search">
      <Search
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${
          size === "lg" ? "w-5 h-5" : "w-4 h-4"
        }`}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari jawaban, misalnya: cetak CV, tracker lamaran, pembayaran..."
        autoFocus={autoFocus}
        className={`w-full rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition shadow-xs ${
          size === "lg"
            ? "pl-11 pr-4 py-3.5 text-sm"
            : "pl-10 pr-4 py-2.5 text-xs"
        }`}
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-[8px] bg-cobalt-500 hover:bg-cobalt-600 text-white text-xs font-bold transition cursor-pointer border-0"
      >
        Cari
      </button>
    </form>
  );
}
