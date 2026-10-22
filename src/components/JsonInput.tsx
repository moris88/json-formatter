interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  onPaste: () => void;
  hasError: boolean;
}

export const JsonInput = ({
  value,
  onChange,
  onPaste,
  hasError,
}: JsonInputProps) => (
  <section className="flex flex-col gap-2 h-[60vh] min-h-87.5 max-h-175">
    <div className="flex items-center justify-between">
      <label
        htmlFor="json-input"
        className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
      >
        JSON Grezzo
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPaste}
          className="text-xs font-medium px-2 py-1 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-md transition-colors border border-blue-100 dark:border-blue-900"
        >
          Incolla
        </button>
      </div>
    </div>
    <textarea
      id="json-input"
      className={`w-full grow min-h-0 p-4 font-mono text-sm border-2 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 dark:text-slate-200 outline-none transition-all resize-none shadow-sm ${
        hasError
          ? "border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      }`}
      placeholder='{"id": 1, "data": {"user": "Mario", "active": true}}'
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </section>
);
