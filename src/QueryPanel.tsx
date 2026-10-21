import { type ReactNode, useState } from "react";
import { runQuery } from "./query";

const EXAMPLES = [
  "SELECT * FROM $",
  "SELECT name, age FROM users WHERE age > 30 ORDER BY age DESC",
  "SELECT city, COUNT(*) AS totale FROM users GROUP BY city",
  "SELECT * FROM data.items WHERE name LIKE 'a%' LIMIT 10",
];

const formatCell = (v: unknown) => {
  if (v === undefined) return "";
  if (v === null) return "null";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

const isTabularRows = (rows: unknown[]) =>
  rows.every((r) => r !== null && typeof r === "object" && !Array.isArray(r));

const columnsOf = (rows: unknown[]) =>
  isTabularRows(rows)
    ? [...new Set(rows.flatMap((r) => Object.keys(r as object)))]
    : ["valore"];

const toCsv = (rows: unknown[]) => {
  const isTabular = isTabularRows(rows);
  const columns = columnsOf(rows);
  const csvCell = (v: unknown) => {
    const s = formatCell(v);
    return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) =>
    columns
      .map((c) => csvCell(isTabular ? (r as Record<string, unknown>)[c] : r))
      .join(","),
  );
  return [columns.map(csvCell).join(","), ...lines].join("\r\n");
};

const downloadCsv = (rows: unknown[]) => {
  // BOM per far riconoscere UTF-8 a Excel
  const blob = new Blob(["﻿", toCsv(rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "risultati.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const QueryHelp = () => (
  <details className="group text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg">
    <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none font-medium list-none [&::-webkit-details-marker]:hidden">
      <span className="text-[10px] text-slate-400 transition-transform group-open:rotate-90">
        ▶
      </span>
      Come scrivere le query
    </summary>
    <div className="px-4 pb-3 flex flex-col gap-2 text-xs leading-relaxed">
      <p>
        <code className="font-mono">
          SELECT campi FROM percorso [WHERE ...] [GROUP BY ...] [ORDER BY ...]
          [LIMIT n [OFFSET m]]
        </code>
      </p>
      <ul className="list-disc pl-5 flex flex-col gap-1">
        <li>
          <b>FROM</b>: percorso dell'array da interrogare (es.{" "}
          <code className="font-mono">data</code>,{" "}
          <code className="font-mono">result.items</code>,{" "}
          <code className="font-mono">a.b[0]</code>).{" "}
          <code className="font-mono">$</code> è la radice: se è un oggetto,
          viene trattato come una sola riga.
        </li>
        <li>
          <b>SELECT</b>: <code className="font-mono">*</code>, campi anche
          annidati (<code className="font-mono">user.name</code>), alias con{" "}
          <code className="font-mono">AS</code>, aggregati{" "}
          <code className="font-mono">COUNT SUM AVG MIN MAX</code>.
        </li>
        <li>
          <b>WHERE</b>:{" "}
          <code className="font-mono">= != &lt; &lt;= &gt; &gt;=</code>,{" "}
          <code className="font-mono">LIKE 'gpt%'</code> (% = qualsiasi testo, _
          = un carattere), <code className="font-mono">IN ('a','b')</code>,{" "}
          <code className="font-mono">IS [NOT] NULL</code>,{" "}
          <code className="font-mono">AND OR NOT</code> e parentesi.
        </li>
        <li>
          Le stringhe vanno tra apici; i nomi con spazi o caratteri speciali tra
          backtick: <code className="font-mono">`nome campo`</code>.
        </li>
      </ul>
    </div>
  </details>
);

const ResultTable = ({ rows }: { rows: unknown[] }) => {
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

export const QueryPanel = ({
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
              {result.length} {result.length === 1 ? "risultato" : "risultati"}
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
};
