# TypeScript Migration - Redis Cache Adapter

## Übersicht

Migration des Redis Cache Adapters von JavaScript (CommonJS) zu TypeScript mit Node.js
Type Stripping (Node.js >= 22.6.0). Zusätzlich wurde `ioredis` von v3 auf v5 gehoben.

## Datum

29. Juli 2026

---

## 1. Dateistruktur-Änderungen

| Vorher                 | Nachher                 |
| ---------------------- | ----------------------- |
| `lib/index.js`         | `lib/index.mts`         |
| `test/adapter.test.js` | `test/adapter.test.mts` |

Neu: `test/ioredis-mock.mts`, `tsconfig.json`, `.gitignore`.

Entfernt:

- `lib/lock.js` — toter Code. Ein Redis-Lock auf Basis der Callback-API von `node_redis`,
  der von nirgendwo importiert oder exportiert wurde und mit `ioredis` ohnehin nicht
  funktioniert hätte. Wer ein verteiltes Lock braucht, nutzt `@weave-js/lock-service`.
- `.eslintrc.js`, die Jest-Konfiguration, Dependency `@weave-js/utils`

---

## 2. ioredis v3 → v5

`ioredis@3.2.2` stammt aus 2018. Die verwendeten Kommandos (`get`, `set`, `setex`, `del`,
`scanStream`, `pipeline`, `quit`) sind in v5 unverändert, sodass das Upgrade ohne
Anpassung der Aufrufe möglich war - es bringt aber mitgelieferte Typen mit.

---

## 3. Typisierung

- `RedisCacheAdapterOptions` erweitert `RedisOptions` von ioredis
- `RedisCacheOptions` — die Cache-Optionen (`ttl`)
- `RedisCache` — die Instanz. Der Cache-Base des Cores typisiert `set`/`get`/`remove`/
  `clear` als synchrone Platzhalter, die per `Object.assign` überschrieben werden; das
  Interface beschreibt, was diese Implementierung tatsächlich liefert.
- `createCacheBase` wird direkt aus `@weave-js/core/lib/cache/adapters/base.mts`
  importiert (der gebündelte `Cache`-Namespace ist in den Core-Typen nicht aufgelöst)

---

## 4. Behobene Fehler

1. **`set()` wartete nicht auf Redis.** Es gab `Promise.resolve(data)` zurück, während
   `client.setex(...)` unabgewartet weiterlief. Schreibfehler blieben unbemerkt, und der
   Aufrufer konnte nicht wissen, wann der Wert tatsächlich im Cache lag. `set()` ist jetzt
   `async` und wartet auf den Befehl.
2. **`clear()` löste auf, bevor gelöscht war.** Die `pipeline.exec()`-Promises der
   einzelnen Scan-Batches wurden nicht abgewartet - `clear()` resolvte am Stream-Ende,
   während die Löschungen noch liefen. Fehler der Pipeline wurden nur geloggt. Jetzt
   werden alle Batches gesammelt und vor dem Auflösen abgewartet; ein Fehler lässt
   `clear()` scheitern.
3. **Nutzung vor `init()`** lief in einen `undefined`-Zugriff auf den Client. Jetzt gibt
   es eine klare Fehlermeldung (`Redis cache is not initialized.`).
4. **`stop()` konnte nur einmal aufgerufen werden** - ein zweiter Aufruf scheiterte am
   bereits beendeten Client. Der Client wird jetzt zurückgesetzt.
5. Die Registrierung auf `$transport.connected` stand **vor** der Definition von `cache`
   und funktionierte nur, weil der Callback später lief. Sie steht jetzt hinter der
   Definition.

---

## 5. Tests

Der bisherige Test setzte einen laufenden Redis-Server voraus, benutzte `done.fail(...)`
und übergab dem Adapter teils den Broker statt der Runtime. Ersetzt durch 23 Tests auf
Basis von `node:test`, die `ioredis` per `mock.module` mocken (`test/ioredis-mock.mts`
bildet Key/Value-Store, Ablaufzeiten, `scanStream` und `pipeline` nach).
**100 % Coverage** auf `lib/index.mts` - ohne laufenden Server.

Da `mock.module` experimentell ist, steckt `--experimental-test-module-mocks` im
`test`-Skript.

```bash
npm test --workspace=@weave-js/redis-cache
```
