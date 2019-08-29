'use strict';

const colors = require('colors/safe');

/**
 * Calculate settings required for output
 * @param {LogicalTree[]} deps - Dependency array
 */
const getOutputSettings = (deps) => {
  let maxVersionLength = 0;
  let maxRangeLength = 0;

  deps.forEach((dep) => {
    const versionLength = String(dep.version).length;
    const rangeLength = String(dep.versionRange).length;
    maxVersionLength = Math.max(versionLength, maxVersionLength);
    maxRangeLength = Math.max(rangeLength, maxRangeLength);
  });

  return {
    maxVersionLength,
    maxRangeLength
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
      maxRangeLength
    } = getOutputSettings(deps);

    deps.forEach((dep, index) => {
      const {
        necessary,
        version,
        versionRange,
        path
      } = dep;

      let color = necessary
        ? colors.yellow
        : colors.red;

      if (index === 0) {
        color = colors.green;
      }

      const versionString = String(version).padEnd(maxVersionLength);
      const rangeString = String(versionRange).padEnd(maxRangeLength);

      console.log(`${color(versionString)}  ${rangeString}  ${path}`);
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
  let necessary = -groups.length;
  let avoidable = 0;

  groups.forEach(({deps}) => {
    deps.forEach((dep) => {
      total++;

      if (dep.necessary) {
        necessary++;
      } else {
        avoidable++;
      }
    });
  });

  return {
    total,
    necessary,
    avoidable
  }
};

/**
 * Output dependency count statistics
 * @param {LogicalTree} tree - Dependency tree
 * @param {groupDescriptor[]} groups - Grouped dependencies
 */
const outputStatistics = (tree, groups) => {
  let totalPackages = -1;
  tree.forEach((dep, next) => {
    totalPackages++;
    next();
  });

  const {
    total,
    necessary,
    avoidable
  } = getGroupsStatistics(groups);

  console.log();
  console.log('Total dependencies:   ' + totalPackages);
  console.log('Duplicates:           ' + total);
  console.log('Necessary duplicates: ' + necessary);
  console.log('Avoidable duplicates: ' + avoidable);
};

module.exports = {
  getOutputSettings,
  outputGroups,
  outputStatistics
};
