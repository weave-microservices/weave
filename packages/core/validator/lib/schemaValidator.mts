/**
 * @fileoverview Schema validator to validate validator schemas themselves
 * This helps catch schema definition errors early before compilation
 * @author Kevin Ries <kevin.ries@fachwerk.io>
 * @version 0.14.0
 */

/**
 * Valid schema type identifiers supported by the validator
 */
const validTypes = [
  "any",
  "array",
  "boolean",
  "date",
  "email",
  "enum",
  "forbidden",
  "multi",
  "number",
  "object",
  "string",
  "url",
] as const;

type ValidType = (typeof validTypes)[number];

/**
 * Valid strict mode values for validation options
 */
const validStrictModes = ["remove", "error"] as const;

/**
 * Validation error object for schema validation
 */
export interface SchemaValidationError {
  path: string;
  message: string;
}

/**
 * A schema as it arrives at the validator - the properties are what has to be
 * checked, so they cannot be assumed to have the right types yet.
 */
type UnvalidatedSchema = Record<string, unknown>;

/**
 * Base schema properties common to all schema types
 */
interface BaseSchemaObject {
  type: ValidType;
  optional?: boolean;
  nullable?: boolean;
  messages?: Record<string, string>;
}

/**
 * String-specific schema properties
 */
interface StringSchema extends BaseSchemaObject {
  type: "string";
  minLength?: number;
  maxLength?: number;
  trim?: boolean;
  trimLeft?: boolean;
  trimRight?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  base64?: boolean;
  uuid?: boolean;
  phone?: boolean;
  hex?: boolean;
  equal?: string;
  pattern?: RegExp | string;
}

/**
 * Number-specific schema properties
 */
interface NumberSchema extends BaseSchemaObject {
  type: "number";
  min?: number;
  max?: number;
  equal?: number;
  notEqual?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
}

/**
 * Array-specific schema properties
 */
interface ArraySchema extends BaseSchemaObject {
  type: "array";
  minLength?: number;
  maxLength?: number;
  length?: number;
  itemType?: ValidationSchema;
}

/**
 * Object-specific schema properties
 */
interface ObjectSchema extends BaseSchemaObject {
  type: "object";
  strict?: boolean;
  properties?: Record<string, ValidationSchema>;
  props?: Record<string, ValidationSchema>;
}

/**
 * Enum-specific schema properties
 */
interface EnumSchema extends BaseSchemaObject {
  type: "enum";
  values: unknown[];
}

/**
 * Multi-type schema properties (union schemas)
 */
interface MultiSchema extends BaseSchemaObject {
  type: "multi";
  rules: ValidationSchema[];
}

/**
 * Other simple schema types
 */
interface SimpleSchema extends BaseSchemaObject {
  type: "any" | "boolean" | "date" | "email" | "forbidden" | "url";
}

/**
 * Union of all possible schema object types
 */
type SchemaObject =
  | StringSchema
  | NumberSchema
  | ArraySchema
  | ObjectSchema
  | EnumSchema
  | MultiSchema
  | SimpleSchema;

/**
 * Complete validation schema type definition
 * Can be a string shorthand, an array of schemas (multi-type), or a schema object
 */
export type ValidationSchema = ValidType | SchemaObject | ValidationSchema[];

/**
 * Validates a validation schema for correctness and compliance
 * @param schema - The schema to validate
 * @param path - The current path in the schema (for error reporting)
 * @returns Array of validation errors (empty if valid)
 */
