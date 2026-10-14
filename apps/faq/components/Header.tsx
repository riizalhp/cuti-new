import Link from "next/link";
import Image from "next/image";
import { SearchBox } from "@/components/SearchBox";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 w-full">
      <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Beranda Employr">
              <div className="flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/logo.webp"
                  alt="Logo Employr"
                  width={120}
                  height={32}
                  priority
                  unoptimized
                  className="h-7 w-auto object-contain dark:brightness-0 dark:invert transition-all group-hover:opacity-90"
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
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
