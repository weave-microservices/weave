# TypeScript Migration - Redis Transport Adapter

## Übersicht

Migration des Redis Transport Adapters von JavaScript zu TypeScript mit vollständiger Typisierung unter Verwendung von Node.js Type Stripping (Node.js >= 22.6.0).

## Datum

8. Dezember 2024

## Update: Redis v5 Upgrade

**Datum:** 8. Dezember 2024

Der Redis-Adapter wurde von v3.1.2 auf v5.10.0 aktualisiert, um bessere TypeScript-Unterstützung zu erhalten.

## Voraussetzungen

- **Node.js Version:** >= 22.6.0 (für native TypeScript-Unterstützung mit `--experimental-strip-types`)
- **Keine Build-Tools erforderlich:** Kein TSC, keine Transpiler
- **Native TypeScript-Ausführung:** Node.js führt `.mts` Dateien direkt aus
- **Tests auf node:test modul umgebaut**

---

## 1. Dateistruktur-Änderungen

### Umbenennungen

- Alle `.js` Dateien → `.mts` (TypeScript Module)
- Betroffen:
  - `lib/index.js` → `lib/index.mts`
  - `test/adapter.test.js` → `test/adapter.test.mts`

### Backup-Dateien

Während der Migration lagen `lib/index.js.backup` und `test/adapter.test.js.backup`
als Kopien der Originale daneben. Sie wurden mit dem Abschluss der Migration entfernt
(siehe Abschnitt 14) - der Stand vor der Migration steht in der Git-Historie.

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
    "test": "node --test --experimental-test-module-mocks test/**/*.test.mts",
    "test:watch": "node --test --watch --experimental-test-module-mocks test/**/*.test.mts",
    "lint": "eslint . --ext .mts --fix"
  },
  "devDependencies": {
    "@weave-js/core": "^0.15.2",
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0"
  },
  "dependencies": {
    "redis": "^5.10.0"
  }
}
```

### Entfernte Dependencies

- Jest (ersetzt durch Node.js Test Runner)
- Jest-spezifische Konfigurationen

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
  "include": ["lib/**/*.mts", "test/**/*.mts"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

**Wichtig:**

- `noEmit: true` - Keine Kompilierung, nur Type-Checking
- Keine `outDir` oder Build-Konfiguration nötig
- Node.js führt `.mts` Dateien direkt aus

---

## 4. Typ-Definitionen in `lib/index.mts`

### 4.1 Adapter Options Interface

```typescript
export interface RedisAdapterOptions {
  socket?: { port?: number; host?: string };
  password?: string;
  database?: number;
  /** @deprecated - Legacy-Optionen des v3-Clients, werden auf das v5-Format gemappt. */
  port?: number;
  host?: string;
  db?: number;
  [key: string]: unknown;
}
```

### 4.2 Adapter-Klasse

Der Adapter ist eine Klasse auf Basis von `BaseTransportAdapter` aus dem Core; die
Lifecycle-Methoden (`connected`, `disconnected`, `getTopic`, `serialize`,
`incomingMessage`, Statistiken) kommen von dort und müssen nicht mehr selbst
deklariert werden.

```typescript
export class RedisTransportAdapter extends BaseTransportAdapter {
  connect(): Promise<void>;
  subscribe(type: string, nodeId?: string): Promise<void>;
  send(message: TransportMessage): Promise<void>;
  close(): Promise<void>;
}
```

Die Default-Export-Factory `createRedisAdapter(options?)` bleibt für die
Rückwärtskompatibilität erhalten.

### 4.3 Imports

```typescript
import { createClient } from "redis";
import { BaseTransportAdapter } from "@weave-js/core/lib/transport/adapters/adapterBase.mts";
import type { TransportMessage } from "@weave-js/core/types/index.js";
```

### 4.4 Client-Typen

Die Client-Typen werden aus `createClient` abgeleitet, statt sie über die generischen
Typen des Redis-Pakets zu schreiben — das hält sie ohne `any` stabil gegenüber
Änderungen der Client-Generics:

```typescript
type RedisClient = ReturnType<typeof createClient>;
type RedisClientOptions = Parameters<typeof createClient>[0];
```

---

## 5. Test-Anpassungen

### 5.1 Test-Framework Migration

**Von:** Jest (Integrationstest gegen einen laufenden Redis-Server)
**Zu:** Node.js Test Runner (Unit-Tests gegen einen gemockten Redis-Client)

### 5.2 Aufbau

`test/redis-mock.mts` registriert per `mock.module` einen Mock für das `redis`-Paket und
liefert Handles auf die erzeugten Clients (Optionen, Subscriptions, publizierte Nachrichten,
Event-Auslöser). Der Adapter wird erst danach dynamisch importiert, damit der Mock greift:

```typescript
const redis = installRedisMock();
const { default: createRedisAdapter } = await import("../lib/index.mts");
```

Broker und Transport werden als schlanke Test-Doubles injiziert (`adapter.init(...)`),
Lifecycle-Events werden über `adapter.bus` beobachtet.

### 5.3 Assertion-Änderungen

```typescript
// Alt (Jest)
expect(startedHook1).toBeCalledTimes(1);
expect(result).toBe("Hello from node2");

