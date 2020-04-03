module.exports = function checkArray ({ schema, messages }) {
  const enumString = JSON.stringify(schema.values || [])

  return {
    code: `
            if (${enumString}.indexOf(value) === -1) {
                ${this.makeErrorCode({ type: 'enumValues', passed: 'value', messages })}
            }
            return value
        `
  }
}
