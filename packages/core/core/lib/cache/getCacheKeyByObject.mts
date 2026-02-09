import { isObject, isString } from "@weave-js/utils";

/**
 * Get property from data or metadata object.
 * @param {any} value Value
 * @returns {string} Cache key
 */
const getCacheKeyByObject = (value: any): string => {
  if (Array.isArray(value)) {
    return "[" + value.map((object: any) => getCacheKeyByObject(object)).join(",") + "]";
  } else if (isObject(value)) {
    if (value instanceof Date) {
      return value.toISOString();
    }

    const obj = value as Record<string, unknown>;
    return (
      "{" +
      Object.keys(obj)
        .map((key) => {
          return [key, getCacheKeyByObject(obj[key])].join(":");
        })
        .join(",") +
      "}"
    );
  } else if (isString(value)) {
    return value;
  } else if (typeof value === "boolean" || typeof value === "number") {
    return value.toString();
  } else {
    return "null";
  }
};

export default { getCacheKeyByObject };
