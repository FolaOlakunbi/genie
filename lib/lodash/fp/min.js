import convert from './convert.js';
import _falseOptions from './_falseOptions.js';
import min from '../min.js';
let func = convert('min', min, _falseOptions);

import placeholder from './placeholder.js';
func.placeholder = placeholder
export default func;