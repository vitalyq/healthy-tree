'use strict';

const colors = require('colors/safe');

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
 * Get groups sorted by count
 * @param {Map} groups - Grouped dependencies
 */
const getSortedDuplicates = (groups) => (
  Array.from(groups)
    .filter(([, deps]) => deps.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
);

/**
 * Print groups array
 * @param {Array[]} groups - Grouped dependencies
 */
const outputGroups = (groups) => {
  if (groups.length) {
    console.log(colors.red('Duplicate dependencies:'));
  } else {
    console.log(colors.green('No duplicate dependencies found.'));
  }

  groups.forEach(([name, deps]) => {
    console.log(colors.yellow(name));

    deps.forEach((dep) => {
      let path = '';
      let parent = dep;

      do {
        path = path ? ' > ' + path : '';
        path = parent.name + path;
        parent = parent.requiredBy.values().next().value;
      } while (parent.requiredBy.size);

      console.log(colors.bold(dep.version) + '  ' + path);
    });
  });
};

module.exports = {
  groupDeps,
  getSortedDuplicates,
  outputGroups
};
