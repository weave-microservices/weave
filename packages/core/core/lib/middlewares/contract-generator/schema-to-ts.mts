import type { WeaveAction, WeaveEvent } from "../../../types/index.js";

function renderObject(properties: Record<string, string>, indent = 0): string {
  const space = "  ".repeat(indent);
  const space2 = "  ".repeat(indent + 1);

  const entries = Object.entries(properties)
    .map(([key, value]) => `${space2}${key}: ${value};`)
    .join("\n");

  return `{\n${entries}\n${space}}`;
}

function ruleToTs(rule: any, indent = 0): string {
  if (typeof rule === "string") {
    return rule;
  }

  switch (rule.type) {
    case "string":
    case "number":
    case "boolean":
      return rule.type;

    case "enum":
      return rule.values.map((v: string) => JSON.stringify(v)).join(" | ");

    case "array":
      return `${ruleToTs(rule.items, indent)}[]`;

    case "object": {
      const props: Record<string, string> = {};
      if (rule.props) {
        for (const [key, value] of Object.entries(rule.props)) {
          props[key] = ruleToTs(value, indent + 1);
        }
      }

      return renderObject(props, indent);
    }

    default:
      throw new Error(`unknown schema type: ${rule.type}`);
  }
}

export function schemaToTs(schema: Record<string, any>): string {
  const props: Record<string, string> = {};

  for (const [key, value] of Object.entries(schema)) {
    props[key] = ruleToTs(value, 1);
  }

  return renderObject(props, 1);
}

export function generateActionContract(actions: WeaveAction[]): string {
  const blocks = actions.map((actionDefinition) => {
    let props = "";

    if (actionDefinition.action.params) {
      props += `params: ${schemaToTs(actionDefinition.action.params)};\n`;
    }

    if (actionDefinition.action.responseSchema) {
      props += `response: ${schemaToTs(actionDefinition.action.responseSchema)};\n`;
    } else {
      props += `response: { type: any };\n`;
    }

    return `"${actionDefinition.name}": {\n${props}}`;
  });

  return `
  declare module "@weave-js/core" {
    interface ActionContracts {
  ${blocks.map((b) => "    " + b).join(";\n")}
    }
  }
  
  export {};
  `;
}

export function generateEventContract(events: WeaveEvent[]): string {
  const blocks = events.map((evt) => {
    let props = "";

    if (evt.event.params) {
      props += `params: ${schemaToTs(evt.event.params)};\n`;
    }

    return `"${evt.name}": {\n${props}}`;
  });

  return `
  declare module "@weave-js/core" {
    interface EventContracts {
  ${blocks.map((b) => "    " + b).join(";\n")}
    }
  }
  
  export {};
  `;
}