export function validateSchema(
  schema: ValidationSchema,
  path: string = "",
): SchemaValidationError[] {
  const errors: SchemaValidationError[] = [];

  if (typeof schema === "string") {
    // String shorthand
    if (!validTypes.includes(schema as (typeof validTypes)[number])) {
      errors.push({
        path,
        message: `Invalid type "${schema}". Valid types: ${validTypes.join(", ")}`,
      });
    }
    return errors;
  }

  if (Array.isArray(schema)) {
    // Multi-type schema
    if (schema.length === 0) {
      errors.push({
        path,
        message: "Multi-type schema array cannot be empty",
      });
    } else {
      schema.forEach((subSchema, index) => {
        errors.push(...validateSchema(subSchema, `${path}[${index}]`));
      });
    }
    return errors;
  }

  if (typeof schema !== "object" || schema === null) {
    errors.push({
      path,
      message: "Schema must be an object, string, or array",
    });
    return errors;
  }

  // Type assertion after validation - schema is now known to be an object
  const schemaObj = schema as unknown as UnvalidatedSchema;

  // Validate type property
  if (!schemaObj.type) {
    errors.push({
      path: `${path}.type`,
      message: 'Schema must have a "type" property',
    });
  } else if (!validTypes.includes(schemaObj.type as ValidType)) {
    errors.push({
      path: `${path}.type`,
      message: `Invalid type "${schemaObj.type}". Valid types: ${validTypes.join(", ")}`,
    });
  }

  // Type-specific validations
  switch (schemaObj.type) {
    case "string":
      validateStringSchema(schemaObj, path, errors);
      break;
    case "number":
      validateNumberSchema(schemaObj, path, errors);
      break;
    case "array":
      validateArraySchema(schemaObj, path, errors);
      break;
    case "object":
      validateObjectSchema(schemaObj, path, errors);
      break;
    case "enum":
      validateEnumSchema(schemaObj, path, errors);
      break;
    case "multi":
      validateMultiSchema(schemaObj, path, errors);
      break;
  }

  // Common validations
  if (schemaObj.optional !== undefined && typeof schemaObj.optional !== "boolean") {
    errors.push({
      path: `${path}.optional`,
      message: "Optional must be a boolean",
    });
  }

  if (schemaObj.nullable !== undefined && typeof schemaObj.nullable !== "boolean") {
    errors.push({
      path: `${path}.nullable`,
      message: "Nullable must be a boolean",
    });
  }

  if (
    schemaObj.messages !== undefined &&
    (typeof schemaObj.messages !== "object" || schemaObj.messages === null)
  ) {
    errors.push({
      path: `${path}.messages`,
      message: "Messages must be an object",
    });
  }

  return errors;
}

/**
 * Validates string-specific schema properties
 */
function validateStringSchema(schema: UnvalidatedSchema, path: string, errors: SchemaValidationError[]): void {
  const numericProps = ["minLength", "maxLength"];
  numericProps.forEach((prop) => {
    if (schema[prop] !== undefined) {
      if (typeof schema[prop] !== "number" || schema[prop] < 0 || !Number.isInteger(schema[prop])) {
        errors.push({
          path: `${path}.${prop}`,
          message: `${prop} must be a non-negative integer`,
        });
      }
    }
  });

  if (typeof schema.minLength === "number" && typeof schema.maxLength === "number") {
    if (schema.minLength > schema.maxLength) {
      errors.push({
        path: `${path}.minLength`,
        message: "minLength cannot be greater than maxLength",
      });
    }
  }

  const booleanProps = [
    "trim",
    "trimLeft",
    "trimRight",
    "uppercase",
    "lowercase",
    "base64",
    "uuid",
    "phone",
    "hex",
  ];
  booleanProps.forEach((prop) => {
    if (schema[prop] !== undefined && typeof schema[prop] !== "boolean") {
      errors.push({
        path: `${path}.${prop}`,
        message: `${prop} must be a boolean`,
      });
    }
  });

  if (schema.equal !== undefined && typeof schema.equal !== "string") {
    errors.push({
      path: `${path}.equal`,
      message: "equal must be a string",
    });
  }

  if (schema.pattern !== undefined) {
    if (!(schema.pattern instanceof RegExp) && typeof schema.pattern !== "string") {
      errors.push({
        path: `${path}.pattern`,
        message: "pattern must be a RegExp or string",
      });
    }
  }
}

/**
 * Validates number-specific schema properties
 */
function validateNumberSchema(schema: UnvalidatedSchema, path: string, errors: SchemaValidationError[]): void {
  const numericProps = ["min", "max", "equal", "notEqual"];
  numericProps.forEach((prop) => {
    if (schema[prop] !== undefined && typeof schema[prop] !== "number") {
      errors.push({
        path: `${path}.${prop}`,
        message: `${prop} must be a number`,
      });
    }
  });

  if (typeof schema.min === "number" && typeof schema.max === "number") {
    if (schema.min > schema.max) {
      errors.push({
        path: `${path}.min`,
        message: "min cannot be greater than max",
      });
    }
  }

  const booleanProps = ["integer", "positive", "negative"];
  booleanProps.forEach((prop) => {
    if (schema[prop] !== undefined && typeof schema[prop] !== "boolean") {
      errors.push({
        path: `${path}.${prop}`,
        message: `${prop} must be a boolean`,
      });
    }
  });
}

