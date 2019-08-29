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
 * Obtain group objects with additional data
 * @param {string} name - Dependency name
 * @param {LogicalTree[]} deps - Dependency array
 * @param {Map<string, Object>} packageLockMap - Dependency descriptors
 * @returns {groupDescriptor}
 */
const getGroupDescriptor = (name, deps, packageLockMap) => {
  // Parent version ranges
  deps.forEach((dep) => {
    const parent = dep.requiredBy.values().next().value;
    const requires = packageLockMap.get(parent.resolved).requires;
    dep.versionRange = Object.entries(requires)
      .find(([name]) => name === dep.name)[1];
  });

  // Dependency paths
  deps.forEach((dep) => {
    let path = '';
    let parent = dep;

    do {
      path = path ? ' > ' + path : '';
      path = parent.name + path;
      parent = parent.requiredBy.values().next().value;
    } while (parent.requiredBy.size);

    dep.path = path;
  });

  // Sort
  const sortedDeps = deps.sort((a, b) => (
    semver.rcompare(a.version, b.version)
  ));

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
  getGroupDescriptor,
  getSortedGroups
};
