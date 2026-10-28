interface HistoryBarProps {
  history: string[];
  onSelect: (item: string) => void;
}

export const HistoryBar = ({ history, onSelect }: HistoryBarProps) => {
  if (history.length === 0) return null;
  return (
    <section className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        Cronologia Recenti
      </h2>
      <div className="flex flex-wrap gap-2">
        {history.map((item) => (
          <button
            key={`${item.length}-${item.slice(0, 50)}-${item.slice(-50)}`}
            type="button"
            onClick={() => onSelect(item)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-500 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all truncate max-w-37.5 shadow-sm active:scale-95"
          >
            {item.slice(0, 15)}...
          </button>
        ))}
      </div>
    </section>
  );
};
