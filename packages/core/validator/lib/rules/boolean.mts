import type { CompiledRule, RuleGeneratorContext, RuleGeneratorResult } from "../types.mts";

export default function checkBoolean(
  this: RuleGeneratorContext,
  { schema, messages }: CompiledRule,
): RuleGeneratorResult {
  const code = [];
  let sanitized = false;

  if (schema.convert) {
    sanitized = true;
    code.push(`
      if (typeof value !== 'boolean') {
        if (value === 1 || value === 'true') {
          value = true
        } else if (value === 0 || value === 'false') {
          value = false
        }
      }
    `);
  }

  code.push(`
    if (typeof value !== 'boolean') {
      ${this.makeErrorCode({ type: "boolean", passed: "value", messages })}
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
