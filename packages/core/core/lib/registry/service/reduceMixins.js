const { mergeSchemas } = require('../../utils/options');
const { wrapInArray } = require('@weave-js/utils');

const reduceMixins = (service, schema) => {
  const mixins = wrapInArray(schema.mixins);
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

exports.reduceMixins = reduceMixins;
