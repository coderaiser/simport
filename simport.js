'use strict';

const {pathToFileURL} = require('url');
const readjson = require('readjson');
const tryToCatch = require('try-to-catch');

const {apply, construct} = Reflect;
const {create, defineProperty, getOwnPropertyNames, setPrototypeOf} = Object;

const tryNoExt = async (a) => await import(a);
const tryJS = async (a) => await import(`${a}.js`);
const tryMJS = async (a) => await import(`${a}.mjs`);
const tryCJS = async (a) => await import(`${a}.cjs`);

/** Unwraps the `default` export, if it exists and is an object. */
const unwrapDefault = (imported) => {
    const {default: def = null} = imported;

    // The default export is a function:
    if (typeof def === 'function') {
        let wrapper;
        const isCtor = isConstructor(def);
        if (isCtor) {
            wrapper = function wrapper(...args) {
                return new.target !== undefined
                    ? construct(def, args)
                    : apply(def, this, args);
            };
            wrapper.prototype = undefined;
        } else {
            ({wrapper} = {
                wrapper(...args) {
                    return apply(def, this, args);
                },
            });
        }

        setPrototypeOf(wrapper, def);
        return defineBindings(wrapper, imported, isCtor);
    }

    // The default export is a normal object:
    if (def !== null && typeof def === 'object') {
        return defineBindings(create(def), imported);
    }

    // No default export, or it's a primitive:
    return imported;
}

/** Based on: https://github.com/tc39/ecma262/issues/1798#issuecomment-559914634 */
const isConstructor = (() => {
    const isConstructorMarker = Symbol();
    const badArrayLike = {
        get length() {
            throw isConstructorMarker;
        },
    };

    return (value) => {
        try {
            construct(value, badArrayLike);
        } catch (e) {
            return e === isConstructorMarker;
        }
    };
})();

/** This is necessary to keep bindings "live" */
const defineBindings = (target, src, isCtor = false) => {
    for (const key of getOwnPropertyNames(src)) {
        if (isCtor && key === 'prototype') {
            continue;
        }

        defineProperty(target, key, {
            configurable: false,
            enumerable: true,
            get() {
                return src[key];
            },
        });
    }
    return target;
}

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
            return unwrapDefault(imported);
        }
        
        let imported;
        let error;
        
        if (/^[@a-z]/.test(name)) {
            imported = await tryNoExt(resolved);
        }
        
        if (!imported) {
            [error, imported] = await tryToCatch(tryJS, resolved);
            imported = imported || await tryToCatch(tryMJS, resolved)[1];
            imported = imported || await tryToCatch(tryCJS, resolved)[1];
        }
        
        if (!imported)
            throw error;
        
        return unwrapDefault(imported);
    };
};
