import defaultMessages from "./messages.mts";
import { validateSchema, validateOptions } from "./schemaValidator.mts";

// Import all rules
import checkAny from "./rules/any.mts";
import checkArray from "./rules/array.mts";
import checkBoolean from "./rules/boolean.mts";
import checkDate from "./rules/date.mts";
import checkEmail from "./rules/email.mts";
import checkEnum from "./rules/enum.mts";
import checkForbidden from "./rules/forbidden.mts";
import checkMulti from "./rules/multi.mts";
import checkNumber from "./rules/number.mts";
import checkObject from "./rules/object.mts";
import checkString from "./rules/string.mts";
import checkUrl from "./rules/url.mts";

/**
 * @fileoverview Weave Validator - High-performance schema validation library using code generation
 * @author Kevin Ries <kevin.ries@fachwerk.io>
 * @version 0.14.0
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface ValidationOptions {
  /** Enables strict mode */
  strict?: boolean;
  /** Set strict mode behavior: 'remove' removes extra properties, 'error' throws validation error */
  strictMode?: "remove" | "error";
  /** Validate a root value */
  root?: boolean;
  /** Whether to validate the schema structure before compilation */
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

// Schema definitions
export interface BaseSchema {
  type?: string;
  optional?: boolean;
  nullable?: boolean;
  default?: any;
  messages?: Record<string, string>;
  [key: string]: any; // Allow additional properties
}

export interface StringSchema extends BaseSchema {
  type?: "string";
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
  type?: "number";
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
  type?: "boolean";
  convert?: boolean;
}

export interface DateSchema extends BaseSchema {
  type?: "date";
  convert?: boolean;
}

export interface ArraySchema extends BaseSchema {
  type?: "array";
  minLength?: number;
  maxLength?: number;
  length?: number;
  contains?: any;
  itemType?: Schema;
}

export interface ObjectSchema extends BaseSchema {
  type?: "object";
  strict?: boolean;
  properties?: Record<string, Schema>;
  props?: Record<string, Schema>;
}

export interface EnumSchema extends BaseSchema {
  type?: "enum";
  values?: any[];
}

export interface EmailSchema extends BaseSchema {
  type?: "email";
  mode?: string;
  normalize?: boolean;
}

export interface UrlSchema extends BaseSchema {
  type?: "url";
}

export interface MultiSchema extends BaseSchema {
  type?: "multi";
  rules?: Schema[];
}

export interface AnySchema extends BaseSchema {
  type?: "any";
}

export interface ForbiddenSchema extends BaseSchema {
  type?: "forbidden";
}

// Schema can be a specific schema type, a string shorthand, an array of schemas, or a generic object
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

// Schema type that allows string shorthands, schema objects, arrays, and nested object schemas
export type Schema =
  | string // String shorthand like 'string', 'number', etc.
  | SchemaDefinition // Full schema definition
  | Schema[] // Array of schemas for multi-type validation
  | { [key: string]: Schema }; // Object with properties (recursive)

// Main validator interface
export interface ModelValidator {
  compile(schema: Schema, options?: ValidationOptions): ValidationFunction;
  validate<T = any>(obj: T, schema: Schema): ValidationResult;
  addRule(typeName: string, ruleFn: Function): void;
}

// ============================================================================
// Validator Implementation
// ============================================================================

/**
 * Creates a new model validator instance with code generation for high-performance validation
 */
