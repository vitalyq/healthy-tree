'use strict';

const semver = require('semver');

/**
 * Group descriptor
 * @typedef {Object} groupDescriptor
 * @property {string} name - Dependency name
 * @property {LogicalTree[]} deps - Dependency array
 */

/**
 * Group dependencies by name
 * @param {LogicalTree} tree - Dependency tree
 */
const groupDeps = (tree) => {
  const groups = new Map();

  tree.forEach((dep, next) => {
    const {name} = dep;
    const group = groups.get(name) || [];
    groups.set(name, group.concat(dep));
    next();
  });

  return groups;
};

/**
 * Get version range requested by parent dependency
 * @param {LogicalTree} dep - Dependency
 * @param {Map<string, Object>} packageLockMap - Dependency descriptors
 * @returns {string}
 */
const getVersionRange = (dep, packageLockMap) => {
  const parent = dep.requiredBy.values().next().value;
  const parentData = packageLockMap.get(
    `${parent.name}@${parent.version}`
  );
  const {requires} = parentData;

  return Object.entries(requires)
    .find(([name]) => name === dep.name)[1];
};

/**
 * Get dependency path string to the current dependency
 * @param {LogicalTree} dep - Dependency
 * @returns {string}
 */
const getDependencyPath = (dep) => {
  let path = '';
  let parent = dep;

  do {
    parent = parent.requiredBy.values().next().value;
    path = path ? ' > ' + path : '';
    path = parent.name + path;
  } while (parent.requiredBy.size);

  return path;
};

/**
 * Creates function for calculating if
 * dependency is necessary
 * @returns {function(LogicalTree, number): boolean}
 */
const getNecessityFlagCreator = () => {
  let compatible = true;
  let lastRanges = '';

  return (dep, index) => {
    const {versionRange} = dep;
    compatible = compatible &&
      semver.intersects(lastRanges, versionRange);
    lastRanges += ' ' + versionRange;

    return index === 0 ? true : !compatible;
  };
};

/**
 * Obtain group objects with additional data
 * @param {string} name - Dependency name
 * @param {LogicalTree[]} deps - Dependency array
 * @param {Map<string, Object>} packageLockMap - Dependency descriptors
 * @returns {groupDescriptor}
 */
const getGroupDescriptor = (name, deps, packageLockMap) => {
  const getNecessityFlag = getNecessityFlagCreator();

  const sortedDeps = deps.sort((a, b) => (
    semver.rcompare(a.version, b.version)
  ));

  sortedDeps.forEach((dep, index) => {
    dep.versionRange = getVersionRange(dep, packageLockMap);
    dep.path = getDependencyPath(dep);
    dep.necessary = getNecessityFlag(dep, index);
  });

  return {
    name,
    deps: sortedDeps
  }
};

/**
 * Get group descriptors sorted by count
 * @param {Map} groups - Grouped dependencies
 * @param {Map<string, Object>} packageLockMap - Dependency descriptors
 */
const getSortedGroups = (groups, packageLockMap) => (
  Array.from(groups)
    .filter(([, deps]) => deps.length >= 2)
    .map(([name, deps]) => getGroupDescriptor(name, deps, packageLockMap))
    .sort((a, b) => b.deps.length - a.deps.length)
);

module.exports = {
  groupDeps,
  getVersionRange,
  getDependencyPath,
  getNecessityFlagCreator,
  getGroupDescriptor,
  getSortedGroups
};
