const HISTORY_KEY = "json_history";
const MAX_HISTORY = 5;

export const loadHistory = (): string[] => {
  const saved = localStorage.getItem(HISTORY_KEY);
  return saved ? JSON.parse(saved) : [];
};

/** Aggiunge in testa (senza duplicati), tiene gli ultimi 5 e salva. */
export const pushHistory = (prev: string[], entry: string): string[] => {
  const trimmed = entry.trim();
  const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(
    0,
    MAX_HISTORY,
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
};
