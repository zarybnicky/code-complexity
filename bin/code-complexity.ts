#!/usr/bin/env node

import computeCodeComplexity from "../src";

computeCodeComplexity().catch((error) => {
  console.error(error);
  process.exit(1);
});
