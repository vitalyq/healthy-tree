'use strict';

const colors = require('colors/safe');

/**
 * Duplication reasons enum
 */
const DUP_REASON = {
  root: 'Hoisted to top',
  bundled: 'Bundled',
  notHoisted: 'Not hoisted',
  otherHoisted: 'Other hoisted',
  installOrder: 'Install order',
  higherInstalled: 'Higher installed'
};

/**
 * Map from duplication reasons
 * to output colors
 */
const REASON_TO_COLOR = {
  [DUP_REASON.root]: colors.green,
  [DUP_REASON.bundled]: colors.yellow,
  [DUP_REASON.notHoisted]: colors.red,
  [DUP_REASON.otherHoisted]: colors.yellow,
  [DUP_REASON.installOrder]: colors.red,
  [DUP_REASON.higherInstalled]: colors.yellow
};

module.exports = {
  DUP_REASON,
  REASON_TO_COLOR
};
