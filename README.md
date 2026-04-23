# claudia-portfolio

Portfolio personale di **Xia Jie Xin (Claudia)** — developer iOS & creative technologist, Milano.

Live: [angeloazzzzurro.github.io/claudia-portfolio](https://angeloazzzzurro.github.io/claudia-portfolio) · Deploy: Vercel

---

## Stack

| Layer | Tecnologia |
|---|---|
| Markup | HTML5 vanilla (`lang="it"`) |
| Stili | CSS custom (`portfolio.css`) |
| Script | ES Modules vanilla (nessun framework) |
| Dati GitHub | GitHub REST API v3 + snapshot statico (`github-data.json`) |
| Font | Google Fonts — DM Serif Display, Syne, DM Mono |
| Testing | Puppeteer (smoke test) |
| Deploy | Vercel |

---

## Struttura

```
public/
├── index.html          # SPA principale (home, explore, cv, contact)
├── portfolio.css       # Tutti gli stili
├── github-data.json    # Snapshot GitHub (generato da npm run build)
├── js/
│   ├── main.js         # Entry point (ES module)
│   ├── data.js         # Dati statici: progetti, SVG, analisi
│   ├── github.js       # Fetch GitHub API + rendering sezione explore
│   ├── sphere.js       # Sfera 3D, griglia explore, modal analisi
│   └── ui.js           # Dark mode, nav, cursor, form contatti, mappa CV
├── cv.html             # Pagina CV standalone (stampa)
├── mockups/            # SVG/PNG mockup progetti
└── progetti/           # Pagine dettaglio: angel.html, metime.html, ecc.
scripts/
└── fetch-github-data.js  # Genera github-data.json
tests/
└── smoke.test.js       # Test Puppeteer
```

---

## Avvio locale

```bash
# Installa le dipendenze (solo Puppeteer per i test)
npm install

# Aggiorna i dati GitHub (opzionale, richiede token per rate limit elevato)
GITHUB_TOKEN=ghp_xxx npm run build

# Avvia un server statico — qualsiasi server funziona
npx serve public
# oppure
npx http-server public
```

Apri `http://localhost:3000` (o la porta indicata dal server).

### Variabili d'ambiente

| Variabile | Obbligatoria | Descrizione |
|---|---|---|
| `GITHUB_TOKEN` | No | Personal Access Token GitHub per aumentare il rate limit durante il build |

Crea un file `.env` nella root (non committarlo):
```
GITHUB_TOKEN=ghp_il_tuo_token
```

---

## Test

```bash
npm test
```

Esegue uno smoke test con Puppeteer: carica `index.html`, verifica assenza di errori JS, controlla il titolo e i link principali.

---

## Deploy

Il sito è configurato per Vercel. Il build command da impostare nel progetto Vercel:

```
npm run build
```

Output directory: `public`

---

## Progetti nel portfolio

| Progetto | Stack | Link |
|---|---|---|
| METIME | SwiftUI · SpriteKit · SwiftData | [repo](https://github.com/angeloazzzzurro/METIME) |
| Angel | Python · FastAPI · Anthropic SDK | [repo](https://github.com/angeloazzzzurro/Angel) |
| Claude × Codex | Next.js · PyTorch · Claude API | [repo](https://github.com/angeloazzzzurro/claude-codex) |
| EthnicalBox | React · Vite | [repo](https://github.com/angeloazzzzurro/ethnichalbox) |
| Luna Flow | HTML · CSS · JS vanilla | — |
| Portfolio (questo) | HTML · CSS · ES Modules | [repo](https://github.com/angeloazzzzurro/claudia-portfolio) |
