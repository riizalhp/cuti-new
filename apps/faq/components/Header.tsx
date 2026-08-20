import Link from "next/link";
import Image from "next/image";
import { HelpCircle, BookOpen, ExternalLink } from "lucide-react";
import { SearchBox } from "@/components/SearchBox";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ENV_LABEL, FAQ_ENV, APP_URL } from "@/lib/site";

export function Header() {
  const env = ENV_LABEL[FAQ_ENV];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/logo.webp"
                  alt="Employr"
                  width={120}
                  height={32}
                  unoptimized
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="leading-tight min-w-0">
                <span className="block text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Pusat Bantuan
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  faq.employr.id
                </span>
              </div>
            </Link>

            <span
              className={`px-2 py-0.5 rounded-[10px] text-[10px] font-black border ${env.className} shrink-0`}
              title={`Environment: ${FAQ_ENV}`}
            >
              {env.label}
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Link
              href="/"
              className="px-3 py-2 rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cobalt-600 dark:hover:text-blue-300 transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Artikel
            </Link>
            <Link
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cobalt-600 dark:hover:text-blue-300 transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <Link
              href={APP_URL}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-xs shadow-md shadow-cobalt-500/20 transition cursor-pointer border-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Tanya Herdi
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
