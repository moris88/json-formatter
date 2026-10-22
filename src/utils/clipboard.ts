/** Legge il testo dagli appunti; in caso di errore avvisa l'utente e restituisce null. */
export const readClipboard = async (): Promise<string | null> => {
  if (!navigator.clipboard?.readText) {
    alert(
      "Il tuo browser non supporta l'accesso programmatico agli appunti. Usa Ctrl+V (o Cmd+V).",
    );
    return null;
  }

  try {
    return await navigator.clipboard.readText();
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
    return null;
  }
};
