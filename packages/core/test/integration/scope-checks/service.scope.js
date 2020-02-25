module.exports = scope => {
  expect(scope.broker).toBeDefined()
  expect(scope.log).toBeDefined()
  expect(scope.actions).toBeDefined()
  expect(scope.name).toBeDefined()
  expect(scope.schema).toBeDefined()
}
