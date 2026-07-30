import type {
  ParsedAction,
  ParsedEvent,
  ServiceActionParamSchema,
  TypeMap,
} from "../../../types/index.js";

function renderObject(properties: Record<string, string>, indent = 0): string {
  const space = "  ".repeat(indent);
  const space2 = "  ".repeat(indent + 1);

  const entries = Object.entries(properties)
    .map(([key, value]) => `${space2}${key}: ${value};`)
    .join("\n");

  return `{\n${entries}\n${space}}`;
}

// @weave-js/validator type mappings to TypeScript types
const typeMapping: Record<string, string> = {
  // Primitive types
  string: "string",
  number: "number",
  boolean: "boolean",
  any: "any",

  // String-based validation types
  email: "string",
  url: "string",

  // Date type
  date: "Date",

  // Special types
  forbidden: "never",
};

function ruleToTs(rule: any, indent = 0): string {
  // Handle undefined, null, or invalid rules gracefully
  if (rule == null) {
    return "any";
  }

  // Handle shorthand string notation (e.g., "string", "number")
  if (typeof rule === "string") {
    return typeMapping[rule] ?? "any";
  }

  // Handle rules without a type property
  if (typeof rule !== "object" || !rule.type) {
    return "any";
  }

  const { type } = rule;

  // Check for direct type mapping
  if (type in typeMapping) {
    return typeMapping[type];
  }

  // Handle complex types
  switch (type) {
    case "enum":
      if (Array.isArray(rule.values)) {
        return rule.values.map((v: unknown) => JSON.stringify(v)).join(" | ");
      }
      return "any";

    case "array": {
      const itemType = rule.itemType ? ruleToTs(rule.itemType, indent) : "any";
      return `${itemType}[]`;
    }

    case "object": {
      const props: Record<string, string> = {};
      // Support both 'props' and 'properties' as per ObjectSchema
      const properties = rule.props ?? rule.properties;
      if (properties && typeof properties === "object") {
        for (const [key, value] of Object.entries(properties)) {
          props[key] = ruleToTs(value, indent + 1);
        }
      }
      return renderObject(props, indent);
    }

    case "multi": {
      if (Array.isArray(rule.rules)) {
        const types = rule.rules.map((r: any) => ruleToTs(r, indent));
        return types.join(" | ");
      }
      return "any";
    }

    default:
      // Unknown type - return 'any' instead of throwing
      return "any";
  }
}

/** A validation schema in any of the forms the validator accepts. */
type SchemaLike = Record<string, unknown> | ServiceActionParamSchema | keyof TypeMap;

export function schemaToTs(schema: SchemaLike): string {
  const props: Record<string, string> = {};

  for (const [key, value] of Object.entries(schema)) {
    props[key] = ruleToTs(value, 1);
  }

  return renderObject(props, 1);
}

/** An entry of the action list, carrying the parsed action itself. */
interface ActionListEntry {
  name: string;
  action?: Pick<ParsedAction, "params" | "responseSchema">;
}

/** An entry of the event list, carrying the parsed event itself. */
interface EventListEntry {
  name: string;
  event?: Pick<ParsedEvent, "params">;
}

export function generateActionContract(actions: ActionListEntry[]): string {
  const blocks = actions
    .filter((actionDefinition) => actionDefinition?.action != null)
    .map((actionDefinition) => {
      let props = "";

      if (actionDefinition.action!.params) {
        props += `params: ${schemaToTs(actionDefinition.action!.params)};\n`;
      }

      if (actionDefinition.action!.responseSchema) {
        props += `response: ${schemaToTs(actionDefinition.action!.responseSchema)};\n`;
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

export function generateEventContract(events: EventListEntry[]): string {
  const blocks = events
    .filter((evt) => evt?.event != null)
    .map((evt) => {
      let props = "";

      if (evt.event!.params) {
        props += `params: ${schemaToTs(evt.event!.params)};\n`;
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
