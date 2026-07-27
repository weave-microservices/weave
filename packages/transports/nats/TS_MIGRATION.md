# TypeScript Migration - NATS Transport Adapter

## Übersicht

Migration des NATS Transport Adapters von JavaScript (CommonJS) zu TypeScript mit
Node.js Type Stripping (Node.js >= 22.6.0). Zusätzlich wurde der NATS-Client von
v1 auf v2 hochgezogen - analog zum Redis-Transport (dort v3 → v5).

## Datum

27. Juli 2026

## Voraussetzungen

- **Node.js Version:** >= 22.6.0 (native Ausführung von `.mts` Dateien)
- **Keine Build-Tools erforderlich:** Kein TSC-Build, nur `tsc --noEmit` für den Typecheck
- **Tests auf `node:test` umgebaut** (kein Jest mehr)

---

## 1. Dateistruktur-Änderungen

### Umbenennungen

| Vorher                 | Nachher                 |
| ---------------------- | ----------------------- |
| `lib/index.js`         | `lib/index.mts`         |
| `test/adapter.test.js` | `test/adapter.test.mts` |

### Neue Dateien

- `tsconfig.json` (identisch zum Redis-Transport-Setup)
- `test/nats-mock.mts` — Modul-Mock des NATS-Clients für die Unit-Tests

### Entfernte Dateien

- `.eslintrc.js` — das Projekt nutzt inzwischen die Flat Config `eslint.config.mjs` im Root

---

## 2. NATS Client v1 → v2

**Datum:** 27. Juli 2026

`nats@1.4.12` ist seit Jahren EOL und EventEmitter-basiert. Der Adapter wurde auf
`nats@^2.29.3` umgestellt. Das betrifft die komplette Adapter-Logik:

| v1 (vorher)                          | v2 (jetzt)                                        |
| ------------------------------------ | ------------------------------------------------- |
| `NATS.connect(options)` + `client.on("connect")` | `await connect(options)` — der Promise resolved erst nach dem Verbindungsaufbau |
| `client.on("error" \| "disconnect" \| "reconnect" \| …)` | `for await (const status of connection.status())` |
| `client.subscribe(topic, cb)` mit String-Payload | `connection.subscribe(topic, { callback })` mit `Uint8Array`-Payload |
| `client.publish(topic, data, cb)`    | `connection.publish(topic, data)` (synchron, gepuffert) |
| `client.flush(() => client.close())` | `await connection.drain()` (flusht und schließt)   |
| Option `url`                         | Option `servers` (String oder String-Array)        |

Die Option `url` wird weiterhin akzeptiert und intern auf `servers` gemappt, ebenso
wie das Übergeben eines Connection-Strings direkt als Adapter-Option:

```ts
NATSTransport("nats://localhost:4222");
NATSTransport({ url: "nats://localhost:4222" }); // legacy
NATSTransport({ servers: ["nats://a:4222", "nats://b:4222"] });
```

---

## 3. Strukturelle Änderungen

- Factory-Funktion mit `Object.assign(TransportAdapters.BaseAdapter(...), {...})`
  → Klasse `NATSTransportAdapter extends BaseTransportAdapter` (wie beim Redis-Transport).
  Die Default-Export-Factory bleibt für die Rückwärtskompatibilität erhalten.
- `defaultsDeep` aus `@weave-js/utils` wurde entfernt (siehe Bugfixes) — damit entfällt
  die Dependency auf `@weave-js/utils` komplett. Der bisherige Import ging ohnehin über
  einen relativen Pfad (`../../../core/utils/lib`) statt über das Package.
- Neue exportierte Typen: `NATSAdapterOptions` (erweitert `ConnectionOptions` des Clients),
  `NATSTransportAdapter`.

---

## 4. Behobene Bugs

Beim Umbau sind drei Fehler des alten Codes aufgefallen:

1. **`this.connected = false`** im `disconnect`-Handler überschrieb die geerbte
   `connected()`-Methode mit einem Boolean. Korrekt ist `this.isConnected = false`.
2. **`this.interruptionCount;`** im `reconnect`-Handler war ein wirkungsloses Statement
   (gemeint war vermutlich `++`). Der Zähler wird jetzt beim Disconnect erhöht.
3. **`defaultsDeep(options, { url: "nats://localhost:4222" })`** hat den Default-String
   zeichenweise in ein übergebenes `servers`-Array gemerged
   (`["nats://a:4222", "t", "s", ":", …]`). Der Default wird jetzt nur noch gesetzt,
   wenn weder `servers` noch `url` konfiguriert sind.

Außerdem sendet `send()` jetzt nur noch, wenn die Verbindung steht (vorher wurde bei
unterbrochener Verbindung ins Leere publiziert).

---

## 5. Tests

Der bisherige Test war ein Integrationstest, der zwei Weave-Broker startete und damit
einen laufenden NATS-Server voraussetzte. Er wurde durch 28 Unit-Tests auf Basis von
`node:test` ersetzt, die den NATS-Client per `mock.module` mocken.
`lib/index.mts` ist damit zu **100 % (Lines, Branches, Functions)** abgedeckt — ohne
laufenden Server.

Abgedeckt sind: Options-Normalisierung (Default-Server, Connection-String, Legacy-`url`,
native Options), Connect inkl. Fehlerfall, Subscribe (Topic-Prefix mit und ohne Namespace,
eingehende Nachrichten, Subscription-Fehler), Send (Serialisierung, Statistik, Zustände
ohne Verbindung), das Status-Handling (Disconnect, Reconnecting, Reconnect, Server-Fehler,
unbekannte Events) sowie Close (Drain, doppeltes Close, bereits geschlossene Verbindung).

Da `mock.module` noch experimentell ist, brauchen die Tests das Flag
`--experimental-test-module-mocks`; es steckt im `test`-Skript des Packages.

### Ausführen

```bash
npm test --workspace=@weave-js/nats-transport
# oder
node --test --experimental-test-module-mocks test/**/*.test.mts

# mit Coverage
node --test --experimental-test-module-mocks --experimental-test-coverage test/**/*.test.mts
```

### Typecheck

```bash
npx tsc --noEmit -p tsconfig.json
```

---

## 6. Offene Punkte

- Es gibt keinen Integrationstest mehr gegen einen echten NATS-Server. Falls einer
  gewünscht ist, gehört er als separate Datei (z. B. `test/integration/`) ergänzt, die
  ohne erreichbaren Server übersprungen wird.
