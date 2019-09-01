'use strict';

const colors = require('colors/safe');

/**
 * Duplication reasons enum
 */
const DUP_REASON = {
  root: 'Top hoisted',
  bundled: 'Bundled',
  optional: 'Optional',
  otherHoisted: 'Other hoisted',
  higherInstalled: 'Higher installed',
  notHoisted: 'Not hoisted',
  installOrder: 'Install order'
};

/**
 * Map from duplication reasons
 * to output colors
 */
const REASON_TO_COLOR = {
  [DUP_REASON.root]: colors.green,
  [DUP_REASON.bundled]: colors.yellow,
  [DUP_REASON.optional]: colors.yellow,
  [DUP_REASON.otherHoisted]: colors.yellow,
  [DUP_REASON.higherInstalled]: colors.yellow,
  [DUP_REASON.notHoisted]: colors.red,
  [DUP_REASON.installOrder]: colors.red
};

module.exports = {
  DUP_REASON,
  REASON_TO_COLOR
};
