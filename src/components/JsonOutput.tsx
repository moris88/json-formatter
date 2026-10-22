import { ErrorMessage } from "./ErrorMessage";
import { JsonTreeView } from "./JsonTreeView";

interface JsonOutputProps {
  data: unknown;
  error: string | null;
  onCopy: () => void;
}

export const JsonOutput = ({ data, error, onCopy }: JsonOutputProps) => (
  <section className="flex flex-col gap-2 h-[60vh] min-h-87.5 max-h-175">
    <div className="flex items-center justify-between">
      <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        Vista Struttura (Collassabile)
      </span>
      <button
        type="button"
        onClick={onCopy}
        disabled={!data}
        className="text-xs font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
      >
        Copia
      </button>
    </div>
    <div className="grow relative group overflow-hidden flex flex-col gap-4">
      {error && <ErrorMessage message={error} />}
      {data ? (
        <JsonTreeView data={data} />
      ) : (
        !error && (
          <div className="grow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 pointer-events-none italic text-sm text-center px-4">
            In attesa di formattazione...
          </div>
        )
      )}
    </div>
  </section>
);
