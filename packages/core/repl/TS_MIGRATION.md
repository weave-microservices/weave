# TypeScript Migration - Weave REPL

## Übersicht

Migration des Weave REPL von JavaScript zu TypeScript mit vollständiger Typisierung unter Verwendung von Node.js Type Stripping (Node.js >= 22.6.0).

## Datum

2. Dezember 2025

## Voraussetzungen

- **Node.js Version:** >= 22.6.0 (für native TypeScript-Unterstützung mit `--experimental-strip-types`)
- **Keine Build-Tools erforderlich:** Kein TSC, keine Transpiler
- **Native TypeScript-Ausführung:** Node.js führt `.mts` Dateien direkt aus

---

## 1. Dateistruktur-Änderungen

### Umbenennungen

- Alle `.js` Dateien → `.mts` (TypeScript Module)
- Betroffen:
  - `lib/index.js` → `lib/index.mts`
  - `lib/commands/*.js` → `lib/commands/*.mts`
  - `lib/helper/*.js` → `lib/helper/*.mts`
  - `lib/utils/*.js` → `lib/utils/*.mts`

### Dateiübersicht

**Hauptdatei:**

- `lib/index.mts` - REPL Haupteinstiegspunkt

**Commands:**

- `lib/commands/actions.mts` - Aktionen auflisten
- `lib/commands/benchmark.mts` - Service Endpoint benchmarken
- `lib/commands/broadcast.mts` - Event broadcasten
- `lib/commands/call.mts` - Aktion aufrufen
- `lib/commands/clear.mts` - Konsole leeren
- `lib/commands/dcall.mts` - Direkter Aufruf über Node ID
- `lib/commands/emit.mts` - Event emittieren
- `lib/commands/events.mts` - Events auflisten
- `lib/commands/info.mts` - Node-Informationen anzeigen
- `lib/commands/metrics.mts` - Metriken anzeigen
- `lib/commands/nodes.mts` - Verbundene Nodes auflisten
- `lib/commands/services.mts` - Services auflisten

**Helper:**

- `lib/helper/invoke-action.mts` - Action-Aufruf-Helper

**Utils:**

- `lib/utils/cli-ui.mts` - CLI UI Funktionen
- `lib/utils/convert-args.mts` - Argument-Konvertierung
- `lib/utils/create-spinner.mts` - Spinner-Erstellung
- `lib/utils/format-number.mts` - Zahlenformatierung

---

## 2. Package.json Anpassungen

### Geänderte Felder

```json
{
  "type": "module",
  "main": "lib/index.mts",
  "types": "lib/index.mts",
  "exports": {
    ".": {
      "types": "./lib/index.mts",
      "default": "./lib/index.mts"
    }
  },
  "scripts": {
    "lint": "eslint . --ext .mts --fix"
  },
  "author": {
    "name": "Kevin Ries",
    "company": "Fachwerk Software",
    "email": "kevin.ries@fachwerk.io",
    "url": "https://weave-js.com"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@weave-js/core": "^0.15.1",
    "typescript": "^5.6.0"
  }
}
```

### Hinzugefügte Dependencies

- `@types/node` - Node.js Type-Definitionen
- `typescript` - TypeScript Compiler (für IDE-Unterstützung)

---

## 3. TypeScript Konfiguration (Optional)

### Neue Datei: `tsconfig.json`

