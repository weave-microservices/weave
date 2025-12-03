# Jest zu Node.js Test Runner Migration

## Abgeschlossene Migrationen

### ✅ action-hooks.test.mts
- `jest.fn()` → `mock.fn()`
- `expect().toBeCalledTimes()` → `assert.strictEqual(fn.mock.callCount(), n)`
- `done` callbacks → `async/await`
- Import: `import { mock } from 'node:test'`

### ✅ circuit-breaker.test.mts
- `jest.useFakeTimers()` / `jest.useRealTimers()` entfernt
- `jest.advanceTimersByTime()` → `await new Promise(resolve => setTimeout(resolve, ms))`

### ✅ middlewares.test.mts
- `expect().toBe()` → `assert.strictEqual()`
- `done` callbacks → `async/await`

## Noch zu migrierende Dateien

### middlewares/local.test.mts
- Zeile 93: `expect(flow.join('-')).toBe(...)`

### middlewares/metrics.test.mts
- Mehrere `expect().toBe()`, `expect().toBeGreaterThan()`
- `jest.fn()` für Mock-Adapter

### metrics/registry.test.mts  
- Mehrere `expect().toBe()`, `expect().toBeLessThan()`

### tracing/tracing.test.mts
- Zeile 14: `jest.useFakeTimers({ advanceTimers: true })`
- Mehrere `jest.advanceTimersByTime()`
- `expect().toMatchSnapshot()` - **Snapshots müssen entfernt oder durch manuelle Assertions ersetzt werden**

## Migrations-Patterns

### Mock-Funktionen
```javascript
// Vorher (Jest)
const mockFn = jest.fn();
expect(mockFn).toBeCalledTimes(2);

// Nachher (Node.js Test)
import { mock } from 'node:test';
const mockFn = mock.fn();
assert.strictEqual(mockFn.mock.callCount(), 2);
```

### Assertions
```javascript
// Vorher (Jest)
expect(value).toBe(expected);
expect(value).toBeGreaterThan(5);
expect(value).toBeLessThan(10);

// Nachher (Node.js Test)
assert.strictEqual(value, expected);
assert.ok(value > 5);
assert.ok(value < 10);
```

### Async Tests
```javascript
// Vorher (Jest)
it('test', (done) => {
  promise.then(() => {
    expect(x).toBe(y);
    done();
  });
});

// Nachher (Node.js Test)
it('test', async () => {
  await promise;
  assert.strictEqual(x, y);
});
```

### Timer Mocks
```javascript
// Vorher (Jest)
jest.useFakeTimers();
jest.advanceTimersByTime(1000);
jest.useRealTimers();

// Nachher (Node.js Test)
// Entweder echte Timeouts verwenden:
await new Promise(resolve => setTimeout(resolve, 1000));

// Oder Test-Logik anpassen, um Timer-Abhängigkeiten zu vermeiden
```

### Snapshots
**Node.js Test Runner hat keine Snapshot-Funktion!**

Optionen:
1. Snapshots durch explizite Assertions ersetzen
2. Externe Snapshot-Library verwenden
3. Tests ohne Snapshots umschreiben

## TypeScript-Fehler in Tests

Die TypeScript-Fehler wie `Argument of type '"service.action"' is not assignable to parameter of type 'never'` sind erwartbar, da Test-Services nicht in den generierten Action-Contracts registriert werden. Diese können ignoriert werden oder durch Type-Casts behoben werden:

```typescript
await broker.call('test.action' as any, params);
```
