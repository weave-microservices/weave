const createLock = () => {
  const locked = new Map();
  const timeouts = new Map();

  function acquire (key, ttl) {
    const lockedItems = locked.get(key);
    if (!lockedItems) {
      locked.set(key, []);
      
      // Set up TTL timeout if provided
      if (ttl && ttl > 0) {
        const timeoutId = setTimeout(() => {
          release(key);
        }, ttl);
        timeouts.set(key, timeoutId);
      }
      
      return Promise.resolve();
    } else {
      return new Promise((resolve) => lockedItems.push(resolve));
    }
  }

  function isLocked (key) {
    return !!locked.has(key);
  }

  function release (key) {
    const lockedItems = locked.get(key);
    if (lockedItems) {
      // Clear TTL timeout if exists
      const timeoutId = timeouts.get(key);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeouts.delete(key);
      }
      
      if (lockedItems.length > 0) {
        lockedItems.shift()();
      } else {
        locked.delete(key);
      }
    }
    return Promise.resolve();
  }

  return Object.freeze({
    acquire,
    isLocked,
    release
  });
};

module.exports = { createLock };
