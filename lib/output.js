'use strict';

const colors = require('ansi-colors');
const {
  DUP_REASON,
  REASON_TO_COLOR
} = require('./constants');

/**
 * Calculate settings required for output
 * @param {LogicalTree[]} deps - Dependency array
 */
const getOutputSettings = (deps) => {
  let maxVersionLength = 0;
  let maxRangeLength = 0;
  let maxReasonLength = 0;

  deps.forEach((dep) => {
    const versionLength = String(dep.version).length;
    const rangeLength = String(dep.versionRange).length;
    const reasonLength = String(dep.reason).length;
    maxVersionLength = Math.max(versionLength, maxVersionLength);
    maxRangeLength = Math.max(rangeLength, maxRangeLength);
    maxReasonLength = Math.max(reasonLength, maxReasonLength);
  });

  return {
    maxVersionLength,
    maxRangeLength,
    maxReasonLength
  };
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
    console.log(colors.bold.yellow(name));

    const {
      maxVersionLength,
      maxRangeLength,
      maxReasonLength
    } = getOutputSettings(deps);

    deps.forEach((dep) => {
      const {
        version,
        versionRange,
        reason,
        path
      } = dep;

      const color = REASON_TO_COLOR[reason];
      const versionString = String(version).padEnd(maxVersionLength);
      const rangeString = String(versionRange).padEnd(maxRangeLength);
      const reasonString = String(reason).padEnd(maxReasonLength);

      console.log(
        `${color(versionString)}  ` +
        `${rangeString}  ` +
        `${color(reasonString)}  ` +
        `${path}`
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
  getOutputSettings,
  outputGroups,
  countDeps,
  outputStatistics
};
