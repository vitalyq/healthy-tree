'use strict';

const path = require('path');
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

module.exports = {
  getDepTree
};
