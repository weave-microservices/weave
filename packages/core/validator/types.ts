// Validation schema types
export interface ValidationOptions {
  /** Enables strict mode */
  strict?: boolean;
  /** Set strict mode behavior: 'remove' removes extra properties, 'error' throws validation error */
  strictMode?: 'remove' | 'error';
  /** Validate a root value */
  root?: boolean;
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
  type: string;
  optional?: boolean;
  nullable?: boolean;
  default?: any;
  messages?: Record<string, string>;
}

export interface StringSchema extends BaseSchema {
  type: 'string';
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
  type: 'number';
  min?: number;
  max?: number;
  equal?: number;
  notEqual?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
}

export interface BooleanSchema extends BaseSchema {
  type: 'boolean';
}

export interface DateSchema extends BaseSchema {
  type: 'date';
}

export interface ArraySchema extends BaseSchema {
  type: 'array';
  minLength?: number;
  maxLength?: number;
  length?: number;
  contains?: any;
  itemType?: Schema;
}

export interface ObjectSchema extends BaseSchema {
  type: 'object';
  strict?: boolean;
  properties?: Record<string, Schema>;
  props?: Record<string, Schema>;
}

export interface EnumSchema extends BaseSchema {
  type: 'enum';
  values: any[];
}

export interface EmailSchema extends BaseSchema {
  type: 'email';
}

export interface UrlSchema extends BaseSchema {
  type: 'url';
}

export interface MultiSchema extends BaseSchema {
  type: 'multi';
  rules: Schema[];
}

export interface AnySchema extends BaseSchema {
  type: 'any';
}

export interface ForbiddenSchema extends BaseSchema {
  type: 'forbidden';
}

export type Schema = 
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
  | string
  | Schema[];

// Main validator interface
export interface ModelValidator {
  /**
   * Compile validation schema and return a validation function
   * @param schema Validation schema
   * @param options Validation options
   * @returns Validation function
   */
  compile(schema: Schema, options?: ValidationOptions): ValidationFunction;
  
  /**
   * Validate data against schema
   * @param obj Data to validate
   * @param schema Validation schema
   * @returns Validation result
   */
  validate(obj: any, schema: Schema): ValidationResult;
  
  /**
   * Add custom validation rule
   * @param typeName Rule type name
   * @param ruleFn Rule function
   */
  addRule(typeName: string, ruleFn: Function): void;
}

/**
 * Create model validator instance
 * @returns Model validator
 */
declare function ModelValidatorFactory(): ModelValidator;

export default ModelValidatorFactory;