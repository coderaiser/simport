import {createRequire} from 'module';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

import {createSimport} from './simport.js';

export {
    createSimport,
    createRequire,
};

export const createCommons = (url) => {
    const require = createRequire(url);
    const __filename = fileURLToPath(url);
    const __dirname = dirname(__filename);
    
    return {
        require,
        __filename,
        __dirname,
    };
};

export const createDirname = (url) => {
    const __filename = fileURLToPath(url);
    const __dirname = dirname(__filename);
    return __dirname;
}

export const createFilename = (url) => {
    const __filename = fileURLToPath(url);
    return __filename;
}
