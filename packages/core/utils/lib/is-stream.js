exports.isStream = obj => obj && obj.readable === true && typeof obj.on === 'function' && typeof obj.pipe === 'function';
