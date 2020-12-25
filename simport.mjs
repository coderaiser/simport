import {createRequire} from 'module';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

import simport from './simport.js';

export default simport;

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

