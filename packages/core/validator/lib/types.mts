/**
 * @fileoverview Internal types of the code generating validator - the shapes the
 * rule generators are called with.
 */

import type { Schema, ValidationOptions } from "./validator.mts";

/**
 * A schema in its normalized object form. The fields are the union of what the
 * individual rules read - which of them apply depends on `type`.
 */
export interface NormalizedSchema {
  type: string;
  optional?: boolean;
  nullable?: boolean;
  default?: unknown;
  convert?: boolean;
  messages?: Record<string, string>;
  strict?: boolean;
  /** array */
  minLength?: number;
  maxLength?: number;
  length?: number;
  contains?: unknown;
  unique?: boolean;
  empty?: boolean;
  items?: Schema | string;
  /** number */
  min?: number;
  max?: number;
  equal?: string | number;
  notEqual?: string | number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
  /** string */
  pattern?: RegExp | string;
  patternFlags?: string;
  alpha?: boolean;
  numeric?: boolean;
  alphanum?: boolean;
  alphadash?: boolean;
  hex?: boolean;
  singleLine?: boolean;
  base64?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  localeLowercase?: boolean;
  localeUppercase?: boolean;
  padStart?: number;
  padEnd?: number;
  padChar?: string;
  trim?: boolean;
  trimLeft?: boolean;
  trimRight?: boolean;
  /** date */
  /** email */
  mode?: string;
  /** enum */
  values?: unknown[];
  /** multi */
  rules?: Array<Schema | string>;
  /** object */
  properties?: Record<string, Schema | string>;
  props?: Record<string, Schema | string>;
  [key: string]: unknown;
}

/** Options of a generated error. */
export interface MakeErrorCodeOptions {
  type: string;
  messages: Record<string, string>;
  /** Source expression of the expected value. */
  expected?: string | number;
  /** Source expression of the passed value. */
  passed?: string | number;
  /** Source expression of the actual value (alias used by some rules). */
  actual?: string | number;
  field?: string;
}

/** A schema together with the rule generator that handles it. */
export interface CompiledRule {
  schema: NormalizedSchema;
  ruleGeneratorFunction: RuleGenerator;
  messages: Record<string, string>;
  index?: number;
}

/** State that is carried through one compilation run. */
export interface CompileContext {
  index: number;
  rules: CompiledRule[];
  func: Array<(...args: unknown[]) => unknown>;
  options: ValidationOptions;
  data?: unknown;
  customs?: Record<string, unknown>;
}

/** The `this` a rule generator is called with. */
export interface RuleGeneratorContext {
  makeErrorCode(options: MakeErrorCodeOptions): string;
  /** Accepts every shorthand form a schema can have and normalizes it. */
  getRuleFromSchema(schema: unknown): CompiledRule;
  compileRule(
    rule: CompiledRule,
    context: CompileContext,
    path: string,
    innerSrc: string,
    sourceVar: string,
  ): string;
}

/**
 * What a rule generator returns - the generated source and whether the rule
 * converts the value. The `sanitized` flag is currently informational; nothing
 * in the compiler reads it.
 */
export interface RuleGeneratorResult {
  code: string;
  sanitized?: boolean;
}

/** A rule generator turns a schema into validation source code. */
export type RuleGenerator = (
  this: RuleGeneratorContext,
  rule: CompiledRule,
  path: string,
  context: CompileContext,
) => RuleGeneratorResult;
