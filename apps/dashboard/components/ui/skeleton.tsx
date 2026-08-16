import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-[10px] bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  );
}
