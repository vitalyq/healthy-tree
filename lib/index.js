#!/usr/bin/env node
'use strict';

const {
  getDepTree
} = require('./tree');
const {
  groupDeps,
  getSortedDuplicates,
  outputGroups
} = require('./operations');

const tree = getDepTree();
const groups = groupDeps(tree);
const sortedGroups = getSortedDuplicates(groups);

outputGroups(sortedGroups);
