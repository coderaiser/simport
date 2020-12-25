'use strict';

const {resolve} = require;
const {assign} = Object;

module.exports = async (name) => {
    const resolved = resolve(name);
    
    if (/\.json/.test(resolved) || /\.json/.test(resolved))
        return require(resolved);
    
    const imported = await import(resolved);
    const {default: def} = imported;
    
    return assign(def, imported);
};

