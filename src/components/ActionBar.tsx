interface ActionBarProps {
  onFormat: () => void;
  onClear: () => void;
}

export const ActionBar = ({ onFormat, onClear }: ActionBarProps) => (
  <footer className="flex gap-3 items-center justify-center p-3 md:p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl sticky bottom-4 z-10">
    <button
      type="button"
      onClick={onFormat}
      className="grow md:flex-none md:px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-950 transition-all active:scale-95 text-sm md:text-base"
    >
      Formatta & Naviga
    </button>
    <button
      type="button"
      onClick={onClear}
      className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl transition-all text-sm md:text-base"
    >
      Pulisci
    </button>
  </footer>
);
