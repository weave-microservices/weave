import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

export function findProjectRoot(startDir = process.cwd()): string {
  let dir = startDir;

  while (true) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error("package.json root not found");
    }
    dir = parent;
  }
}
