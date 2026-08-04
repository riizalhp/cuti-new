"use client"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="text-left px-6 py-4 text-sm font-semibold text-purple-200"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(item)}
                className={`border-b border-white/5 transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-white/5" : ""
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 text-sm text-white"
                  >
                    {column.render
                      ? column.render(item)
                      : item[column.key as keyof T]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="py-12 text-center text-purple-300">
          No data available
        </div>
      )}
    </div>
  )
}
