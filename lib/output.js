'use strict';

const colors = require('colors/safe');

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
    console.log(colors.yellow(name));

    deps.forEach((dep) => {
      console.log(
        colors.bold(dep.version)
        + `  ${dep.versionRange}  `
        + dep.path);
    });
  });
};

module.exports = {
  outputGroups
};
