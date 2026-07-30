import type { CompiledRule, RuleGeneratorContext, RuleGeneratorResult } from "../types.mts";

import { EMAIL_PRECISE_PATTERN, EMAIL_BASIC_PATTERN } from "../patterns.mts";

export default function checkEmail(
  this: RuleGeneratorContext,
  { schema, messages }: CompiledRule,
): RuleGeneratorResult {
  const code = [];
  const pattern = schema.mode === "precise" ? EMAIL_PRECISE_PATTERN : EMAIL_BASIC_PATTERN;
  let sanitized;

  code.push(`
        if (typeof value !== 'string') {
          ${this.makeErrorCode({ type: "string", passed: "value", messages })}
          return value
        }
    `);

  if (schema.normalize) {
    sanitized = true;
    code.push(`
        value = value.trim().toLowerCase()
    `);
  }

  code.push(`
        if (!${pattern.toString()}.test(value)) {
          ${this.makeErrorCode({ type: "email", passed: "value", messages })}
          return value
        }
    `);

  code.push(`
    return value
  `);

  return {
    sanitized,
    code: code.join("\n"),
  };
}
