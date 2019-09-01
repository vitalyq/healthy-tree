'use strict';

const path = require('path');
const logicalTree = require('npm-logical-tree');

/**
 * Dependencies to package-lock nodes map
 * @typedef {Object} packageLockMap
 * @property {Function} get - Get package-lock node from dependency
 */

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
 * Obtain map from dependencies
 * to package-lock dependency descriptions
 * @returns {packageLockMap}
 */
const getPackageLockMap = () => {
  const pkg = require(PACKAGE_JSON_PATH);
  const pkgLock = require(PACKAGE_LOCK_PATH);
  const nodes = new Map();

  const add = (node) => {
    const {name, version, bundled, optional, dev} = node;
    const key = `${name}@${version}`
      + `@${Boolean(bundled)}`
      + `@${Boolean(optional)}`
      + `@${Boolean(dev)}`;

    if (!nodes.has(key)) {
      nodes.set(key, node);
    }
  };

  const get = (dep) => {
    const {name, version, bundled, optional, dev} = dep;
    const key = `${name}@${version}`
      + `@${Boolean(bundled)}`
      + `@${Boolean(optional)}`
      + `@${Boolean(dev)}`;
    return nodes.get(key);
  };

  add({
    name: pkg.name,
    version: pkg.version,
    requires: {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.optionalDependencies
    }
  });

  const processNode = ([name, node], depth) => {
    const {lockfileVersion} = node;
    const {dependencies, ...nodeData} = node;
    nodeData.name = name;
    nodeData.depth = depth;

    if (!lockfileVersion) {
      add(nodeData);
    }

    if (dependencies) {
      Object.entries(dependencies).forEach(
        (entry) => processNode(entry, depth + 1)
      );
    }
  };

  processNode([null, pkgLock], -1);

  return {get};
};

module.exports = {
  getDepTree,
  getPackageLockMap
};