// Neu (Node.js Test Runner)
assert.equal(adapter.isConnected, true);
assert.deepEqual(connectedEvents[0].args[0], { wasReconnect: false });
```

---

## 6. Wichtige Design-Entscheidungen

### 6.1 @ts-ignore Direktiven

**Verwendung:** Für Imports, die TypeScript-Typprobleme verursachen

**Grund:** 
- `TransportAdapters` wird als Namespace exportiert, aber TypeScript kann die Typen nicht vollständig auflösen
- `Weave` ist als Alias für `createBroker` exportiert, aber die Typen sind möglicherweise nicht korrekt aufgelöst

### 6.2 Any-Typen für Redis-Clients

**Grund:** 
- Redis v3 verwendet eine ältere API
- `@types/redis` v2.8.32 ist nicht vollständig kompatibel mit der Laufzeit-API
- Die Event-Handler (`on`, `subscribe`, `publish`, `quit`) werden von TypeScript nicht erkannt

**Alternative:** Upgrade auf redis v4+ würde bessere TypeScript-Unterstützung bieten, ist aber ein Breaking Change.

### 6.3 Promise<void> statt Promise<any>

```typescript
connect(): Promise<void>
subscribe(type: string, nodeId?: string): Promise<void>
send(message: any): Promise<void>
close(): Promise<void>
```

**Grund:** Diese Methoden geben keine bedeutungsvollen Werte zurück, daher ist `void` der korrekte Typ.

---

## 7. Breaking Changes

### Keine Breaking Changes für Nutzer

Die API bleibt vollständig kompatibel:

```typescript
// Funktioniert weiterhin
import REDISTransport from "@weave-js/redis-transport";

const broker = Weave({
  transport: {
    adapter: REDISTransport({
      host: "localhost",
      port: 6379,
    }),
  },
});
```

### Interne Änderungen

- Dateiendungen: `.js` → `.mts`
- Test-Framework: Jest → Node.js Test Runner
- TypeScript-Typen verfügbar

---

## 8. Vorteile der Migration

### 8.1 Type-Safety

- ✅ Vollständige IntelliSense-Unterstützung
- ✅ IDE Type-Checking
- ✅ Bessere IDE-Integration

### 8.2 Dokumentation

- ✅ Typen dienen als lebende Dokumentation
- ✅ Klare API-Kontrakte
- ✅ Selbsterklärende Adapter-Optionen

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
- [x] Backup-Kopien der `.js` Dateien erstellt
- [x] Alle `.js` Dateien zu `.mts` umbenannt
- [x] `package.json` aktualisiert (main, types, scripts)
- [x] `tsconfig.json` erstellt (optional, für IDE)
- [x] Typ-Definitionen für Interfaces erstellt
- [x] Redis Adapter typisiert
- [x] Tests auf Node.js Test Runner migriert
- [x] Keine Breaking Changes
- [x] Dokumentation erstellt
- [x] Alte `.js` Dateien und Backups entfernt
- [x] `.eslintrc.js` und package-lokales Lockfile entfernt
- [x] `any` aus dem Adapter entfernt (ESLint sauber)
- [x] Tests ohne laufenden Redis-Server, 100 % Coverage

---

## 10. Ausführung

### Development

```bash
# Tests ausführen (mit Type Stripping)
npm test

