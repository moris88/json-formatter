import { memo, type ReactNode, useState } from "react";
import { downloadCsv } from "../utils/csv";
import { runQuery } from "../utils/query";
import { QueryHelp } from "./QueryHelp";
import { ResultTable } from "./ResultTable";

const EXAMPLES = [
  "SELECT * FROM $",
  "SELECT name, age FROM users WHERE age > 30 ORDER BY age DESC",
  "SELECT city, COUNT(*) AS totale FROM users GROUP BY city",
  "SELECT * FROM data.items WHERE name LIKE 'a%' LIMIT 10",
];

export const QueryPanel = memo(
  ({
    data,
    renderJson,
  }: {
    data: unknown;
    renderJson: (value: unknown) => ReactNode;
  }) => {
    const [sql, setSql] = useState(
      () => localStorage.getItem("json_last_query") ?? "SELECT * FROM $",
    );
    const [result, setResult] = useState<unknown[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<"table" | "json">("table");

    const execute = () => {
      try {
        setResult(runQuery(sql, data));
        setError(null);
        localStorage.setItem("json_last_query", sql);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Query non valida");
        setResult(null);
      }
    };

    const tabClass = (active: boolean) =>
      `px-3 py-1 rounded-md transition-colors ${
        active
          ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
          : "text-slate-500 dark:text-slate-400"
      }`;

    return (
      <section className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <label
            htmlFor="sql-input"
            className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            Query SQL
          </label>
          <span className="text-[10px] text-slate-400 hidden md:inline">
            Ctrl+Invio per eseguire
          </span>
        </div>

        <QueryHelp />

        <div className="flex flex-col md:flex-row gap-2">
          <textarea
            id="sql-input"
            rows={2}
            spellCheck={false}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                execute();
              }
            }}
            className="grow p-3 font-mono text-sm border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 outline-none resize-y"
          />
          <button
            type="button"
            onClick={execute}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
          >
            Esegui
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setSql(ex)}
              className="px-2 py-1 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md hover:text-blue-600 dark:hover:text-blue-400 truncate max-w-full"
            >
              {ex}
            </button>
          ))}
        </div>

        {error && (
          <p className="p-3 text-sm font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 rounded-r-lg">
            {error}
          </p>
        )}

        {result && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {result.length}{" "}
                {result.length === 1 ? "risultato" : "risultati"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadCsv(result)}
                  disabled={result.length === 0}
                  className="px-3 py-1.5 text-xs font-medium bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Converti in CSV
                </button>
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    className={tabClass(view === "table")}
                    onClick={() => setView("table")}
                  >
                    Tabella
                  </button>
                  <button
                    type="button"
                    className={tabClass(view === "json")}
                    onClick={() => setView("json")}
                  >
                    JSON
                  </button>
                </div>
              </div>
            </div>
            {result.length === 0 ? (
              <div className="p-4 text-sm italic text-slate-400 text-center">
                Nessun risultato
              </div>
            ) : view === "table" ? (
              <ResultTable rows={result} />
            ) : (
              <div className="max-h-96 overflow-auto">{renderJson(result)}</div>
            )}
          </div>
        )}
      </section>
    );
  },
);
