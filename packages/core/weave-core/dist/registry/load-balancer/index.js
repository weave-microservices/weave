const Strategies = {
    Random: require('./random'),
    RoundRobin: require('./round-robin')
};
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getByName'... Remove this comment to see the full error message
const getByName = name => {
    if (!name) {
        return null;
    }
    const n = Object.keys(Strategies).find(n => n.toLowerCase() === name.toLowerCase());
    if (n) {
        return this.Cache[n];
    }
};
module.exports = {
    resolve(option) {
        if (typeof option === 'string') {
            const strategie = getByName(option);
            return strategie;
        }
    }
};