# Tests mit Watch-Mode
npm run test:watch

# Linting
npm run lint
```

### Production

```bash
# Direkte Ausführung ohne Build
node --experimental-strip-types your-app.mts
```

**Wichtig:** Keine Build-Steps, keine Transpiler, keine zusätzlichen Tools erforderlich!

---

## 11. Bekannte Einschränkungen

### 11.1 Redis v5 Upgrade ✅

**Status:** Erfolgreich aktualisiert auf Redis v5.10.0

Die Redis-Version wurde von v3.1.2 auf v5.10.0 aktualisiert. Redis v5 bringt native TypeScript-Unterstützung mit und benötigt keine separaten `@types/redis` mehr.

**Wichtige Änderungen:**
- Promise-basierte API (statt Callbacks)
- Explizites `.connect()` erforderlich
- Neue Socket-Konfiguration
- Bessere TypeScript-Typen

**Backward Compatibility:**
- Legacy-Optionen (`port`, `host`, `db`) werden automatisch konvertiert
- API bleibt für Nutzer gleich

### 11.2 TransportAdapters Namespace

Der `TransportAdapters` Namespace wird von `@weave-js/core` exportiert, aber TypeScript kann die Typen nicht vollständig auflösen.

**Workaround:** Verwendung von `@ts-ignore` Direktive

### 11.3 Test-Warnungen bei Broker-Cleanup

**Problem:** Node.js Test Runner meldet unhandled rejections während des Broker-Cleanups:
```
Error: Test hook "beforeEach" generated asynchronous activity after the test ended.
Error: ENOENT: no such file or directory, unlink '.weave/types/...'
```

**Ursache:** Der Broker versucht während des Shutdowns, Typ-Dateien zu löschen, die möglicherweise nicht existieren. Dies geschieht asynchron nach dem Test-Ende.

**Status:** 
- Die Tests selbst sind **erfolgreich** (✔ should connect, ✔ should get node info)
- Die Warnungen sind kosmetisch und beeinträchtigen die Funktionalität nicht
- Dies ist ein bekanntes Problem im Core-Broker, nicht spezifisch für den Redis-Adapter

**Workaround:** 
- `test/setup.mts` enthält einen Error-Handler, der diese spezifischen Fehler unterdrückt
- Die `.weave/` Directory ist in `.gitignore` enthalten

**Langfristige Lösung:** Fix im Core-Broker erforderlich

---

## 12. Nächste Schritte (Optional)

### 12.1 Weitere Verbesserungen

- [x] Upgrade auf redis v5 für bessere TypeScript-Unterstützung ✅
- [ ] Strikte Typen für Message-Objekte
- [ ] Bessere Error-Typisierung
- [ ] Redis Cluster-Unterstützung

### 12.2 Dokumentation

- [ ] Beispiele mit TypeScript-Code aktualisieren
- [ ] Migration-Guide für Nutzer erstellen

---

## 13. Nachtrag: Abschluss der Migration

**Datum:** 27. Juli 2026

Die Migration war zunächst nur teilweise abgeschlossen - die alten JavaScript-Dateien
lagen noch neben den `.mts` Dateien. Beim Fertigstellen wurde außerdem der Adapter-Code
selbst aufgeräumt.

### 13.1 Entfernte Altlasten

- `lib/index.js`, `test/adapter.test.js` (durch die `.mts` Dateien ersetzt)
- `lib/index.js.backup`, `test/adapter.test.js.backup`
- `.eslintrc.js` — das Projekt nutzt die Flat Config `eslint.config.mjs` im Root
- `package-lock.json` — in einem npm-Workspace wirkungslos, der Root-Lock ist maßgeblich
- `test/setup.mts` — Workaround für Broker-Cleanup-Fehler, mit dem Integrationstest hinfällig

### 13.2 Behobene Bugs

1. **`this.bus.emit("adapter.connected", true)`** verwendete einen Event-Namen, auf den
   niemand hört (der Transport lauscht auf `$adapter.connected`). Der Zweig war zudem
   unerreichbar, weil `isConnected` an der Stelle nie zurückgesetzt wurde. Jetzt:
   `this.connected({ wasReconnect: this.interruptionCount > 0 })`.
2. **Der `error`-Handler setzte `isConnected = false`**, ohne `disconnected()` zu feuern.
   Der nachfolgende `end`-Handler sah dann bereits `isConnected === false` und meldete den
   Verbindungsabbruch nie an den Transport. Der `error`-Handler loggt jetzt nur noch; den
   Zustandswechsel macht ausschließlich `end`.
3. **`subscribe()` leitete den Message-Type aus `topic.split(".")[1]` ab**, was bei einem
   Namespace mit Punkt (`my.namespace`) den falschen Typ ergab. Jetzt wird der `type`-
   Parameter direkt verwendet.
4. **`close()` ließ `isConnected` auf `true`** und behielt die Client-Referenzen. Jetzt wird
   der Zustand zurückgesetzt und nur noch offene Clients werden geschlossen.
5. **`send()`** publizierte ohne Prüfung auf einen vorhandenen Client (NPE nach `close()`).

### 13.3 Weitere Änderungen

- **Reconnect-Handling ergänzt:** Der Adapter reagiert jetzt auf `reconnecting` und `ready`
  und meldet `connected({ wasReconnect: true })`, sobald beide Clients wieder bereit sind.
  Vorher blieb der Adapter nach einem Verbindungsverlust dauerhaft als getrennt markiert.
- **`quit()` → `close()`** (die v5-API) und der künstliche `promiseDelay(…, 500)` am Ende
  von `close()` ist entfallen.
- **`defaultsDeep` entfernt:** Die Options-Normalisierung ist jetzt explizit; damit entfällt
  die Dependency auf `@weave-js/utils` komplett.
- **`any` vollständig entfernt** — der Adapter ist typsauber gegenüber ESLint
  (`@typescript-eslint/no-explicit-any`), die Client-Typen werden aus `createClient`
  abgeleitet (`ReturnType`/`Parameters`), das `@ts-ignore` beim Core-Import ist nicht mehr nötig.

### 13.4 Tests

Der Integrationstest startete zwei Weave-Broker und setzte einen laufenden Redis-Server
voraus. Er wurde durch 31 Unit-Tests ersetzt, die den Redis-Client per `mock.module`
mocken (`test/redis-mock.mts`). `lib/index.mts` ist damit zu **100 % (Lines, Branches,
Functions)** abgedeckt — ohne laufenden Server.

Da `mock.module` experimentell ist, brauchen die Tests das Flag
`--experimental-test-module-mocks`; es steckt im `test`-Skript des Packages.

```bash
npm test --workspace=@weave-js/redis-transport