**Hinweis:** Diese Datei ist **optional** und dient nur der IDE-Unterstützung (IntelliSense, Type-Checking). Node.js benötigt sie nicht zur Ausführung.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["lib/**/*.mts"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

**Wichtig:**

- `noEmit: true` - Keine Kompilierung, nur Type-Checking
- Keine `outDir` oder Build-Konfiguration nötig
- Node.js führt `.mts` Dateien direkt aus

---

## 4. Typ-Definitionen

### 4.1 Command Context Interface

```typescript
export interface CommandContext {
  vorpal: any;
  broker: any;
  cliUI: typeof cliUI;
}
```

### 4.2 CLI UI Funktionen

Alle CLI UI Funktionen sind vollständig typisiert:

```typescript
export function tableHeaderText(text: string): string;
export function successLabel(text: string): string;
export function failureLabel(text: string): string;
export function infoLabel(text: string): string;
export function text(text: string): string;
export function highlightedText(text: string): string;
export function infoText(text: string): string;
export function successText(text: string): string;
export function neutralText(text: string): string;
export function whiteText(text: string): string;
export function warningText(text: string): string;
export function errorText(text: string): string;
export function printHeader(name: string, length?: number): void;
export function printIntended(caption: string, value?: any): void;
export { createSpinner };
```

### 4.3 Utility Funktionen

```typescript
// convert-args.mts
export default function convertArgs(args: any): any;

// format-number.mts
export default function formatNumber(value: number, decimals?: number, sign?: boolean): string;

// create-spinner.mts
export default function createSpinner(text: string, type?: string);
```

### 4.4 Command Funktionen

Alle Command-Funktionen folgen dem gleichen Pattern:

```typescript
export default ({ vorpal, broker, cliUI }: any) => {
  // Command-Registrierung
};
```

---

## 5. Import/Export Änderungen

### Von CommonJS zu ES Modules

**Alt (CommonJS):**

```javascript
const { table } = require("table");
const cliUI = require("./utils/cli-ui");

module.exports = ({ vorpal, broker, cliUI }) => {
  // ...
};
```

**Neu (ES Modules):**

```typescript
import { table } from "table";
import * as cliUI from "./utils/cli-ui.mts";

export default ({ vorpal, broker, cliUI }: any) => {
  // ...
};
```

### Wichtige Änderungen

1. **require() → import**
   - `const x = require('module')` → `import x from 'module'`
   - `const { x } = require('module')` → `import { x } from 'module'`
   - `const x = require('./file')` → `import x from './file.mts'`

2. **module.exports → export default**
   - `module.exports = x` → `export default x`
   - `module.exports = { x, y }` → `export { x, y }` oder `export default { x, y }`

3. **.mts Extension**
   - Alle lokalen Imports müssen die `.mts` Extension enthalten
   - `import x from './utils/cli-ui'` → `import x from './utils/cli-ui.mts'`

---

## 6. Wichtige Design-Entscheidungen

### 6.1 Verwendung von `any` für Vorpal

Da Vorpal keine TypeScript-Typen hat und eine ältere Library ist, verwenden wir `any` für Vorpal-bezogene Typen:

```typescript
function cleanupExistingCommands(vorpal: any): void {
  // ...
}
```

### 6.2 Command Context

Das `CommandContext` Interface definiert die Struktur für Custom Commands:

```typescript
export interface CommandContext {
  vorpal: any;
  broker: any;
  cliUI: typeof cliUI;
}
```

### 6.3 Default Export Pattern

Alle Command-Module verwenden Default Exports:

```typescript
export default ({ vorpal, broker, cliUI }: any) => {
  // Command-Implementierung
};
```

---

## 7. Breaking Changes

### Keine Breaking Changes für Nutzer

Die API bleibt vollständig kompatibel:

```typescript
// Funktioniert weiterhin
import weaveRepl from "@weave-js/repl";

weaveRepl(broker);
```

### Interne Änderungen

- Dateiendungen: `.js` → `.mts`
- Module-System: CommonJS → ES Modules
- TypeScript-Typen verfügbar

---

## 8. Vorteile der Migration

### 8.1 Type-Safety

- ✅ Vollständige IntelliSense-Unterstützung
- ✅ IDE Type-Checking
- ✅ Bessere IDE-Integration
- ✅ Früherkennung von Fehlern

### 8.2 Dokumentation

- ✅ Typen dienen als lebende Dokumentation
- ✅ Klare API-Kontrakte
- ✅ Selbsterklärende Funktionssignaturen

### 8.3 Wartbarkeit

- ✅ Einfacheres Refactoring
- ✅ Weniger Runtime-Fehler
- ✅ Bessere Code-Qualität

### 8.4 Performance & Einfachheit

- ✅ Keine Runtime-Overhead (Typen werden von Node.js entfernt)
- ✅ Gleiche Performance wie vorher
- ✅ **Kein Build-Step erforderlich**
- ✅ **Direkte Ausführung mit Node.js**
- ✅ **Keine zusätzlichen Tools (TSC, Babel, etc.)**

---

## 9. Migration-Checklist

- [x] Node.js Version >= 22.6.0 sicherstellen
- [x] Alle `.js` Dateien zu `.mts` umbenannt
- [x] `package.json` aktualisiert (main, types, scripts)
- [x] `tsconfig.json` erstellt (optional, für IDE)
- [x] Alle Imports auf ES Modules umgestellt
- [x] Alle Exports auf ES Modules umgestellt
- [x] Typ-Definitionen für Interfaces erstellt
- [x] Command Context Interface definiert
- [x] Keine Breaking Changes
- [x] Dokumentation aktualisiert

---

## 10. Ausführung

### Development

```bash
# REPL verwenden
node --experimental-strip-types your-app.mts

# Mit Broker
import weaveRepl from '@weave-js/repl';
weaveRepl(broker);
```

### Production

```bash
# Direkte Ausführung ohne Build
node --experimental-strip-types your-app.mts
```

**Wichtig:** Keine Build-Steps, keine Transpiler, keine zusätzlichen Tools erforderlich!

---

## 11. Bekannte Einschränkungen

### 11.1 Fehlende Type-Definitionen

Einige Dependencies haben keine TypeScript-Typen:

- `vorpal` - Keine @types verfügbar
- `clui` - Keine @types verfügbar

**Lösung:** Verwendung von `any` für diese Typen

### 11.2 Lint-Warnungen

Einige Lint-Warnungen sind zu erwarten aufgrund fehlender Type-Definitionen für externe Libraries. Diese beeinträchtigen die Funktionalität nicht.

---

## 12. Nächste Schritte (Optional)

### 12.1 Weitere Verbesserungen

- [ ] Custom Type-Definitionen für Vorpal erstellen
- [ ] Strikte Typen für Broker-Interface
- [ ] Branded Types für spezifische Werte

### 12.2 Dokumentation

- [ ] Beispiele mit TypeScript-Code aktualisieren
- [ ] Migration-Guide für Nutzer erstellen

---

## 13. Kontakt

**Autor:** Kevin Ries  
**Email:** kevin.ries@fachwerk.io  
**Firma:** Fachwerk Software  
**Website:** https://weave-js.com

---

## Anhang: Verwendungsbeispiele

### Basis-Verwendung

```typescript
import { Weave } from "@weave-js/core";
import weaveRepl from "@weave-js/repl";

const broker = Weave({
  nodeId: "node-1",
});

// REPL starten
weaveRepl(broker);
```

### Mit Custom Commands

```typescript
import { Weave } from "@weave-js/core";
import weaveRepl, { CommandContext } from "@weave-js/repl";

const broker = Weave({
  nodeId: "node-1",
});

// Custom Command
const myCommand = ({ vorpal, broker, cliUI }: CommandContext) => {
  vorpal.command("hello", "Say hello").action((args: any, done: any) => {
    console.log(cliUI.successText("Hello from custom command!"));
    done();
  });
};

// REPL mit Custom Command starten
weaveRepl(broker, myCommand);
```

### TypeScript Projekt Setup

```json
{
  "name": "my-weave-app",
  "type": "module",
  "scripts": {
    "start": "node --experimental-strip-types index.mts"
  },
  "dependencies": {
    "@weave-js/core": "^0.15.2",
    "@weave-js/repl": "^0.14.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0"
  }
}
```
