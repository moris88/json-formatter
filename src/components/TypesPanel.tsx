import { useState } from "react";
import { generateTypes } from "../utils/typegen";

export const TypesPanel = ({ data }: { data: unknown }) => {
  const [rootName, setRootName] = useState("Root");
  const [useType, setUseType] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = (opts: { rootName: string; useType: boolean }) =>
    setOutput(generateTypes(data, opts));

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Interfacce TypeScript
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            Nome radice
            <input
              value={rootName}
              onChange={(e) => {
                setRootName(e.target.value);
                if (output) generate({ rootName: e.target.value, useType });
              }}
              className="w-32 px-2 py-1 font-mono text-xs border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 dark:text-slate-200 outline-none focus:border-blue-500"
            />
          </label>
          <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={useType}
              onChange={(e) => {
                setUseType(e.target.checked);
                if (output) generate({ rootName, useType: e.target.checked });
              }}
            />
            usa <code className="font-mono text-xs">type</code>
          </label>
          <button
            type="button"
            onClick={() => generate({ rootName, useType })}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-colors"
          >
            Genera Interfacce
          </button>
          {output && (
            <button
              type="button"
              onClick={copy}
              className="text-xs font-medium px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors border border-slate-200 dark:border-slate-700"
            >
              {copied ? "Copiato!" : "Copia"}
            </button>
          )}
        </div>
      </div>
      {output && (
        <pre className="p-4 font-mono text-sm overflow-auto max-h-125 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-left text-slate-800 dark:text-slate-200">
          {output}
        </pre>
      )}
    </section>
  );
};
