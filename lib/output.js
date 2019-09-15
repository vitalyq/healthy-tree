'use strict';

const colors = require('ansi-colors');
const {
  DUP_REASON,
  REASON_TO_COLOR
} = require('./constants');

/**
 * Lengths of paddings
 * @typedef {Object} paddingLengths
 * @property {number} maxVersionLength - Max version string length
 * @property {number} maxReasonLength - Max reason string length
 * @property {number} maxRangeLength - Max range string length
 * @property {number} rangePaddingLength - Length of padding before range
 */

/**
 * Output string delimiter
 */
const DELIMITER = '  ';

/**
 * Calculate padding lengths
 * @param {LogicalTree[]} deps - Dependency array
 * @returns {paddingLengths} - Lengths of paddings
 */
const getPaddingLengths = (deps) => {
  let maxVersionLength = 0;
  let maxReasonLength = 0;
  let maxRangeLength = 0;

  deps.forEach((dep) => {
    const versionLength = String(dep.version).length;
    const reasonLength = String(dep.reason).length;
    maxVersionLength = Math.max(versionLength, maxVersionLength);
    maxReasonLength = Math.max(reasonLength, maxReasonLength);

    dep.versionRanges.forEach((range) => {
      const rangeLength = String(range).length;
      maxRangeLength = Math.max(rangeLength, maxRangeLength);
    });
  });

  const rangePaddingLength =
    maxVersionLength +
    maxReasonLength +
    DELIMITER.length * 2;

  return {
    maxVersionLength,
    maxReasonLength,
    maxRangeLength,
    rangePaddingLength
  };
};

/**
 * Compute ranges and paths string
 * @param {LogicalTree} dep - Dependency
 * @param {paddingLengths} paddingLengths - Lengths of paddings
 * @returns {string}
 */
const getRangesAndPathsString = (dep, paddingLengths) => {
  const {
    versionRanges,
    path
  } = dep;

  const {
    maxRangeLength,
    rangePaddingLength
  } = paddingLengths;

  const prefixString = `\n${Array(rangePaddingLength).fill(' ').join('')}`;

  return versionRanges.map((range, index) => {
    const prefix = index === 0 ? '' : prefixString;
    const rangeString = String(range).padEnd(maxRangeLength);
    return `${prefix}${rangeString}  ${path}`;
  }).join('');
};

/**
 * Print groups array
 * @param {groupDescriptor[]} groups - Grouped dependencies
 */
const outputGroups = (groups) => {
  if (groups.length) {
    console.log(colors.red('Duplicate dependencies:'));
  } else {
    console.log(colors.green('No duplicate dependencies found.'));
  }

  groups.forEach(({name, deps}) => {
    console.log();
    console.log(colors.bold(name));

    const paddingLengths = getPaddingLengths(deps);
    const {
      maxVersionLength,
      maxReasonLength
    } = paddingLengths;

    deps.forEach((dep) => {
      const {
        version,
        reason
      } = dep;

      const color = REASON_TO_COLOR[reason];
      const versionString = String(version).padEnd(maxVersionLength);
      const reasonString = String(reason).padEnd(maxReasonLength);

      console.log(
        `${color(reasonString)}${DELIMITER}` +
        `${color(versionString)}${DELIMITER}` +
        getRangesAndPathsString(dep, paddingLengths)
      );
    });
  });
};

/**
 * Gather dependency statistics for all groups
 * @param {groupDescriptor[]} groups - Grouped dependencies
 * @returns {Object}
 */
const getGroupsStatistics = (groups) => {
  let total = -groups.length;
  const byReason = {};

  groups.forEach(({deps}) => {
    deps.forEach((dep) => {
      const {reason} = dep;
      total++;
      byReason[reason] = (byReason[reason] || 0) + 1;
    });
  });

  return {
    total,
    ...byReason
  }
};

/**
 * Count dependencies in the tree
 * @param {LogicalTree} tree - Dependency tree
 * @returns {number}
 */
const countDeps = (tree) => {
  let total = -1;
  tree.forEach((dep, next) => {
    total++;
    next();
  });
  return total;
};

/**
 * Output dependency count statistics
 * @param {LogicalTree} tree - Dependency tree
 * @param {groupDescriptor[]} groups - Grouped dependencies
 */
const outputStatistics = (tree, groups) => {
  const byReason = getGroupsStatistics(groups);
  const {total} = byReason;

  console.log();
  console.log('Total dependencies:   ' + countDeps(tree));
  console.log('Duplicates:           ' + total);

  Object.values(DUP_REASON)
    .filter((reason) => reason !== DUP_REASON.root)
    .filter((reason) => byReason[reason])
    .forEach((reason) => {
      const color = REASON_TO_COLOR[reason];
      const reasonString = `${reason}:`.padEnd(22);
      console.log(color(reasonString) + byReason[reason]);
    });
};

module.exports = {
  getPaddingLengths,
  outputGroups,
  countDeps,
  outputStatistics
};
