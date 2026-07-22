#!/usr/bin/env node

import banner from "../lib/banner.js";
import createProject from "../lib/create.js";

async function main() {
  banner();
  await createProject();
}

main();
