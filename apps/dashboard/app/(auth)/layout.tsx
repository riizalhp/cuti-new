import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#D7D6D5] dark:bg-[#0f1013] relative overflow-hidden flex items-center justify-center">
      {/* Decorative gradient blur blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-violet-500/10 blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/2 translate-x-1/2 translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-violet-500/10 blur-[80px] sm:blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
