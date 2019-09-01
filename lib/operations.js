'use strict';

const semver = require('semver');
const {DUP_REASON} = require('./constants');

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
 * @param {packageLockMap} packageLockMap - Dependencies to package-lock nodes map
 * @returns {string}
 */
const getVersionRange = (dep, packageLockMap) => {
  const parent = dep.requiredBy.values().next().value;
  const parentLockEntry = packageLockMap.get(parent);

  return Object.entries(parentLockEntry.requires)
    .find(([name]) => name === dep.name)[1];
};

/**
 * Get dependency path string to the current dependency
 * @param {LogicalTree} dep - Dependency
 * @returns {string}
 */
const getDependencyPath = (dep) => {
  let path = '';
  let parent = dep.requiredBy.values().next().value;

  while (parent.requiredBy.size) {
    path = path ? ' > ' + path : '';
    path = parent.name + path;
    parent = parent.requiredBy.values().next().value;
  }

  return path;
};

/**
 * Get dependency hoisted to the top of the
 * package-lock tree
 * @param {LogicalTree[]} deps - Dependency array
 * @param {packageLockMap} packageLockMap - Dependencies to package-lock nodes map
 * @returns {LogicalTree | undefined}
 */
const getTopHoisted = (deps, packageLockMap) => (
  deps.find((dep) => (
    packageLockMap.get(dep).depth === 0
  ))
);

/**
 * Calculate duplication reason
 * @param {LogicalTree} dep - Dependency
 * @param {LogicalTree | undefined} topHoisted - Dependency hoisted to the top
 * @returns {string}
 */
const getDuplicationReason = (dep, topHoisted) => {
  const {bundled} = dep;

  if (bundled) {
    return DUP_REASON.bundled;
  } else if (!topHoisted) {
    return DUP_REASON.notHoisted;
  } else if (dep === topHoisted) {
    return DUP_REASON.root;
  }

  const intersects = semver.intersects(
    dep.versionRange, topHoisted.versionRange);

  if (!intersects) {
    return DUP_REASON.otherHoisted;
  }

  return semver.gt(topHoisted.version, dep.version)
    ? DUP_REASON.higherInstalled
    : DUP_REASON.installOrder;
};

/**
 * Obtain group objects with additional data
 * @param {string} name - Dependency name
 * @param {LogicalTree[]} deps - Dependency array
 * @param {packageLockMap} packageLockMap - Dependencies to package-lock nodes map
 * @returns {groupDescriptor}
 */
const getGroupDescriptor = (name, deps, packageLockMap) => {
  deps.forEach((dep) => {
    dep.versionRange = getVersionRange(dep, packageLockMap);
    dep.path = getDependencyPath(dep);
  });

  const topHoisted = getTopHoisted(deps, packageLockMap);

  deps.forEach((dep) => {
    dep.reason = getDuplicationReason(dep, topHoisted);
  });

  const sortedDeps = deps.sort((a, b) => {
    const compareResult = semver.rcompare(a.version, b.version);
    return compareResult === 0
      ? a.reason.localeCompare(b.reason)
      : compareResult;
  });

  return {
    name,
    deps: sortedDeps
  }
};

/**
 * Get group descriptors sorted by count
 * @param {Map} groups - Grouped dependencies
 * @param {packageLockMap} packageLockMap - Dependencies to package-lock nodes map
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
  getTopHoisted,
  getDuplicationReason,
  getGroupDescriptor,
  getSortedGroups
};
