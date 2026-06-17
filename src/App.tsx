import { useCallback, useState } from "react";

/**
 * Componente per renderizzare un singolo valore JSON in modo ricorsivo e collassabile
 */
const JsonNode = ({
  value,
  label,
  isLast = true,
}: {
  value: unknown;
  label?: string;
  isLast?: boolean;
  depth?: number;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);

  const toggle = () => setIsCollapsed(!isCollapsed);

  // Colori coerenti con il precedente syntax highlighting
  const colors = {
    key: "text-blue-600 font-medium",
    string: "text-green-600",
    number: "text-orange-600",
    boolean: "text-purple-600 font-bold",
    null: "text-red-500 italic",
    bracket: "text-slate-500",
  };

  const renderLabel = () =>
    label ? <span className={colors.key}>"{label}": </span> : null;

  if (!isObject) {
    let displayValue: string | number | boolean | null = value as
      | string
      | number
      | boolean
      | null;
    let cls = colors.string;

    if (typeof value === "string") {
      displayValue = `"${value}"`;
    } else if (typeof value === "number") {
      cls = colors.number;
    } else if (typeof value === "boolean") {
      cls = colors.boolean;
      displayValue = String(value);
    } else if (value === null) {
      cls = colors.null;
      displayValue = "null";
    }

    return (
      <div className="ml-4 whitespace-nowrap">
        {renderLabel()}
        <span className={cls}>{displayValue}</span>
        {!isLast && <span className={colors.bracket}>,</span>}
      </div>
    );
  }

  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";
  const keys = Object.keys(value as object);
  const valAsObj = value as Record<string, unknown>;

  return (
    <div className="ml-4">
      <button
        type="button"
        className="flex items-center cursor-pointer hover:bg-slate-50 rounded px-1 -ml-1 w-full text-left outline-none focus:ring-1 focus:ring-blue-200"
        onClick={toggle}
      >
        <span
          className="text-[10px] text-slate-400 w-3 inline-block transition-transform duration-200"
          style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
        {renderLabel()}
        <span className={colors.bracket}>{openBracket}</span>
        {isCollapsed && (
          <>
            <span className="text-slate-400 text-xs mx-1">
              {isArray ? ` ... ${valAsObj.length} items ` : " ... "}
            </span>
            <span className={colors.bracket}>{closeBracket}</span>
            {!isLast && <span className={colors.bracket}>,</span>}
          </>
        )}
      </button>

      {!isCollapsed && (
        <>
          <div className="border-l border-slate-200 ml-1.5 pl-1">
            {keys.map((key, index) => (
              <JsonNode
                key={key}
                label={isArray ? undefined : key}
                value={valAsObj[key]}
                isLast={index === keys.length - 1}
              />
            ))}
          </div>
          <div className="ml-0">
            <span className={colors.bracket}>{closeBracket}</span>
            {!isLast && <span className={colors.bracket}>,</span>}
          </div>
        </>
      )}
    </div>
  );
};

const JsonTreeView = ({ data }: { data: unknown }) => {
  if (data === null || data === undefined) return null;
  return (
    <div className="p-4 font-mono text-sm overflow-auto h-full min-h-75 bg-white border border-slate-200 rounded-xl shadow-inner text-left">
      <JsonNode value={data} isLast={true} />
    </div>
  );
};

const ErrorMessage = ({ message }: { message: string }) => {
  if (!message) return null;

  return (
    <div className="flex flex-col gap-2 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-sm">
      <div className="flex items-center gap-2 text-red-700 font-bold">
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
      <p className="text-sm text-red-600 font-mono leading-relaxed">
        {message}
      </p>
      <div className="text-[10px] text-red-400 uppercase font-bold tracking-widest mt-1">
        Suggerimento: Controlla virgole, virgolette e parentesi.
      </div>
    </div>
  );
};

