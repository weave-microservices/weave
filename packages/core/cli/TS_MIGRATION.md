# TypeScript Migration - Weave CLI

## Übersicht

Migration des Weave CLI von JavaScript zu TypeScript mit vollständiger Typisierung aller CLI-Befehle und Utility-Funktionen unter Verwendung von Node.js Type Stripping (Node.js >= 22.6.0).

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
  - `bin/weave.js` → `bin/weave.mts`
  - `lib/index.js` → `lib/index.mts`
  - `lib/commands/**/*.js` → `lib/commands/**/*.mts`
  - `lib/utils/**/*.js` → `lib/utils/**/*.mts`

### Dateiübersicht

```
cli/
├── bin/
│   └── weave.mts
├── lib/
│   ├── index.mts
│   ├── commands/
│   │   ├── create/
│   │   │   ├── index.mts
│   │   │   ├── middleware.mts
│   │   │   └── service.mts
│   │   └── start/
│   │       ├── index.mts
│   │       ├── createWatchMiddlewares.mts
│   │       └── loadServices.mts
│   └── utils/
│       ├── args.mts
│       ├── config.mts
│       ├── deleteFolderRecursive.mts
│       ├── getTempDir.mts
│       ├── ttlCache.mts
│       └── watchRecursive.mts
├── package.json
└── tsconfig.json
```

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
    "lint": "eslint . --ext .mts --fix",
    "start": "node --experimental-strip-types ./lib/index.mts start -r"
  },
  "bin": {
    "weave": "./bin/weave.mts"
  },
  "dependencies": {
    "@weave-js/core": "^0.15.2",
    "@weave-js/repl": "^0.14.0",
    "@weave-js/utils": "^0.13.0",
    "commander": "^10.0.1",
    "dotenv": "^16.4.5",
    "ejs": "^3.1.9",
    "inquirer": "^9.2.0",
    "kleur": "^4.1.5",
    "mkdirp": "^3.0.1",
    "update-notifier": "^5.1.0",
    "user-home": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0"
  }
}
```

### Neue Dependencies

- `@types/node`: TypeScript-Typen für Node.js
- `typescript`: TypeScript Compiler (nur für IDE-Unterstützung)

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
  "include": ["lib/**/*.mts", "bin/**/*.mts"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

**Wichtig:**

- `noEmit: true` - Keine Kompilierung, nur Type-Checking
- Keine `outDir` oder Build-Konfiguration nötig
- Node.js führt `.mts` Dateien direkt aus

---

## 4. Typ-Definitionen

### 4.1 CLI Command Handler

```typescript
// lib/commands/start/index.mts
export const handler = async (args: any): Promise<void> => {
  // Command implementation
};
```

### 4.2 Utility Functions

```typescript
// lib/utils/args.mts
export const cleanArgs = (options: any): Record<string, any> => {
  const args: Record<string, any> = {};
  // Implementation
  return args;
};

// lib/utils/config.mts
export const getConfig = async (flags: any): Promise<any> => {
  // Implementation
};
```

### 4.3 Watch Middleware Types

```typescript
// lib/commands/start/createWatchMiddlewares.mts
interface AdditionalFile {
  filename: string;
  changeScope: string;
}

interface WatcherOptions {
  additionalFiles?: AdditionalFile[];
}

interface WatchItem {
  services: string[];
  otherFiles: string[];
  restartBroker: boolean;
  restartAllServices: boolean;
  watcher?: fs.FSWatcher;
}

export function createWatchMiddleware(weaveCli: any, options: WatcherOptions = {}) {
  // Implementation
}
```

### 4.4 TTL Cache Class

```typescript
// lib/utils/ttlCache.mts
interface CacheOptions {
  ttl?: number;
  capacity?: number;
}

interface CacheRecord {
  val: any;
  expire: number;
  timeout: NodeJS.Timeout;
}

class Cache extends EventEmitter {
  private _store: Record<string, CacheRecord> = {};
  private _size: number = 0;
  private _ttl: number;
  private _capacity: number = Infinity;

  constructor(opts: CacheOptions = {}) {
    super();
    this._ttl = Number(opts.ttl);
    this.setCapacity(opts.capacity);
  }

  put(key: string, val: any, ttl?: number): void {}
  get(key: string): any {}
  del(key: string): any {}
  clear(): void {}
  size(accurate?: boolean): number {}
  setCapacity(capacity?: number): void {}
}

export default Cache;
```

---

## 5. Import/Export Änderungen

### Von CommonJS zu ES Modules

**Alt (CommonJS):**

```javascript
const { createBroker } = require("@weave-js/core");
const repl = require("@weave-js/repl");
const path = require("path");

module.exports = { handler };
```

**Neu (ES Modules):**

```typescript
import { createBroker } from "@weave-js/core";
import repl from "@weave-js/repl";
import path from "path";

export const handler = async (args: any): Promise<void> => {
  // Implementation
};
```

### **dirname und **filename in ES Modules

```typescript
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### JSON Imports

```typescript
import pkg from "../package.json" with { type: "json" };
```

### Dynamic Imports

```typescript
// Statt require() für dynamische Imports
const module = await import(filePath);
const config = module.default || module;
```

