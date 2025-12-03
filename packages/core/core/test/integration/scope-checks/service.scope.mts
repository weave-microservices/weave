import assert from 'node:assert/strict';

export default (scope: any) => {
  assert.notStrictEqual(scope.broker, undefined);
  assert.notStrictEqual(scope.log, undefined);
  assert.notStrictEqual(scope.actions, undefined);
  assert.notStrictEqual(scope.name, undefined);
  assert.notStrictEqual(scope.schema, undefined);
};
