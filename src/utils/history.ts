const HISTORY_KEY = "json_history";
const MAX_HISTORY = 5;
// Oltre questa dimensione il JSON non viene salvato in cronologia (quota localStorage ~5MB)
const MAX_ENTRY_LENGTH = 100_000;

export const loadHistory = (): string[] => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/** Aggiunge in testa (senza duplicati), tiene gli ultimi 5 e salva. */
export const pushHistory = (prev: string[], entry: string): string[] => {
  const trimmed = entry.trim();
  if (trimmed.length > MAX_ENTRY_LENGTH) return prev;
  const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(
    0,
    MAX_HISTORY,
  );
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // quota superata: la cronologia resta solo in memoria
  }
  return next;
};
