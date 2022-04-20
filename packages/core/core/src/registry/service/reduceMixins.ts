import { Service } from "../../service/Service";
import { ServiceSchema } from "../../service/ServiceSchema";

const { mergeSchemas } = require('../../utils/options');
const { wrapInArray } = require('@weave-js/utils');

const reduceMixins = function (service: Service, schema: ServiceSchema): ServiceSchema {
  const mixins: Array<ServiceSchema> = wrapInArray(schema.mixins);
  if (mixins.length > 0) {
    const mixedSchema = Array
      .from(mixins)
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

export { reduceMixins };