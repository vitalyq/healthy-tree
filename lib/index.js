#!/usr/bin/env node
'use strict';

const {
  getDepTree,
  getPackageLockMap
} = require('./tree');
const {
  groupDeps,
  getSortedGroups
} = require('./operations');
const {outputGroups} = require('./output');

const tree = getDepTree();
const packageLockMap = getPackageLockMap();
const groups = groupDeps(tree);
const sortedGroups = getSortedGroups(groups, packageLockMap);

outputGroups(sortedGroups);
