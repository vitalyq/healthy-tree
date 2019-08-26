'use strict';

const path = require('path');
const archy = require('archy');
const logicalTree = require('npm-logical-tree');

const PACKAGE_JSON_PATH =
  path.resolve(process.cwd(), 'package.json');

const PACKAGE_LOCK_PATH =
  path.resolve(process.cwd(), 'package-lock.json');

/**
 * Obtain dependency tree for project in CWD
 * @returns {LogicalTree}
 */
const getDepTree = () => {
  const pkg = require(PACKAGE_JSON_PATH);
  const pkgLock = require(PACKAGE_LOCK_PATH);

  return logicalTree(pkg, pkgLock);
};

/**
 * Format dependency tree for output
 * @param {LogicalTree} tree - Dependency tree
 * @param {Set} seen - Seen dependencies
 */
const formatDepTree = (
  tree,
  seen = new Set()
) => ({
  label: tree.name,
  nodes: Array.from(tree.dependencies)
    .filter(([, dep]) => {
      // Handle cycles
      if (seen.has(dep)) {
        return false;
      }
      seen.add(dep);
      return true;
    })
    .map(([, dep]) => (
      formatDepTree(dep, seen))
    )
});

/**
 * Outputs dependency tree for debugging
 * @param {LogicalTree} tree - Dependency tree
 */
const outputDepTree = (tree) => (
  console.log(
    archy(formatDepTree(tree))
  )
);

module.exports = {
  getDepTree,
  outputDepTree
};
