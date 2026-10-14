"use client"

import { Skeleton } from "./Skeleton"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  isLoading?: boolean
  skeletonRows?: number
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  skeletonRows = 6,
}: DataTableProps<T>) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20">
                  {columns.map((col, cIdx) => (
                    <td key={String(col.key || cIdx)} className="px-6 py-4">
                      {cIdx === 0 ? (
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-36 rounded-md" />
                          <Skeleton className="h-3 w-24 rounded-md" />
                        </div>
                      ) : cIdx === columns.length - 1 ? (
                        <div className="flex items-center justify-end">
                          <Skeleton className="h-7 w-20 rounded-lg" />
                        </div>
                      ) : (
                        <Skeleton
                          className="h-4 rounded-md"
                          style={{ width: `${Math.floor(45 + ((cIdx * 17 + rIdx * 7) % 40))}%` }}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? null : (
              data.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors ${
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
                      : "hover:bg-slate-50/40 dark:hover:bg-slate-800/30"
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200"
                    >
                      {column.render
                        ? column.render(item)
                        : item[column.key as keyof T]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && data.length === 0 && (
        <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          Tidak ada data yang tersedia
        </div>
      )}
    </div>
  )
}
