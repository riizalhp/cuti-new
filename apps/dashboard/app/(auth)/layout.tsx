import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden flex items-center justify-center font-sans">
      {/* Soft decorative background gradients matching dashboard interior */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-blue-500/5 dark:bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/2 translate-x-1/2 translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-600/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

