export const ErrorMessage = ({ message }: { message: string }) => {
  if (!message) return null;

  return (
    <div className="flex flex-col gap-2 p-4 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 rounded-r-xl shadow-sm">
      <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Errore</title>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>Errore di Validazione</span>
      </div>
      <p className="text-sm text-red-600 dark:text-red-300 font-mono leading-relaxed">
        {message}
      </p>
      <div className="text-[10px] text-red-400 uppercase font-bold tracking-widest mt-1">
        Suggerimento: Controlla virgole, virgolette e parentesi.
      </div>
    </div>
  );
};
