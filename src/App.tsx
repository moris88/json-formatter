import { useCallback, useEffect, useState } from "react";
import { ActionBar } from "./components/ActionBar";
import { Header } from "./components/Header";
import { HistoryBar } from "./components/HistoryBar";
import { JsonInput } from "./components/JsonInput";
import { JsonOutput } from "./components/JsonOutput";
import { JsonTreeView } from "./components/JsonTreeView";
import { QueryPanel } from "./components/QueryPanel";
import { TypesPanel } from "./components/TypesPanel";
import { readClipboard } from "./utils/clipboard";
import { loadHistory, pushHistory } from "./utils/history";

export default function App() {
  const [input, setInput] = useState("");
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(true);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [history, setHistory] = useState<string[]>(loadHistory);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }

    try {
      setParsedData(JSON.parse(input));
      setError(null);
      setHistory((prev) => pushHistory(prev, input));
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
    const text = await readClipboard();
    if (text !== null) setInput(text);
  };

  const copyToClipboard = () => {
    if (parsedData) {
      navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
      alert("JSON formattato copiato negli appunti!");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        showRaw={showRaw}
        onToggleRaw={() => setShowRaw(!showRaw)}
      />

      <HistoryBar history={history} onSelect={loadFromHistory} />

      <main
        className={`grid grid-cols-1 ${
          showRaw ? "lg:grid-cols-2" : "lg:grid-cols-1"
        } gap-4 md:gap-6 grow overflow-hidden`}
      >
        {showRaw && (
          <JsonInput
            value={input}
            onChange={setInput}
            onPaste={pasteFromClipboard}
            hasError={!!error}
          />
        )}
        <JsonOutput data={parsedData} error={error} onCopy={copyToClipboard} />
      </main>

      {parsedData !== null && <TypesPanel data={parsedData} />}

      {parsedData !== null && (
        <QueryPanel
          data={parsedData}
          renderJson={(value) => <JsonTreeView data={value} />}
        />
      )}

      <ActionBar onFormat={formatJson} onClear={clearAll} />
    </div>
  );
}
