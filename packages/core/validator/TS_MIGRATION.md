# TypeScript Migration - Weave Validator

## Übersicht

Migration des Weave Validators von JavaScript zu TypeScript mit vollständiger Typisierung aller Schema-Definitionen und API-Methoden unter Verwendung von Node.js Type Stripping (Node.js >= 22.6.0).

## Datum

2. Dezember 2025

## Voraussetzungen

- **Node.js Version:** >= 22.6.0 (für native TypeScript-Unterstützung mit `--experimental-strip-types`)
- **Keine Build-Tools erforderlich:** Kein TSC, keine Transpiler
- **Native TypeScript-Ausführung:** Node.js führt `.mts` Dateien direkt aus
- **Tests auf node:test modul umbauen**

---

## 1. Dateistruktur-Änderungen

### Umbenennungen
- Alle `.js` Dateien → `.mts` (TypeScript Module)
- Betroffen:
  - `lib/validator.js` → `lib/validator.mts`
  - `lib/rules/*.js` → `lib/rules/*.mts`
  - `test/**/*.js` → `test/**/*.mts`

---

## 2. Package.json Anpassungen

### Geänderte Felder

```json
{
  "type": "module",
  "main": "lib/validator.mts",
  "types": "lib/validator.mts",
  "exports": {
    ".": {
      "types": "./lib/validator.mts",
      "default": "./lib/validator.mts"
    }
  },
  "scripts": {
    "test": "node --test test/**/*.mts",
    "test:watch": "node --test --watch test/**/*.mts",
    "lint": "eslint . --ext .mts --fix"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0"
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
  "include": [
    "lib/**/*.mts",
    "test/**/*.mts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "coverage"
  ]
}
```

**Wichtig:** 
- `noEmit: true` - Keine Kompilierung, nur Type-Checking
- Keine `outDir` oder Build-Konfiguration nötig
- Node.js führt `.mts` Dateien direkt aus

---

## 4. Typ-Definitionen in `lib/validator.mts`

### 4.1 Basis-Typen

```typescript
export interface ValidationOptions {
  strict?: boolean;
  strictMode?: 'remove' | 'error';
  root?: boolean;
  validateSchema?: boolean;
}

export interface ValidationError {
  type: string;
  message: string;
  field?: string;
  expected?: any;
  passed?: any;
}

export type ValidationResult = true | ValidationError[];

export interface ValidationFunction {
  (data: any): ValidationResult;
}
```

### 4.2 Schema-Interfaces

#### BaseSchema (mit Index-Signatur für Flexibilität)

```typescript
export interface BaseSchema {
  type?: string;
  optional?: boolean;
  nullable?: boolean;
  default?: any;
  messages?: Record<string, string>;
  [key: string]: any; // Erlaubt zusätzliche Properties
}
```

#### Spezifische Schema-Typen

```typescript
export interface StringSchema extends BaseSchema {
  type?: 'string';
  minLength?: number;
  maxLength?: number;
  equal?: string;
  trim?: boolean;
  trimLeft?: boolean;
  trimRight?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  base64?: boolean;
  uuid?: boolean;
  phone?: boolean;
  hex?: boolean;
  pattern?: RegExp | string;
}

export interface NumberSchema extends BaseSchema {
  type?: 'number';
  min?: number;
  max?: number;
  equal?: number;
  notEqual?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
  convert?: boolean;
}

export interface BooleanSchema extends BaseSchema {
  type?: 'boolean';
  convert?: boolean;
}

export interface DateSchema extends BaseSchema {
  type?: 'date';
  convert?: boolean;
}

export interface ArraySchema extends BaseSchema {
  type?: 'array';
  minLength?: number;
  maxLength?: number;
  length?: number;
  contains?: any;
  itemType?: Schema;
}

export interface ObjectSchema extends BaseSchema {
  type?: 'object';
  strict?: boolean;
  properties?: Record<string, Schema>;
  props?: Record<string, Schema>;
}

export interface EnumSchema extends BaseSchema {
  type?: 'enum';
  values?: any[];
}

export interface EmailSchema extends BaseSchema {
  type?: 'email';
  mode?: string;
  normalize?: boolean;
}

export interface UrlSchema extends BaseSchema {
  type?: 'url';
}

export interface MultiSchema extends BaseSchema {
  type?: 'multi';
  rules?: Schema[];
}

export interface AnySchema extends BaseSchema {
  type?: 'any';
}

export interface ForbiddenSchema extends BaseSchema {
  type?: 'forbidden';
}
```

### 4.3 Schema-Union-Typ

