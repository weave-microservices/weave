export function getCaller() {
  const orig = Error.prepareStackTrace;

  Error.prepareStackTrace = (_, stack) => stack;
  const err = new Error();
  Error.captureStackTrace(err, getCaller);

  // stack ist jetzt ein Array aus CallSite Objekten
  const stack = err.stack as unknown as NodeJS.CallSite[];
  Error.prepareStackTrace = orig;

  const caller = stack[1]; // 0 = getCaller, 1 = aufrufende Stelle

  return {
    file: caller.getFileName(),
    line: caller.getLineNumber(),
    column: caller.getColumnNumber(),
    function: caller.getFunctionName(),
  };
}