function ModelValidatorFactory(): ModelValidator {
  const messages = defaultMessages;
  const cache = new Map();

  // Load rules
  const rules: Record<string, Function> = {
    any: checkAny,
    array: checkArray,
    boolean: checkBoolean,
    date: checkDate,
    email: checkEmail,
    enum: checkEnum,
    forbidden: checkForbidden,
    multi: checkMulti,
    number: checkNumber,
    object: checkObject,
    string: checkString,
    url: checkUrl,
  };

  const internal = {
    /**
     * Generates code snippet for creating validation error objects
     */
    makeErrorCode({ type, expected, field, passed, messages }: any): string {
      const error: any = {
        type: `'${type}'`,
        message: `'${messages[type]}'`,
      };

      if (field) {
        error.field = `'${field}'`;
      } else {
        error.field = "field";
      }

      if (expected) {
        error.expected = expected;
      }

      if (passed) {
        error.passed = passed;
      }

      // Error object to string
      const str = Object.keys(error)
        .map((key) => `${key}: ${error[key]}`)
        .join(", ");

      // Push error object content to errors
      return `errors.push({ ${str} })`;
    },

    /**
     * Converts schema shorthand formats to standardized rule objects
     */
    getRuleFromSchema(schema: any): any {
      if (typeof schema === "string") {
        schema = {
          type: schema,
        };
      } else if (Array.isArray(schema)) {
        if (schema.length === 0) {
          throw new Error("Invalid schema.");
        }

        schema = {
          type: "multi",
          rules: schema,
        };

        // todo: handle optionals
        schema.optional = schema.rules
          .map((s: any) => internal.getRuleFromSchema(s))
          .every((r: any) => r.schema.optional === true);
      }

      if (!schema.type) {
        throw new Error("Property type is missing.");
      }

      const ruleGeneratorFunction = rules[schema.type];

      if (!ruleGeneratorFunction) {
        throw new Error(`Invalid type '${schema.type}' in validator schema.`);
      }

      return {
        schema,
        ruleGeneratorFunction,
        messages: Object.assign({}, messages, schema.messages),
      };
    },

    /**
     * Compiles individual validation rules into executable JavaScript code
     */
    compileRule(rule: any, context: any, path: any, innerSrc: string, sourceVar: string): string {
      const sourceCode = [];

      if (rule.schema.type === "object") {
        rule.schema.strict = !!context.options.strict;
      }

      const item = cache.get(rule.schema);

      if (item) {
        // Cache hit - reuse existing rule
      } else {
        rule.index = context.index;
        context.rules[context.index] = rule;
        context.index++;

        const result = rule.ruleGeneratorFunction.call(internal, rule, path, context);

        if (result.code) {
          context.func[rule.index] = new Function(
            "value",
            "field",
            "parent",
            "errors",
            "context",
            result.code,
          );
          sourceCode.push(
            this.wrapSourceCode(
              rule,
              context,
              innerSrc.replace("##INDEX##", rule.index),
              sourceVar,
            ),
          );
        } else {
          sourceCode.push(this.wrapSourceCode(rule, context));
        }
      }

      return sourceCode.join("\n");
    },

    /**
     * Main compilation method that transforms schemas into optimized validation functions
     */
    compile(schema: Schema, options: ValidationOptions = {}): ValidationFunction {
      options = Object.assign(
        {
          strict: true,
          strictMode: "remove",
          root: false,
          validateSchema: false,
        },
        options,
      );

      // Validate options (if requested)
      if (options.validateSchema) {
        const optionErrors = validateOptions(options);
        if (optionErrors.length > 0) {
          const errorMessages = optionErrors.map((e) => `${e.path}: ${e.message}`).join("; ");
          throw new Error(`Invalid validation options: ${errorMessages}`);
        }

        // Validate the original schema before transformation
        let schemaToValidate: any;
        if (options.root === true) {
          schemaToValidate = schema;
        } else if (Array.isArray(schema)) {
          schemaToValidate = schema;
        } else if (typeof schema === "string") {
          schemaToValidate = schema;
        } else {
          // For object schemas, validate each property individually
          const errors: any[] = [];
          Object.keys(schema).forEach((key) => {
            const propErrors = validateSchema((schema as any)[key], `.${key}`);
            errors.push(...propErrors);
          });
          if (errors.length > 0) {
            const errorMessages = errors.map((e) => `${e.path}: ${e.message}`).join("; ");
            throw new Error(`Invalid schema: ${errorMessages}`);
          }
          // Skip the general schema validation since we validated properties individually
          schemaToValidate = null;
        }
        if (schemaToValidate !== null) {
          const schemaErrors = validateSchema(schemaToValidate);
          if (schemaErrors.length > 0) {
            const errorMessages = schemaErrors.map((e) => `${e.path}: ${e.message}`).join("; ");
            throw new Error(`Invalid schema: ${errorMessages}`);
          }
        }
      }

      if (typeof schema !== "object" && typeof schema !== "string" && !Array.isArray(schema)) {
        throw new Error("Invalid Schema.");
      }

      // Special case: if root mode is false and schema is just a string, it's invalid for object validation
      if (options.root === false && typeof schema === "string") {
        throw new Error("Invalid Schema.");
      }

      const self = this;

      // define
      const context = {
        index: 0,
        rules: [] as any[],
        func: [] as any[],
        options: {
          ...options,
        },
      };

      cache.clear();

      const code = ["const errors = []", "let field"];

      // prepare schema
      if (options.root !== true) {
        // Root validator is an array (Multiple types)
        if (Array.isArray(schema)) {
          const rule = internal.getRuleFromSchema(schema);
          schema = rule.schema;
        } else {
          const tempSchema = Object.assign({}, schema);
          schema = {
            type: "object",
            strict: context.options.strict || false,
            props: tempSchema,
          } as any;
        }
      }

      const rule = internal.getRuleFromSchema(schema);

      code.push(
        internal.compileRule(
          rule,
          context,
          null,
          "context.func[##INDEX##](value, field, null, errors, context)",
          "value",
        ),
      );
      code.push("if (errors.length) {");
      code.push(`
        return errors.map(error => {
          if (error.message) {
            error.message = error.message
              .replace(/\\{param\\}/g, error.field || '')
              .replace(/\\{expected\\}/g, error.expected != null ? error.expected : '')
              .replace(/\\{passed\\}/g, error.passed != null ? error.passed : '')
          }

          return error
        })
      `);
      code.push("}");
      code.push("return true");

      const src = code.join("\n");
      const checkFn = new Function("value", "context", src);

      return function (data: any): ValidationResult {
        (context as any).data = data;
        return checkFn.call(self, data, context);
      };
    },

    /**
     * Wraps validation rule code with null/undefined handling and default value logic
     */
    wrapSourceCode(rule: any, context: any, innerSrc?: string, resolveVar?: string): string {
      const code = [];
      let handleValue = "";
      let skipUndefinedValue = rule.schema.optional === true || rule.schema.type === "forbidden";
      const skipNullValue =
        rule.schema.optional === true ||
        rule.schema.nullable === true ||
        rule.schema.type === "forbidden";

      if (rule.schema.default != null) {
        let defaultValue;
        skipUndefinedValue = false;

        // handle dynamic default value
        if (typeof rule.schema.default === "function") {
          // Dynamic default not implemented in this version
        } else {
          defaultValue = JSON.stringify(rule.schema.default);
        }

        handleValue = `
          value = ${defaultValue}
          ${resolveVar} = value
        `;
      } else {
        handleValue = this.makeErrorCode({
          type: "required",
          passed: "value",
          messages: rule.messages,
        });
      }
      code.push(`
        ${`if (value === undefined) { ${skipUndefinedValue ? "\n // allow undefined value\n" : handleValue} }`}
        ${`else if (value === null) {  ${skipNullValue ? "\n // allow null value\n" : handleValue} }`}
        ${innerSrc ? `else { ${innerSrc} }` : ""}
      `);

      return code.join("\n");
    },
  };

  return {
    /**
     * Compiles a validation schema into an optimized validation function
     */
    compile: internal.compile.bind(internal),

    /**
     * Validates data against a schema without compilation caching (one-time use)
     */
    validate(obj: any, schema: Schema): ValidationResult {
      const check = internal.compile(schema);
      return check(obj);
    },

    /**
     * Adds a custom validation rule type to the validator
     */
    addRule(typeName: string, ruleFn: Function): void {
      if (typeof ruleFn !== "function") {
        throw new Error("Rule must be a function.");
      }
      rules[typeName] = ruleFn;
    },
  };
}

export default ModelValidatorFactory;
