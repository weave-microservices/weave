const types = {
    Counter: require('./counter'),
    Gauge: require('./gauge'),
    Info: require('./info')
};
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getByName'... Remove this comment to see the full error message
const getByName = name => {
    const n = Object.keys(types).find(i => i.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (n) {
        return types[n];
    }
};
module.exports = {
    resolve(type) {
        return getByName(type);
    }
};