```typescript
export type SchemaDefinition = 
  | StringSchema 
  | NumberSchema 
  | BooleanSchema 
  | DateSchema 
  | ArraySchema 
  | ObjectSchema 
  | EnumSchema 
  | EmailSchema 
  | UrlSchema 
  | MultiSchema 
  | AnySchema 
  | ForbiddenSchema
  | BaseSchema;

// Rekursiver Schema-Typ
export type Schema = 
  | string // String shorthand wie 'string', 'number', etc.
  | SchemaDefinition // Vollständige Schema-Definition
  | Schema[] // Array von Schemas für Multi-Type-Validierung
  | { [key: string]: Schema }; // Objekt mit Properties (rekursiv)
```

### 4.4 ModelValidator Interface

```typescript
export interface ModelValidator {
  compile(schema: Schema, options?: ValidationOptions): ValidationFunction;
  validate<T = any>(obj: T, schema: Schema): ValidationResult;
  addRule(typeName: string, ruleFn: Function): void;
}
```

---

## 5. Schema-Validator Typisierung (`lib/schemaValidator.mts`)

### Neue Typ-Definitionen

```typescript
type ValidType = typeof validTypes[number];

interface BaseSchemaObject {
  type: ValidType;
  optional?: boolean;
  nullable?: boolean;
  messages?: Record<string, string>;
}

// Spezifische Schema-Interfaces für Validierung
interface StringSchema extends BaseSchemaObject {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  // ... weitere Properties
}

// ... weitere Schema-Interfaces

export type ValidationSchema = ValidType | SchemaObject | ValidationSchema[];
```

### Validierungs-Funktionen

```typescript
export function validateSchema(schema: ValidationSchema, path: string = ''): SchemaValidationError[]

export function validateOptions(options: any): SchemaValidationError[]
```

---

## 6. Test-Anpassungen

### 6.1 Test-Framework Migration

**Von:** Jest  
**Zu:** Node.js Test Runner

### 6.2 Import-Änderungen

```typescript
// Alt (Jest)
const assert = require('assert');
const ModelValidator = require('../lib/validator');

// Neu (Node.js Test Runner)
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import ModelValidator from '../lib/validator.mts';
```

### 6.3 Typ-Assertions in Tests

Für Tests mit absichtlich ungültigen Schemas:

```typescript
// Beispiel: Test mit ungültigem Schema
const errors = validateSchema('invalid' as any);
const errors = validateSchema(null as any);
const errors = validateSchema({ type: 'invalidType' } as any);
```

### 6.4 Typ-Assertions für Runtime-Mutationen

```typescript
// Bei convert-Option, die Typen zur Laufzeit ändert
const parameters: { date: string | Date } = { date: '2020-02-24T15:17:51.908Z' };
validator.compile(schema)(parameters);
assert.ok(parameters.date instanceof Date);
```

---

## 7. Wichtige Design-Entscheidungen

### 7.1 Optionale `type`-Properties

**Problem:** TypeScript kann Literal-Typen (`type: 'string'`) nicht mit Union-Typen matchen, wenn `type: string` verwendet wird.

**Lösung:** Alle `type`-Properties sind optional (`type?: 'string'`), um Flexibilität zu gewährleisten.

### 7.2 Index-Signatur in BaseSchema

```typescript
[key: string]: any;
```

**Grund:** Erlaubt zusätzliche Properties wie `convert`, `normalize`, `mode`, die nicht in allen Schema-Typen definiert sind.

### 7.3 Rekursiver Schema-Typ

```typescript
export type Schema = 
  | string
  | SchemaDefinition
  | Schema[]
  | { [key: string]: Schema };
```

**Grund:** Unterstützt verschachtelte Objekt-Schemas wie:
```typescript
{
  user: {
    name: { type: 'string' },
    age: { type: 'number' }
  }
}
```

### 7.4 Generischer Typ-Parameter in `validate`

```typescript
validate<T = any>(obj: T, schema: Schema): ValidationResult;
```

**Vorteil:** Ermöglicht Type-Safety für das zu validierende Objekt:
```typescript
interface User { name: string; age: number; }
validator.validate<User>({ name: 'test', age: 25 }, schema);
```

---

## 8. Testergebnisse

### Finale Test-Statistik

```
✅ 72/72 Tests bestehen (100%)
✅ 18 Test-Suites
✅ Keine Fehler
```

### Test-Kategorien

- ✅ Any Validator
- ✅ Array Type
- ✅ Boolean Validator
- ✅ Date Validator
- ✅ Email Validator
- ✅ Enum Validator
- ✅ Forbidden Value Test
- ✅ Multi Type Test
- ✅ Number Validator
- ✅ Object Validator
- ✅ String Validator
- ✅ String Pattern Validations (UUID, Phone, Hex, Pattern, Base64)
- ✅ URL Validator

