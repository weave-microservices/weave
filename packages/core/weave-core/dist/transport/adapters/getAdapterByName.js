// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'adapters'.
const adapters = require('./adapters');
module.exports = name => {
    if (!name) {
        return;
    }
    const foundAdapterName = Object.keys(adapters).find(adapter => adapter.toLowerCase() === name.toLowerCase());
    if (foundAdapterName) {
        return adapters[foundAdapterName];
    }
};
