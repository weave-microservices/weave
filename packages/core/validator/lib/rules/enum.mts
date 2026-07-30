import type { CompiledRule, RuleGeneratorContext, RuleGeneratorResult } from "../types.mts";

export default function checkEnum(
  this: RuleGeneratorContext,
  { schema, messages }: CompiledRule,
): RuleGeneratorResult {
  const enumString = JSON.stringify(schema.values || []);

  return {
    code: `
      if (${enumString}.indexOf(value) === -1) {
        ${this.makeErrorCode({ type: "enumValues", passed: "value", messages })}
      }
      return value
    `,
  };
}
