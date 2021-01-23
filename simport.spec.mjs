import {join} from 'path';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

import tryToCatch from 'try-to-catch';

import {createSimport} from './simport.js';
import {createCommons} from './simport.mjs';

import test from 'supertape';

const {url} = import.meta;

const simport = createSimport(url);

test('simport: default', async (t) => {
    const data = await import('supertape');
    const superData = await simport('supertape');
    
    t.notEqual(data.default, superData);
    t.equal(data.default, superData.default);
    t.end();
});

test('simport: named', async (t) => {
    const {stub} = await import('supertape');
    const {stub: superStub} = await simport('supertape');
    
    t.equal(stub, superStub);
    t.end();
});

test('simport: json', async (t) => {
    const json = await simport('./package.json');
    
    t.equal(json.name, 'simport');
    t.end();
});

test('simport: json: not relative', async (t) => {
    const {__dirname} = createCommons(url);
    const json = await simport(join(__dirname, 'package.json'));
    
    t.equal(json.name, 'simport');
    t.end();
});

test('simport: no extension', async (t) => {
    const imported = await simport('./simport');
    
    t.ok(imported, createSimport);
    t.end();
});

test('simport: createCommons: __filename', async (t) => {
    const {createCommons} = await simport('./simport.mjs');
    const {__filename} = createCommons(url);
    
    t.equal(__filename, fileURLToPath(url));
    t.end();
});

test('simport: createCommons: __dirname', async (t) => {
    const {createCommons} = await simport('./simport.mjs');
    const {__filename, __dirname} = createCommons(url);
    
    t.equal(__dirname, dirname(__filename));
    t.end();
});

test('simport: createCommons: require', async (t) => {
    const {createCommons} = await simport('./simport.mjs');
    const {require} = createCommons(url);
    const {name} = require('./package');
    
    t.equal(name, 'simport');
    t.end();
});

test('simport: file name', async (t) => {
    const {__filename} = createCommons(url);
    const simport = createSimport(__filename);
    
    const result = await simport('./simport.mjs');
    
    t.equal(result.createSimport, createSimport);
    t.end();
});

test('simport: not found', async (t) => {
    const {__filename} = createCommons(url);
    const simport = createSimport(__filename);
    
    const [error] = await tryToCatch(simport, './simport1');
    
    t.ok(error, error.message);
    t.end();
});

test('simport: absolute', async (t) => {
    const {__filename} = createCommons(url);
    const simport = createSimport(__filename);
    
    const [error] = await tryToCatch(simport, __filename);
    
    t.notOk(error);
    t.end();
});

test('simport: external', async (t) => {
    const {__filename} = createCommons(url);
    const simport = createSimport(__filename);
    
    const [error] = await tryToCatch(simport, '@cloudcmd/stub');
    
    t.notOk(error);
    t.end();
});

test('simport: `default` export: frozen object', async (t) => {
    const {__filename} = createCommons(url);
    const simport = createSimport(__filename);

    const native = await import('./test/fixtures/default-frozen-object.js');
    const result = await simport('./test/fixtures/default-frozen-object.js');
    t.equal(typeof result, "object");

    t.notEqual(result, native.default);
    t.equal(result.default, native.default);
    t.equal(result.foo, native.foo);

    t.end();
});

test('simport: `default` export: frozen function', async (t) => {
    const {__filename} = createCommons(url);
    const simport = createSimport(__filename);

    const native = await import('./test/fixtures/default-frozen-function.js');
    const result = await simport('./test/fixtures/default-frozen-function.js');
    t.equal(typeof result, "function");

    t.notEqual(result, native.default);
    t.equal(result.default, native.default);
    t.equal(result.bar, native.bar);

    t.end();
});

test('simport: `default` export: mutable primitive', async (t) => {
    const {__filename} = createCommons(url);
    const simport = createSimport(__filename);

    const native = await import('./test/fixtures/default-mutable-primitive.js');
    const result = await simport('./test/fixtures/default-mutable-primitive.js');

    t.equal(result, native);
    t.equal(result.set, native.set);
    t.equal(result.default, native.default);
    t.equal(result.default, undefined);

    result.set(123);
    t.equal(result.default, native.default);
    t.equal(result.default, 123);

    t.end();
});
