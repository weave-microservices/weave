function ruleToTs(rule: string | object): string {
  if (typeof rule === "string") {
    return rule;
  } else {
    switch (rule.type) {
      case "string":
      case "number":
      case "boolean":
        return rule.type;

      case "enum":
        return rule.values.map((v: string) => JSON.stringify(v)).join(" | ");

      case "array":
        return `${schemaToTs(rule.items)}[]`;

      case "object":
        return `{ ${Object.entries(rule.properties)
          .map(([key, value]) => {
            console.log(key, value);
            return `${key}: ${ruleToTs(value)}`;
          })
          .join("; ")} }`;

      default:
        throw new Error(`unknown schema type: ${rule.type}`);
    }
  }
}

export function schemaToTs(schema: any): string {
  let rules = Object.entries(schema);
  return rules
    .map(([key, value]) => {
      return `${key}: ${ruleToTs(value)}`;
    })
    .join("; ");
}

export function generateTypeScriptContract(actions: any[]): string {
  let actionsString = actions
    .map((actionDefinition) => {
      let properties: string[] = [];

      if (actionDefinition.action.params) {
        properties.push(`params: { ${schemaToTs(actionDefinition.action.params)} };`);
      }

      if (actionDefinition.action.responseSchema) {
        properties.push(`response: { ${schemaToTs(actionDefinition.action.responseSchema)} };`);
      } else {
        properties.push(`response: { type: any };`);
      }

      return `"${actionDefinition.name}": { 
        ${properties.join("\n")}
    }`;
    })
    .join(";\n");

  return `
declare module "@weave-js/core" {
  interface ActionContracts {
    ${actionsString}
  }
}

export {}
`;
}
