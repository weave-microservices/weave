const Strategies = {
  Random: require('./random'),
  RoundRobin: require('./round-robin')
}
const getByName = name => {
  if (!name) {
    return null
  }

  const n = Object.keys(Strategies).find(n => n.toLowerCase() === name.toLowerCase())
  if (n) {
    return this.Cache[n]
  }
}

export default {
  resolve (option) {
    if (typeof option === 'string') {
      const strategie = getByName(option)
      return strategie
    }
  }
}
