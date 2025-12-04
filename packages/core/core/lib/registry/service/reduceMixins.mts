import { mergeSchemas } from "../../utils/options.mts";
import { wrapInArray } from "@weave-js/utils";

export const reduceMixins = (service: any, schema: any) => {
  const mixins = wrapInArray(schema.mixins);
  if (mixins.length > 0) {
    const mixedSchema = Array.from(mixins)
      .reverse()
      .reduce((s, mixin) => {
        if (mixin.mixins) {
          mixin = reduceMixins(service, mixin);
        }

        return s ? mergeSchemas(s, mixin) : mixin;
      }, null);
    return mergeSchemas(mixedSchema, schema);
  }

  return schema;
};
