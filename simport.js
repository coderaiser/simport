'use strict';

const {pathToFileURL} = require('url');
const readjson = require('readjson');
const tryToCatch = require('try-to-catch');

const {assign} = Object;

const importWithExt = async (a, ext = '') => await import(`${a}${ext}`);
const extensions = [
    '.js',
    '.cjs',
    '.mjs',
];

module.exports.createSimport = (url) => {
    url = url.includes('file://') ? url : pathToFileURL(url);
    
    return async (name) => {
        let resolved = name;
        const isRelative = /^\./.test(name);
        
        if (isRelative) {
            resolved = new URL(name, url);
        }
        
        if (/\.json$/.test(resolved))
            return await readjson(resolved);
        
        if (/\.(js|mjs|cjs)$/.test(name)) {
            const processed = resolved.href || `file://${resolved}`;
            const imported = await import(processed);
            const {default: def = {}} = imported;
            
            return assign(def, imported);
        }
        
        let imported;
        let error;
        
        if (/^[@a-z]/.test(name)) {
            imported = await importWithExt(resolved);
        }
        
        if (!imported)
            imported = await importAbsolute(resolved);
        
        const {default: def = {}} = imported;
        
        return assign(def, imported);
    };
};

async function importAbsolute(resolved) {
    let error;
    let imported;
    
    for (const ext of extensions) {
        [error, imported] = await tryToCatch(importWithExt, resolved, ext);
        
        if (imported)
            break;
    }
    
    if (!imported)
        throw error;
    
    return imported;
}