---

## 9. Breaking Changes

### Keine Breaking Changes für Nutzer

Die API bleibt vollständig kompatibel:

```typescript
// Funktioniert weiterhin
const validator = ModelValidator();
const validate = validator.compile({ name: { type: 'string' } });
const result = validate({ name: 'test' });
```

### Interne Änderungen

- Dateiendungen: `.js` → `.mts`
- Test-Framework: Jest → Node.js Test Runner
- TypeScript-Typen verfügbar

---

## 10. Vorteile der Migration

### 10.1 Type-Safety

- ✅ Vollständige IntelliSense-Unterstützung
- ✅ IDE Type-Checking
- ✅ Bessere IDE-Integration

### 10.2 Dokumentation

- ✅ Typen dienen als lebende Dokumentation
- ✅ Klare API-Kontrakte
- ✅ Selbsterklärende Schema-Definitionen

### 10.3 Wartbarkeit

- ✅ Einfacheres Refactoring
- ✅ Weniger Runtime-Fehler
- ✅ Bessere Code-Qualität

### 10.4 Performance & Einfachheit

- ✅ Keine Runtime-Overhead (Typen werden von Node.js entfernt)
- ✅ Gleiche Performance wie vorher
- ✅ **Kein Build-Step erforderlich**
- ✅ **Direkte Ausführung mit Node.js**
- ✅ **Keine zusätzlichen Tools (TSC, Babel, etc.)**

---

## 11. Migration-Checklist

- [x] Node.js Version >= 22.6.0 sicherstellen
- [x] Alle `.js` Dateien zu `.mts` umbenannt
- [x] `package.json` aktualisiert (main, types, scripts)
- [x] `tsconfig.json` erstellt (optional, für IDE)
- [x] Typ-Definitionen für alle Interfaces erstellt
- [x] Schema-Typen vollständig definiert
- [x] ModelValidator-Interface typisiert
- [x] Tests auf Node.js Test Runner migriert
- [x] Alle Tests erfolgreich (72/72)
- [x] Keine Breaking Changes
- [x] Dokumentation aktualisiert

---

## 12. Ausführung

### Development

```bash
# Tests ausführen (mit Type Stripping)
node --test test/**/*.mts

# Tests mit Watch-Mode
node --test --watch test/**/*.mts

# Einzelne Datei ausführen
node lib/validator.mts
```

### Production

```bash
# Direkte Ausführung ohne Build
node your-app.mts
```

**Wichtig:** Keine Build-Steps, keine Transpiler, keine zusätzlichen Tools erforderlich!

---

## 13. Nächste Schritte (Optional)

### 13.1 Weitere Verbesserungen

- [ ] Strikte Typen für `messages`-Objekt
- [ ] Branded Types für spezifische String-Formate (UUID, Email, etc.)
- [ ] Conditional Types für Schema-basierte Return-Types

### 13.2 Dokumentation

- [ ] Beispiele mit TypeScript-Code aktualisieren
- [ ] Migration-Guide für Nutzer erstellen

---

## 14. Kontakt

**Autor:** Kevin Ries  
**Email:** kevin.ries@fachwerk.io  
**Firma:** Fachwerk Software  
**Website:** https://weave-js.com

---

## Anhang: Wichtige Code-Snippets

### Verwendung mit TypeScript

```typescript
import ModelValidator, { 
  ValidationResult, 
  ValidationError,
  Schema 
} from '@weave-js/validator';

// Schema definieren
const userSchema: Schema = {
  name: { type: 'string', minLength: 2 },
  age: { type: 'number', min: 0, integer: true },
  email: { type: 'email' }
};

// Validator erstellen
const validator = ModelValidator();
const validate = validator.compile(userSchema);

// Validieren
interface User {
  name: string;
  age: number;
  email: string;
}

const result = validate({ 
  name: 'John', 
  age: 30, 
  email: 'john@example.com' 
});

if (result === true) {
  console.log('Valid!');
} else {
  result.forEach((error: ValidationError) => {
    console.error(`${error.field}: ${error.message}`);
  });
}
```

### Custom Validator mit TypeScript

```typescript
import ModelValidator from '@weave-js/validator';

const validator = ModelValidator();

// Custom Rule hinzufügen
validator.addRule('custom', function(this: any, { schema, messages }: any) {
  return {
    isSanitized: false,
    code: `
      if (value !== 'custom') {
        errors.push({ 
          type: 'custom', 
          message: 'Value must be "custom"',
          field: field 
        });
      }
      return value;
    `
  };
});

// Verwenden
const schema = {
  field: { type: 'custom' }
};

const validate = validator.compile(schema);
const result = validate({ field: 'custom' });
```
