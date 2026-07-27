# TypeScript Migration - Zipkin Tracing Adapter

## Übersicht

Migration des Zipkin Tracing Adapters von JavaScript (CommonJS) zu TypeScript mit
Node.js Type Stripping (Node.js >= 22.6.0). Kein Build-Schritt, keine Transpiler.

## Datum

27. Juli 2026

## Voraussetzungen

- **Node.js Version:** >= 22.6.0 (native Ausführung von `.mts` Dateien)
- **Keine Build-Tools erforderlich:** Kein TSC-Build, nur `tsc --noEmit` für den Typecheck
- **Tests auf `node:test` umgebaut** (kein Jest mehr)

---

## 1. Dateistruktur-Änderungen

### Umbenennungen

| Vorher                | Nachher                |
| --------------------- | ---------------------- |
| `lib/index.js`        | `lib/index.mts`        |
| `test/adapter.test.js`| `test/adapter.test.mts`|

### Neue Dateien

- `tsconfig.json` (identisch zum Redis-Transport-Setup, `noEmit`, `allowImportingTsExtensions`)

### Entfernte Dateien

- `.eslintrc.js` — das Projekt nutzt inzwischen die Flat Config `eslint.config.mjs` im Root

---

## 2. Modulsystem

- `require`/`exports` → ESM `import`/`export`
- `package.json`: `"type": "module"`, `main`/`types` auf `lib/index.mts`, zusätzlich `exports`-Map
- Import des Basis-Collectors direkt aus dem Core:
  ```ts
  import { createBaseTracingCollector } from "@weave-js/core/lib/tracing/collectors/base.mts";
  import type { Runtime } from "@weave-js/core/types/index.js";
  ```

---

## 3. Typisierung

Neue exportierte bzw. interne Typen in `lib/index.mts`:

- `ZipkinCollectorOptions` (exportiert) — ersetzt den bisherigen JSDoc-`@typedef`
- `ZipkinSpan` — die Felder, die der Exporter tatsächlich vom Span liest
- `ZipkinPayload` / `ZipkinAnnotation` — die an Zipkin gesendete Struktur

Hinweise:

- `exporter.options.errors` ist im Core-Typ optional → `exporter.options.errors?.fields ?? []`
- `span.error` wird als `unknown` geführt und einmalig nach `Error | null` gecastet, damit
  die Signatur von `finishedSpan(span: SpanData)` aus dem Basis-Collector kompatibel bleibt
- `mergeDefaultOptions` liefert `Required<ZipkinCollectorOptions>`; die gemergten Optionen
  liegen jetzt in einer eigenen Konstante (`resolvedOptions`) statt den Parameter zu überschreiben

---

## 4. Abhängigkeiten

- **Entfernt:** `node-fetch` (^2.6.9) — Node.js >= 18 hat globales `fetch`
- **Ergänzt (dev):** `@types/node`, `typescript`

Nebeneffekt: `Content-Length` wird jetzt über `Buffer.byteLength(data)` als String gesetzt
(vorher `data.length`, was bei Multi-Byte-Zeichen falsch war).

---

## 5. Tests

Der bisherige Test war ein leerer Platzhalter (`it("should connect", () => {})`).
Er wurde durch 13 Tests auf Basis von `node:test` ersetzt, die `globalThis.fetch` mocken.
`lib/index.mts` ist damit zu **100 % (Lines, Branches, Functions)** abgedeckt.

**Optionen**

- Collector-Erzeugung mit Default-Optionen
- Default-Host `http://localhost:9411`
- `ZIPKIN_URL` als Default-Host aus der Umgebung
- explizite Optionen haben Vorrang vor `ZIPKIN_URL`

**Payload-Generierung**

- Flush der Queue an den konfigurierten Endpoint inkl. Payload-Mapping
  (ID-Kürzung, Zeitkonvertierung, geflattete Tags, `sr`/`ss` Annotations, Header)
- fehlende optionale Span-Felder werden zu `null` gemappt
- mehrere Spans landen in einem Request, die Queue wird danach geleert
- kein Request bei leerer Queue

**Fehlerbehandlung**

- Fehler-Spans (`error.*` Tags und `error`-Annotation mit Endpoint)
- Tracer ohne konfigurierte `errors.fields`
- Transportfehler landen im Runtime-Logger

**Lifecycle**

- `stop()` beendet den Flush-Timer
- doppeltes `stop()` ist unkritisch

### Ausführen

```bash
npm test --workspace=@weave-js/tracing-zipkin
# oder
node --test test/**/*.mts

# mit Coverage
node --test --experimental-test-coverage test/**/*.mts
```

### Typecheck

```bash
npx tsc --noEmit -p tsconfig.json
```

---

## 6. Offene Punkte

- `misc/development/tracing.js` importiert den Adapter noch per `require(...lib/index)` —
  das Dev-Skript ist bereits durch die Core-ESM-Migration veraltet und muss separat
  auf `.mts` gezogen werden.
