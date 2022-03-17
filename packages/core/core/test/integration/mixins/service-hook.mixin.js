module.exports = rejectedMethodName => {
  const error = !rejectedMethodName ? null : new Error('Rejected hook from ' + rejectedMethodName);
  return {
    created () {
      if (rejectedMethodName === 'created') return Promise.reject(error);
    },
    started () {
      if (rejectedMethodName === 'started') return Promise.reject(error);
    },
    stopped () {
      if (rejectedMethodName === 'stopped') return Promise.reject(error);
    }
  };
};
