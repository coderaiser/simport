'use strict';

const {pathToFileURL} = require('url');
const readjson = require('readjson');
const tryToCatch = require('try-to-catch');

const {assign} = Object;

const tryJS = async (a) => await import(`${a}.js`);
const tryMJS = async (a) => await import(`${a}.mjs`);
const tryCJS = async (a) => await import(`${a}.cjs`);

module.exports.createSimport = (url) => {
    url = url.includes('file://') ? url : pathToFileURL(url);
    
    return async (name) => {
        let resolved = name;
        const isRelative = /^\./.test(name);
        
        if (isRelative) {
            resolved = new URL(name, url);
        }
        
        if (/\.json$/.test(resolved) || /\.json/.test(resolved))
            return await readjson(resolved);
        
        if (!isRelative || /\.(js|mjs|cjs)$/.test(name)) {
            const imported = await import(resolved);
            const {default: def = {}} = imported;
            
            return assign(def, imported);
        }
        
        let [error, imported] = await tryToCatch(tryJS, resolved);
        imported = imported || await tryToCatch(tryMJS, resolved)[0];
        imported = imported || await tryToCatch(tryCJS, resolved)[0];
        
        if (!imported)
            throw error;
        
        const {default: def = {}} = imported;
        
        return assign(def, imported);
    };
};

