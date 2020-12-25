'use strict';

const {fileURLToPath, pathToFileURL} = require('url');
const readjson = require('readjson');

const {resolve} = require;
const {assign} = Object;

module.exports.createSimport = (url) => async (name) => {
    let resolved = name;
    
    if (/^\./.test(name)) {
        url = url.includes('file://') ? url : pathToFileURL(name);
        resolved = resolve(fileURLToPath(new URL(name, url)));
    }
    
    if (/\.json/.test(resolved) || /\.json/.test(resolved))
        return await readjson(resolved);
    
    const imported = await import(resolved);
    const {default: def = {}} = imported;
    
    return assign(def, imported);
};

