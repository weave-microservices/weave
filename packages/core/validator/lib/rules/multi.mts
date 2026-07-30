import type { CompileContext, CompiledRule, RuleGeneratorContext, RuleGeneratorResult } from "../types.mts";

/* Signature: function(value, field, parent, errors, context) */
export default function checkMulti(
  this: RuleGeneratorContext,
  { schema }: CompiledRule,
  path: string,
  context: CompileContext,
): RuleGeneratorResult {
  const code = [];

  code.push(`
		let previousErrorLength = errors.length
		let errorBefore = 0
		let hasValid = false
    let newValue = value
	`);

  const subRules = schema.rules ?? [];

  for (let i = 0; i < subRules.length; i++) {
    code.push(`
      if (!hasValid) {
        errorBefore = errors.length
    `);

    const rule = this.getRuleFromSchema(subRules[i]);
    code.push(
      this.compileRule(
        rule,
        context,
        path,
        "var tempValue = context.func[##INDEX##](value, field, parent, errors, context)",
        "tempValue",
      ),
    );

    code.push(`
        if (errors.length === errorBefore) {
          hasValid = true
          newValue = tempValue
        }
      }
    `);
  }

  code.push(`
    if (hasValid) {
      errors.length = previousErrorLength
    }
    return newValue
  `);

  return {
    code: code.join("\n"),
  };
}
