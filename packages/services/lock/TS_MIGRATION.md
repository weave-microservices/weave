# TypeScript Migration - Lock Service

## Übersicht

Migration des `$lock` Services von JavaScript (CommonJS) zu TypeScript mit Node.js
Type Stripping (Node.js >= 22.6.0).

## Datum

29. Juli 2026

---

## 1. Dateistruktur-Änderungen

| Vorher                      | Nachher                      |
| --------------------------- | ---------------------------- |
| `lib/lock-service.js`       | `lib/lock-service.mts`       |
| `utils/getHash.js`          | `utils/getHash.mts`          |
| `test/lock-service.test.js` | `test/lock-service.test.mts` |

Neu: `tsconfig.json`, `.gitignore`. Entfernt: `.eslintrc.js`.

---

## 2. Typisierung

Exportierte Typen: `LockServiceOptions`, `AcquireLockParams`, `LockKeyParams`,
`RenewLockParams`, `LockStoreEventParams`.

Zwei Stellen brauchen einen bewussten Cast an der Grenze zum Core:

- Die Service-Instanz trägt den Lock-Store (`this.store`), was der generische
  `Service`-Typ des Cores nicht kennt. `asLockService()` kapselt den Cast an einer Stelle.
- Der Handler-Typ des Cores erwartet `Context<ParamsToType<any>>`. Ein Kontext mit
  Pflichtfeldern (`key: string`) ist dazu nicht zuweisbar, deshalb werden die Parameter
  im Handler-Body gecastet - zur Laufzeit garantiert sie das `params`-Schema der Action.

---

## 3. Weitere Änderungen

- **`defaultsDeep` entfernt.** Der bisherige Aufruf legte bei _jedem_ Erzeugen des
  Services einen In-Memory-Adapter an, auch wenn ein eigener Adapter übergeben wurde -
  das Ergebnis wurde dann verworfen. Der Default wird jetzt nur noch bei Bedarf erzeugt.
  Damit entfällt die Dependency auf `@weave-js/utils`.
- Die drei identischen Event-Weiterleitungen in `started` sind zu einer Schleife über
  `FORWARDED_EVENTS` zusammengefasst.
- Die Prüfung auf einen Ablauf in der Vergangenheit steckt in `assertNotInThePast()`
  statt doppelt im Code.
- Zusätzlich zum Named Export gibt es einen Default Export.

---

## 4. Tests

Der bisherige Test:

- nutzte `@sinonjs/fake-timers` → jetzt `mock.timers` aus `node:test`
  (die Dependency ist entfernt)
- importierte den MongoDB-Adapter, ohne ihn zu verwenden
- enthielt zwei identische Testnamen (`"should lock and renew values."`), von denen einer
  eine Kopie des Ablauf-Tests war
- **stoppte die gestarteten Broker nie**

Ersetzt durch 20 Tests: Sperren/Freigeben, doppeltes Sperren, Ablauf in der Vergangenheit,
Trennung verschiedener Keys, Hashing der Keys, Ablauf, Renew inkl. Fehlerfälle, `flush`,
die auf den Broker weitergeleiteten Events sowie die Optionen (eigener Name, eigener
Adapter, Adapter als Promise). **100 % Coverage** auf `lib/lock-service.mts` und
`utils/getHash.mts`.

```bash
npm test --workspace=@weave-js/lock-service
```
