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
    console.log(colors.bold.yellow(name));

    deps.forEach((dep, index) => {
      let color = dep.necessary
        ? colors.yellow
        : colors.red;

      if (index === 0) {
        color = colors.green;
      }

      console.log(
        color(dep.version)
        + `  ${dep.versionRange}  `
        + dep.path);
    });
  });
};

module.exports = {
  outputGroups
};
