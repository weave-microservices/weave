/* istanbul ignore file */
const { yellow, bold } = require('kleur');
const deprecatedList = [];
exports.createDeprecatedWarning = (prop, msg, colored = true) => {
    if (!msg) {
        msg = prop;
    }
    if (deprecatedList.indexOf(prop) === -1) {
        if (colored) {
            /* istanbul ignore next */
            console.warn(yellow(bold(`Deprecation warning: ${msg}`)));
        }
        else {
            console.warn(`Deprecation warning: ${msg}`);
        }
        deprecatedList.push(prop);
    }
};
