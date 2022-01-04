/**
Create a simport function to use dynamic imports, just like plain old require.
@param input - __filename or import.meta.url
@example
```
// COMMONJS
const {createSimport} = require('simport');
const simport = createSimport(__filename);

// ESM
import {createSimport} from 'simport';
const simport = createSimport(import.meta.url);
```
*/
export function createSimport(input: string): typeof simport;

/**
Create a simport function to use dynamic imports, just like plain old require.
@param importPath - module import path
@example
```
// you can import json
await simport('./package.json');
// returns
({
    name: simport,
});

// you can avoid .js extension
await simport('./server');

// you can avoid destructure default
const validate = await simport('./validate');
// same as
const {default: validate2} = await import('./validate.js');
```
*/
export function simport<T>(importPath: string): Promise<T>;

/**
Access to plain old CommonJS variables
@param input - if ESM, import.meta.url
@example
```
import {createCommons} from 'simport';

const {
    __filename,
    __dirname,
    require,
} = createCommons(import.meta.url);

// now you have plain old CommonJS variables
```
*/
export function createCommons(input?: string): {
    require: NodeRequire;
    __filename: string;
    __dirname: string;
};

/**
Access to __filename
@param input - if ESM, import.meta.url
@example
```
import {createFilename} from 'simport';
const __filename = createCommons(import.meta.url);
```
*/
export function createFilename(url?: string): string;

/**
Access to __dirname
@param input - if ESM, import.meta.url
@example
```
import {createDirname} from 'simport';
const __dirname = createDirname(import.meta.url);
```
*/
export function createDirname(url?: string): string;

/**
Have access to NodeRequire
@param input - if ESM, import.meta.url
@example
```
import {createRequire} from 'simport';
const require = createRequire(import.meta.url);
```
*/
export function createRequire(url?: string): NodeRequire;