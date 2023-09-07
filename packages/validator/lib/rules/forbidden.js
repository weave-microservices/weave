
/* Signature: function(value, field, parent, errors, context) */
module.exports = function checkDate ({ schema, messages }) {
  const code = [];

  code.push(`
    if (value !== null && value !== undefined) {
  `);

  // Handle property remove
  if (schema.remove) {
    code.push(`
      return undefined
    `);
  } else {
    code.push(`
      ${this.makeErrorCode({ type: 'forbidden', passed: 'value', messages })}
    `);
  }

  code.push(`
      return value
    }
  `);

  return {
    code: code.join('\n')
  };
};