export default function App() {
  const [input, setInput] = useState("");
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(true);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("json_history");
    return saved ? JSON.parse(saved) : [];
  });

  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setParsedData(parsed);
      setError(null);

      // Gestione Storia (max 5)
      setHistory((prev) => {
        const trimmedInput = input.trim();
        const filtered = prev.filter((item) => item !== trimmedInput);
        const newHistory = [trimmedInput, ...filtered].slice(0, 5);
        localStorage.setItem("json_history", JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON non valido");
      setParsedData(null);
    }
  }, [input]);

  const loadFromHistory = (item: string) => {
    setInput(item);
    try {
      setParsedData(JSON.parse(item));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON non valido");
    }
  };

  const clearAll = () => {
    setInput("");
    setParsedData(null);
    setError(null);
  };

  const pasteFromClipboard = async () => {
    if (!navigator.clipboard?.readText) {
      alert(
        "Il tuo browser non supporta l'accesso programmatico agli appunti. Usa Ctrl+V (o Cmd+V).",
      );
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error("Clipboard Read Error:", err);
      if (!window.isSecureContext) {
        alert(
          "L'accesso agli appunti richiede una connessione sicura (HTTPS) o localhost.",
        );
      } else {
        alert(
          "Permesso negato. Controlla le impostazioni del browser per consentire l'accesso agli appunti.",
        );
      }
    }
  };

  const copyToClipboard = () => {
    if (parsedData) {
      const formatted = JSON.stringify(parsedData, null, 2);
      navigator.clipboard.writeText(formatted);
      alert("JSON formattato copiato negli appunti!");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
            JSON <span className="text-blue-600">Formatter</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base">
            Valida, formatta e naviga il tuo codice JSON con nodi collassabili.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
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
      </header>

      {/* Sezione Storia */}
      {history.length > 0 && (
        <section className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Cronologia Recenti
          </h2>
          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => loadFromHistory(item)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all truncate max-w-37.5 shadow-sm active:scale-95"
              >
                {item.slice(0, 15)}...
              </button>
            ))}
          </div>
        </section>
      )}

      <main
        className={`grid grid-cols-1 ${
          showRaw ? "lg:grid-cols-2" : "lg:grid-cols-1"
        } gap-4 md:gap-6 grow overflow-hidden`}
      >
        {/* Input Section */}
        {showRaw && (
          <section className="flex flex-col gap-2 min-h-87.5 lg:h-full">
            <div className="flex items-center justify-between">
              <label
                htmlFor="json-input"
                className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wider"
              >
                JSON Grezzo
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={pasteFromClipboard}
                  className="text-xs font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors border border-blue-100"
                >
                  Incolla
                </button>
              </div>
            </div>
            <textarea
              id="json-input"
              className={`w-full grow p-4 font-mono text-sm border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none shadow-sm ${
                error
                  ? "border-red-300 bg-red-50/30"
                  : "border-slate-200 bg-white"
              }`}
              placeholder='{"id": 1, "data": {"user": "Mario", "active": true}}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </section>
        )}

        {/* Output Section */}
        <section className="flex flex-col gap-2 min-h-87.5 lg:h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Vista Struttura (Collassabile)
            </span>
            <button
              type="button"
              onClick={copyToClipboard}
              disabled={!parsedData}
              className="text-xs font-medium px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
            >
              Copia
            </button>
          </div>
          <div className="grow relative group overflow-hidden flex flex-col gap-4">
            {error && <ErrorMessage message={error} />}
            {parsedData ? (
              <JsonTreeView data={parsedData} />
            ) : (
              !error && (
                <div className="grow bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 pointer-events-none italic text-sm text-center px-4">
                  In attesa di formattazione...
                </div>
              )
            )}
          </div>
        </section>
      </main>

      {/* Action Bar */}
      <footer className="flex gap-3 items-center justify-center p-3 md:p-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl sticky bottom-4 z-10">
        <button
          type="button"
          onClick={formatJson}
          className="grow md:flex-none md:px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95 text-sm md:text-base"
        >
          Formatta & Naviga
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-all text-sm md:text-base"
        >
          Pulisci
        </button>
      </footer>
    </div>
  );
}
