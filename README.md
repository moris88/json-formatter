# JSON Formatter 🚀

Una moderna applicazione web per validare, formattare e navigare strutture JSON complesse con facilità. Sviluppata con le tecnologie più recenti per offrire un'esperienza fluida e reattiva.

![Hero Image](./src/assets/hero.png)

## ✨ Caratteristiche

- **Vista ad Albero Collassabile**: Naviga facilmente attraverso oggetti e array nidificati.
- **Validazione Real-time**: Feedback immediato in caso di errori di sintassi JSON.
- **Syntax Highlighting**: Colori chiari e distinti per chiavi, stringhe, numeri e booleani.
- **Cronologia Locale**: Salvataggio automatico degli ultimi 5 JSON elaborati (tramite `localStorage`).
- **Gestione Appunti**: Pulsanti rapidi per incollare il codice grezzo e copiare la versione formattata.
- **Interfaccia Adattiva**: Editor a comparsa e layout ottimizzato per desktop e mobile.
- **Design Moderno**: UI pulita realizzata con Tailwind CSS 4.

## 🛠️ Stack Tecnologico

- **React 19**: L'ultima versione della libreria per interfacce utente.
- **TypeScript**: Tipizzazione statica per un codice più robusto e manutenibile.
- **Vite 8**: Bundler ultra-veloce per uno sviluppo rapido.
- **Tailwind CSS 4**: Lo stato dell'arte per lo styling utility-first.
- **Biome**: Tooling "all-in-one" per la formattazione e il linting del codice.

## 🚀 Inizia Subito

### Requisiti

- [Node.js](https://nodejs.org/) (versione 20 o superiore consigliata)
- [npm](https://www.npmjs.com/) o [pnpm](https://pnpm.io/)

### Installazione

1. Clona il repository:

   ```bash
   git clone https://github.com/tuo-username/json-formatter.git
   cd json-formatter
   ```

2. Installa le dipendenze:

   ```bash
   npm install
   ```

3. Avvia l'ambiente di sviluppo:

   ```bash
   npm run dev
   ```

### Script Disponibili

- `npm run dev`: Avvia il server di sviluppo Vite.
- `npm run build`: Genera la build ottimizzata per la produzione.
- `npm run lint`: Esegue ESLint per il controllo della qualità del codice.
- `npm run format`: Formatta il codice usando Biome.
- `npm run check`: Esegue controlli di Biome su tutto il progetto.

## 📂 Struttura del Progetto

```text
src/
├── App.tsx          # Logica principale e componenti UI
├── main.tsx         # Entry point dell'applicazione
├── index.css        # Direttive Tailwind e stili globali
└── assets/          # Risorse statiche (immagini, icone)
```

## 📄 Licenza

Questo progetto è distribuito sotto la licenza MIT. Consulta il file `LICENSE` per ulteriori dettagli.

---

Realizzato con ❤️ per semplificare la vita degli sviluppatori.
