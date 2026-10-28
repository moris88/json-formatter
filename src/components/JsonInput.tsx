import { json } from "@codemirror/lang-json";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { memo } from "react";

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  onPaste: () => void;
  hasError: boolean;
  isDark: boolean;
}

// Definite fuori dal componente per non ricreare le estensioni a ogni render
const extensions = [json(), EditorView.lineWrapping];
const basicSetup = { foldGutter: true, highlightActiveLine: false };

/**
 * Editor basato su CodeMirror: renderizza solo le righe visibili,
 * quindi resta fluido anche con JSON di diversi MB.
 */
export const JsonInput = memo(
  ({ value, onChange, onPaste, hasError, isDark }: JsonInputProps) => (
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
      <div
        className={`grow min-h-0 overflow-hidden text-sm border-2 rounded-xl focus-within:ring-4 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/40 focus-within:border-blue-500 transition-colors shadow-sm ${
          hasError
            ? "border-red-300 dark:border-red-800"
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <CodeMirror
          id="json-input"
          value={value}
          onChange={onChange}
          extensions={extensions}
          basicSetup={basicSetup}
          theme={isDark ? "dark" : "light"}
          height="100%"
          className="h-full"
          placeholder='{"id": 1, "data": {"user": "Mario", "active": true}}'
        />
      </div>
    </section>
  ),
);
