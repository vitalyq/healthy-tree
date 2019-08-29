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

/**
 * Obtain map from dependency resolved fields
 * to package-lock dependency descriptions
 * @returns {Map<string, Object>}
 */
const getPackageLockMap = () => {
  const pkgLock = require(PACKAGE_LOCK_PATH);
  const nodes = new Map();

  const processNode = (node) => {
    const {
      dependencies,
      resolved,
      ...nodeData
    } = node;

    if (resolved) {
      nodes.set(resolved, nodeData);
    }

    if (dependencies) {
      Object.values(dependencies).forEach(processNode);
    }
  };

  processNode(pkgLock);
  return nodes;
};

module.exports = {
  getDepTree,
  getPackageLockMap
};