---

## 6. Wichtige Änderungen

### 6.1 Async Config Loading

Die `getConfig` Funktion ist jetzt async, da sie `import()` für dynamisches Laden verwendet:

```typescript
export const getConfig = async (flags: any): Promise<any> => {
  // ...
  const module = await import(filePath);
  config = module.default || module;
  // ...
};
```

### 6.2 Service Loading

Service-Loading-Funktionen sind jetzt async:

```typescript
export const loadServices = async (broker: any, param: string): Promise<void> => {
  // ...
  const module = await import(path.join(servicePath, "index.js"));
  const serviceFactory = module.default || module;
  // ...
};
```

### 6.3 Command Handlers

Alle Command-Handler exportieren jetzt eine `handler` Funktion:

```typescript
// lib/commands/start/index.mts
export const handler = async (args: any): Promise<void> => {
  // Implementation
};

// lib/commands/create/index.mts
export const handler = async (type: string, name: string, options: any): Promise<void> => {
  // Implementation
};
```

---

## 7. Breaking Changes

### Keine Breaking Changes für CLI-Nutzer

Die CLI-Nutzung bleibt vollständig kompatibel:

```bash
# Funktioniert weiterhin
weave start -r
weave start -c weave.config.js
weave create service myService
```

### Interne Änderungen

- Dateiendungen: `.js` → `.mts`
- Import-Syntax: `require()` → `import`
- Export-Syntax: `module.exports` → `export`
- TypeScript-Typen verfügbar
- Async config loading

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
- ✅ Typsichere Konfiguration

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
- [x] `package.json` aktualisiert (main, types, scripts, bin)
- [x] `tsconfig.json` erstellt (optional, für IDE)
- [x] Alle `require()` zu `import` konvertiert
- [x] Alle `module.exports` zu `export` konvertiert
- [x] Typ-Definitionen für Interfaces erstellt
- [x] `__dirname` und `__filename` für ES Modules hinzugefügt
- [x] Async config loading implementiert
- [x] Command handlers typisiert
- [x] Utility functions typisiert
- [x] Watch middleware typisiert
- [x] Dokumentation aktualisiert

---

## 10. Ausführung

### Development

```bash
# CLI direkt ausführen (mit Type Stripping)
node --experimental-strip-types ./lib/index.mts start -r

# Oder über npm script
npm start

# Mit Config-Datei
weave start -c weave.config.js

# Service erstellen
weave create service myService

# Middleware erstellen
weave create middleware myMiddleware
```

### Production

```bash
# Direkte Ausführung ohne Build
weave start -r
```

**Wichtig:** Keine Build-Steps, keine Transpiler, keine zusätzlichen Tools erforderlich!

---

## 11. Bekannte Einschränkungen

### 11.1 Type Declarations für externe Pakete

Einige Pakete haben keine TypeScript-Deklarationen:

- `mkdirp` - Funktioniert, aber ohne Typen
- `user-home` - Funktioniert, aber ohne Typen

Diese können mit `// @ts-ignore` oder durch Installation von `@types/*` Paketen behoben werden.

### 11.2 Dynamic Imports

Dynamic imports sind jetzt async und erfordern `await`:

```typescript
// Alt
const config = require(filePath);

// Neu
const module = await import(filePath);
const config = module.default || module;
```

---

## 12. Nächste Schritte (Optional)

### 12.1 Weitere Verbesserungen

- [ ] Strikte Typen für Command-Argumente
- [ ] Interface für Broker-Konfiguration
- [ ] Typed Events für Watch-Middleware
- [ ] Generische Typen für Service-Loading

### 12.2 Dokumentation

- [ ] Beispiele mit TypeScript-Code aktualisieren
- [ ] Migration-Guide für Nutzer erstellen
- [ ] API-Dokumentation mit TypeDoc generieren

---

## 13. Kontakt

**Autor:** Kevin Ries  
**Email:** kevin.ries@fachwerk.io  
**Firma:** Fachwerk Software  
**Website:** https://weave-js.com

---

## Anhang: Wichtige Code-Snippets

### Verwendung der CLI

```bash
# Broker mit REPL starten
weave start -r

# Broker mit Config-Datei starten
weave start -c weave.config.js

# Broker mit Services starten
weave start -s ./services

# Broker mit Watch-Mode starten
weave start -w -r

# Service erstellen
weave create service myService

# Middleware erstellen
weave create middleware myMiddleware
```

### Programmatische Verwendung

```typescript
import { handler as startHandler } from "@weave-js/cli/lib/commands/start/index.mts";
import { handler as createHandler } from "@weave-js/cli/lib/commands/create/index.mts";

// Broker starten
await startHandler({
  repl: true,
  watch: true,
  services: "./services",
});

// Service erstellen
await createHandler("service", "myService", {
  suffix: "service",
});
```

### Custom Watch Middleware

```typescript
import { createWatchMiddleware } from "@weave-js/cli/lib/commands/start/createWatchMiddlewares.mts";

const middleware = createWatchMiddleware(cliContext, {
  additionalFiles: [
    {
      filename: "./custom-config.js",
      changeScope: "broker",
    },
  ],
});
```
