#!/usr/bin/env node
'use strict';

const {
  getDepTree,
  outputDepTree
} = require('./tree');

const tree = getDepTree();
outputDepTree(tree);