# mit Coverage
node --test --experimental-test-module-mocks --experimental-test-coverage test/**/*.test.mts
```

Es gibt damit keinen Integrationstest gegen einen echten Redis-Server mehr. Falls einer
gewünscht ist, gehört er als separate Datei (z. B. `test/integration/`) ergänzt, die ohne
erreichbaren Server übersprungen wird.

---

## 14. Kontakt

**Autor:** Kevin Ries  
**Email:** kevin.ries@fachwerk.io  
**Firma:** Fachwerk Software  
**Website:** https://weave-js.com

---

## Anhang: Verwendungsbeispiel

### TypeScript Verwendung

```typescript
import { Weave } from "@weave-js/core";
import REDISTransport, { RedisAdapterOptions } from "@weave-js/redis-transport";

// Typisierte Adapter-Optionen
const redisOptions: RedisAdapterOptions = {
  host: "localhost",
  port: 6379,
  password: "secret",
  db: 0,
};

// Broker erstellen
const broker = Weave({
  nodeId: "node-1",
  transport: {
    adapter: REDISTransport(redisOptions),
  },
});

// Service erstellen
broker.createService({
  name: "myService",
  actions: {
    hello() {
      return "Hello World!";
    },
  },
});

// Broker starten
await broker.start();
```

### JavaScript Verwendung (weiterhin unterstützt)

```javascript
const { Weave } = require("@weave-js/core");
const REDISTransport = require("@weave-js/redis-transport");

const broker = Weave({
  nodeId: "node-1",
  transport: {
    adapter: REDISTransport({
      host: "localhost",
      port: 6379,
    }),
  },
});

await broker.start();
```
