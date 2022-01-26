#!/usr/bin/env node

import { generateMigration } from "./commands/generate";

const [, , ...args] = process.argv;
const cmd = args[0];

try {
  switch (cmd) {
    case "generate":
      generateMigration(args[1]);
      break;
    // case "apply":
    //   console.log("applying");
    //   break;
    // case "rollback":
    //   console.log("rollback");
    //   break;
    default:
      console.log("unknown command");
  }
} catch (e) {
  console.log(e);
}
