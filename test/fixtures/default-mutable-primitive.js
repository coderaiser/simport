let value;
export {value as default};
export const set = (newValue) => {
    if (newValue !== null && (typeof newValue === 'function' || typeof newValue === 'object')) {
        throw new TypeError("'newValue' must be a primitive");
    }
    value = newValue;
};
