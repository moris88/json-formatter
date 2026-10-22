import { columnsOf, formatCell, isTabularRows } from "../utils/csv";

export const ResultTable = ({ rows }: { rows: unknown[] }) => {
  const isTabular = isTabularRows(rows);
  const columns = columnsOf(rows);

  return (
    <div className="overflow-auto max-h-96 border border-slate-200 dark:border-slate-700 rounded-xl">
      <table className="w-full text-sm font-mono text-left">
        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
          <tr>
            <th className="px-3 py-2 text-slate-400 font-medium w-10">#</th>
            {columns.map((c) => (
              <th
                key={c}
                className="px-3 py-2 text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              // biome-ignore lint/suspicious/noArrayIndexKey: le righe non hanno un id stabile
              key={i}
              className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="px-3 py-1.5 text-slate-400">{i + 1}</td>
              {columns.map((c) => (
                <td
                  key={c}
                  className="px-3 py-1.5 text-slate-700 dark:text-slate-300 whitespace-nowrap max-w-xs truncate"
                >
                  {formatCell(
                    isTabular ? (r as Record<string, unknown>)[c] : r,
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
