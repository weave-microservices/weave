module.exports = function createLock () {
  const locked = new Map()
  return {
    acquire (key, ttl) {
      const lock = locked.get(key)
      if (!lock) {
        lock.set(key, [])
      }
    },
    isLocked (key) {
      return !!locked.has(key)
    }
  }
}
