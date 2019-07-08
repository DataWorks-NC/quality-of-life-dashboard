/**
 * Bundle importing chartist & plugins to keep this syntax in one place rather than repeating it
 * across the app.
 *
 * In a vue component, use `import Chartist from '../modules/chartist';`
 */

import Chartist from 'chartist';

const axisTitle = require('chartist-plugin-axistitle');
require('chartist-plugin-tooltips');

axisTitle();

export default Chartist;
