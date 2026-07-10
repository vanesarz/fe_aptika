import * as React from "react";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  className?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

export default function Table<T>({
  columns,
  data,
  loading = false,
  emptyText = "Tidak ada data tersedia.",
  className = "",
}: TableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-100 bg-white ${className}`}>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-400 font-medium">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Loading data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 font-medium">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50/40 transition-colors">
                {columns.map((col, colIndex) => {
                  const val = col.accessor ? row[col.accessor] : undefined;
                  return (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 text-slate-700 whitespace-nowrap align-middle ${col.className || ""}`}
                    >
                      {col.render ? col.render(val, row, rowIndex) : String(val ?? "")}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
export { Table };