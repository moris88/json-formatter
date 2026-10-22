interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  showRaw: boolean;
  onToggleRaw: () => void;
}

export const Header = ({
  isDark,
  onToggleTheme,
  showRaw,
  onToggleRaw,
}: HeaderProps) => (
  <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
        JSON <span className="text-blue-600 dark:text-blue-400">Formatter</span>
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
        Valida, formatta e naviga il tuo codice JSON con nodi collassabili. Cerca usando le query in stile SQL o genera le interfacce TypeScript corrispondenti. Scopri un modo semplice per gestire i tuoi dati JSON.
      </p>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleTheme}
        title={isDark ? "Modalità chiara" : "Modalità scura"}
        className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
      >
        {isDark ? "☀️" : "🌙"}
      </button>
      <button
        type="button"
        onClick={onToggleRaw}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 text-nowrap hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
      >
        {showRaw ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Nascondi</title>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            Nascondi Editor
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Mostra</title>
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
            Mostra Editor
          </>
        )}
      </button>
    </div>
  </header>
);
