import Link from "next/link";
import Image from "next/image";
import { APP_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[10px] bg-navy-700 flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src="/logo.webp"
                alt="Employr"
                width={28}
                height={28}
                unoptimized
                className="w-5.5 h-5.5 object-contain brightness-0 invert"
              />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                Pusat Bantuan Employr
              </p>
              <p className="text-[11px] text-slate-400">
                Dokumentasi & panduan penggunaan platform karier Employr
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-cobalt-600 dark:hover:text-blue-300 transition">
              Beranda
            </Link>
            <Link href={APP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-cobalt-600 dark:hover:text-blue-300 transition">
              Dashboard (app.employr.id)
            </Link>
            <Link href="https://employr.id" target="_blank" rel="noopener noreferrer" className="hover:text-cobalt-600 dark:hover:text-blue-300 transition">
              employr.id
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>© 2026 Employr</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
