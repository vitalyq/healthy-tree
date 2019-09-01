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
 * Obtain map from dependency names@versions
 * to package-lock dependency descriptions
 * @returns {Map<string, Object>}
 */
const getPackageLockMap = () => {
  const pkg = require(PACKAGE_JSON_PATH);
  const pkgLock = require(PACKAGE_LOCK_PATH);
  const nodes = new Map();

  nodes.set(`${pkg.name}@${pkg.version}`, {
    requires: {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.optionalDependencies
    }
  });

  const processNode = ([name, node], depth) => {
    const {lockfileVersion, version} = node;
    const {dependencies, ...nodeData} = node;
    nodeData.depth = depth;

    if (!lockfileVersion) {
      nodes.set(`${name}@${version}`, nodeData);
    }

    if (dependencies) {
      Object.entries(dependencies).forEach(
        (entry) => processNode(entry, depth + 1)
      );
    }
  };

  processNode([null, pkgLock], -1);
  return nodes;
};

module.exports = {
  getDepTree,
  getPackageLockMap
};