/**
 * Validates array-specific schema properties
 */
function validateArraySchema(schema: UnvalidatedSchema, path: string, errors: SchemaValidationError[]): void {
  const numericProps = ["minLength", "maxLength", "length"];
  numericProps.forEach((prop) => {
    if (schema[prop] !== undefined) {
      if (typeof schema[prop] !== "number" || schema[prop] < 0 || !Number.isInteger(schema[prop])) {
        errors.push({
          path: `${path}.${prop}`,
          message: `${prop} must be a non-negative integer`,
        });
      }
    }
  });

  if (schema.itemType !== undefined) {
    errors.push(...validateSchema(schema.itemType as ValidationSchema, `${path}.itemType`));
  }
}

/**
 * Validates object-specific schema properties
 */
function validateObjectSchema(schema: UnvalidatedSchema, path: string, errors: SchemaValidationError[]): void {
  if (schema.strict !== undefined && typeof schema.strict !== "boolean") {
    errors.push({
      path: `${path}.strict`,
      message: "strict must be a boolean",
    });
  }

  // Check properties and props separately to handle null values correctly
  if (schema.properties !== undefined) {
    if (typeof schema.properties !== "object" || schema.properties === null) {
      errors.push({
        path: `${path}.properties`,
        message: "properties must be an object",
      });
    } else {
      const properties = schema.properties as Record<string, ValidationSchema>;

      Object.keys(properties).forEach((key) => {
        errors.push(...validateSchema(properties[key], `${path}.properties.${key}`));
      });
    }
  } else if (schema.props !== undefined) {
    if (typeof schema.props !== "object" || schema.props === null) {
      errors.push({
        path: `${path}.properties`,
        message: "properties must be an object",
      });
    } else {
      const props = schema.props as Record<string, ValidationSchema>;

      Object.keys(props).forEach((key) => {
        errors.push(...validateSchema(props[key], `${path}.properties.${key}`));
      });
    }
  }
}

/**
 * Validates enum-specific schema properties
 */
function validateEnumSchema(schema: UnvalidatedSchema, path: string, errors: SchemaValidationError[]): void {
  if (!Array.isArray(schema.values)) {
    errors.push({
      path: `${path}.values`,
      message: "enum values must be an array",
    });
  } else if (schema.values.length === 0) {
    errors.push({
      path: `${path}.values`,
      message: "enum values array cannot be empty",
    });
  }
}

/**
 * Validates multi-type schema properties (union schemas)
 */
function validateMultiSchema(schema: UnvalidatedSchema, path: string, errors: SchemaValidationError[]): void {
  if (!Array.isArray(schema.rules)) {
    errors.push({
      path: `${path}.rules`,
      message: "multi rules must be an array",
    });
  } else if (schema.rules.length === 0) {
    errors.push({
      path: `${path}.rules`,
      message: "multi rules array cannot be empty",
    });
  } else {
    (schema.rules as unknown[]).forEach((rule, index) => {
      errors.push(...validateSchema(rule as ValidationSchema, `${path}.rules[${index}]`));
    });
  }
}

/**
 * Validates validation options for correctness
 */
export function validateOptions(options: unknown): SchemaValidationError[] {
  const errors: SchemaValidationError[] = [];

  if (typeof options !== "object" || options === null) {
    errors.push({
      path: "options",
      message: "Options must be an object",
    });
    return errors;
  }

  const optionsObject = options as Record<string, unknown>;

  if (optionsObject.strict !== undefined && typeof optionsObject.strict !== "boolean") {
    errors.push({
      path: "optionsObject.strict",
      message: "strict must be a boolean",
    });
  }

  if (optionsObject.strictMode !== undefined && !validStrictModes.includes(optionsObject.strictMode as (typeof validStrictModes)[number])) {
    errors.push({
      path: "optionsObject.strictMode",
      message: `strictMode must be one of: ${validStrictModes.join(", ")}`,
    });
  }

  if (optionsObject.root !== undefined && typeof optionsObject.root !== "boolean") {
    errors.push({
      path: "optionsObject.root",
      message: "root must be a boolean",
    });
  }

  return errors;
}
