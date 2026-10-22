export const QueryHelp = () => (
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
