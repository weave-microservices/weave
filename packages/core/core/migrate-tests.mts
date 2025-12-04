#!/usr/bin/env node --experimental-strip-types

/**
 * Migration script to convert Jest tests to node:test
 *
 * This script converts:
 * - jest.fn() -> manual counter/tracking variables
 * - expect().toBe() -> assert.strictEqual()
 * - expect().toEqual() -> assert.deepStrictEqual()
 * - expect().toThrow() -> assert.throws()
 * - expect().rejects.toThrow() -> assert.rejects()
 * - expect().toBeDefined() -> assert.notStrictEqual(x, undefined)
 * - expect().toHaveBeenCalledTimes() -> manual counter checks
 * - done callbacks -> async/await
 */

import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";

const testFiles = glob.sync("test/**/*.mts", { cwd: process.cwd() });

let totalChanges = 0;

for (const file of testFiles) {
  let content = readFileSync(file, "utf-8");
  const originalContent = content;
  let fileChanges = 0;

  // Skip if already migrated (has node:test import)
  if (content.includes("from 'node:test'") || content.includes('from "node:test"')) {
    console.log(`✓ ${file} - already migrated`);
    continue;
  }

  // Add node:test and node:assert imports if not present
  if (!content.includes("from 'node:test'") && !content.includes('from "node:test"')) {
    const hasDescribe = content.includes("describe(");
    const hasIt = content.includes("it(");
    const hasBeforeEach = content.includes("beforeEach(");
    const hasAfterEach = content.includes("afterEach(");
    const hasBefore = content.includes("before(");
    const hasAfter = content.includes("after(");

    if (hasDescribe || hasIt) {
      const imports = [];
      if (hasDescribe) imports.push("describe");
      if (hasIt) imports.push("it");
      if (hasBeforeEach) imports.push("beforeEach");
      if (hasAfterEach) imports.push("afterEach");
      if (hasBefore) imports.push("before");
      if (hasAfter) imports.push("after");

      const firstImportMatch = content.match(/^import .+;$/m);
      if (firstImportMatch) {
        const insertPos = firstImportMatch.index! + firstImportMatch[0].length;
        content =
          content.slice(0, insertPos) +
          `\nimport { ${imports.join(", ")} } from 'node:test';` +
          content.slice(insertPos);
        fileChanges++;
      } else {
        content = `import { ${imports.join(", ")} } from 'node:test';\n` + content;
        fileChanges++;
      }
    }
  }

  if (!content.includes("from 'node:assert") && !content.includes('from "node:assert')) {
    const hasExpect = content.includes("expect(");
    const hasAssert = content.includes("assert.");

    if (hasExpect || hasAssert) {
      const firstImportMatch = content.match(/^import .+;$/m);
      if (firstImportMatch) {
        const insertPos = firstImportMatch.index! + firstImportMatch[0].length;
        content =
          content.slice(0, insertPos) +
          `\nimport assert from 'node:assert/strict';` +
          content.slice(insertPos);
        fileChanges++;
      } else {
        content = `import assert from 'node:assert/strict';\n` + content;
        fileChanges++;
      }
    }
  }

  // Convert jest.fn() patterns
  // Pattern: const mockFn = jest.fn();
  content = content.replace(/const\s+(\w+)\s*=\s*jest\.fn\(\s*\)/g, (match, name) => {
    fileChanges++;
    return `let ${name}CallCount = 0;\n  const ${name} = () => { ${name}CallCount++; }`;
  });

  // Pattern: const mockFn = jest.fn(implementation);
  content = content.replace(/const\s+(\w+)\s*=\s*jest\.fn\(([^)]+)\)/g, (match, name, impl) => {
    fileChanges++;
    return `let ${name}CallCount = 0;\n  const ${name} = ${impl}; // TODO: Add call counter if needed`;
  });

  // Convert expect().toBe()
  content = content.replace(/expect\(([^)]+)\)\.toBe\(([^)]+)\)/g, (match, actual, expected) => {
    fileChanges++;
    return `assert.strictEqual(${actual}, ${expected})`;
  });

  // Convert expect().toEqual()
  content = content.replace(/expect\(([^)]+)\)\.toEqual\(([^)]+)\)/g, (match, actual, expected) => {
    fileChanges++;
    return `assert.deepStrictEqual(${actual}, ${expected})`;
  });

  // Convert expect().toBeDefined()
  content = content.replace(/expect\(([^)]+)\)\.toBeDefined\(\)/g, (match, value) => {
    fileChanges++;
    return `assert.notStrictEqual(${value}, undefined)`;
  });

  // Convert expect().toBeUndefined()
  content = content.replace(/expect\(([^)]+)\)\.toBeUndefined\(\)/g, (match, value) => {
    fileChanges++;
    return `assert.strictEqual(${value}, undefined)`;
  });

  // Convert expect().toBeNull()
  content = content.replace(/expect\(([^)]+)\)\.toBeNull\(\)/g, (match, value) => {
    fileChanges++;
    return `assert.strictEqual(${value}, null)`;
  });

  // Convert expect().toBeTruthy()
  content = content.replace(/expect\(([^)]+)\)\.toBeTruthy\(\)/g, (match, value) => {
    fileChanges++;
    return `assert.ok(${value})`;
  });

  // Convert expect().toBeFalsy()
  content = content.replace(/expect\(([^)]+)\)\.toBeFalsy\(\)/g, (match, value) => {
    fileChanges++;
    return `assert.ok(!${value})`;
  });

  // Convert expect().toThrow()
  content = content.replace(
    /expect\(([^)]+)\)\.toThrow\((['"`][^'"`]*['"`])\)/g,
    (match, fn, msg) => {
      fileChanges++;
      const regex = msg.replace(/^['"`]/, "/").replace(/['"`]$/, "/");
      return `assert.throws(${fn}, ${regex})`;
    },
  );

  // Convert expect().toThrow() without message
  content = content.replace(/expect\(([^)]+)\)\.toThrow\(\)/g, (match, fn) => {
    fileChanges++;
    return `assert.throws(${fn})`;
  });

  // Convert expect().toThrowError()
  content = content.replace(
    /expect\(([^)]+)\)\.toThrowError\((['"`][^'"`]*['"`])\)/g,
    (match, fn, msg) => {
      fileChanges++;
      const regex = msg.replace(/^['"`]/, "/").replace(/['"`]$/, "/");
      return `assert.throws(${fn}, ${regex})`;
    },
  );

  // Convert expect().toHaveBeenCalledTimes()
  content = content.replace(
    /expect\((\w+)\)\.toHaveBeenCalledTimes\((\d+)\)/g,
    (match, fn, times) => {
      fileChanges++;
      return `assert.strictEqual(${fn}CallCount, ${times})`;
    },
  );

  // Convert expect().toHaveBeenCalled()
  content = content.replace(/expect\((\w+)\)\.toHaveBeenCalled\(\)/g, (match, fn) => {
    fileChanges++;
    return `assert.ok(${fn}CallCount > 0)`;
  });

  // Convert expect().not.toHaveBeenCalled()
  content = content.replace(/expect\((\w+)\)\.not\.toHaveBeenCalled\(\)/g, (match, fn) => {
    fileChanges++;
    return `assert.strictEqual(${fn}CallCount, 0)`;
  });

  // Convert done callbacks to async/await
  content = content.replace(/it\(['"`]([^'"`]+)['"`],\s*\(done\)\s*=>/g, (match, testName) => {
    fileChanges++;
    return `it('${testName}', async () =>`;
  });

  content = content.replace(/it\(['"`]([^'"`]+)['"`],\s*done\s*=>/g, (match, testName) => {
    fileChanges++;
    return `it('${testName}', async () =>`;
  });

  // Remove done() calls
  content = content.replace(/\s+done\(\);/g, "");

  if (fileChanges > 0) {
    writeFileSync(file, content, "utf-8");
    console.log(`✓ ${file} - ${fileChanges} changes`);
    totalChanges += fileChanges;
  } else if (content !== originalContent) {
    writeFileSync(file, content, "utf-8");
    console.log(`✓ ${file} - formatting changes`);
  } else {
    console.log(`- ${file} - no changes needed`);
  }
}

console.log(
  `\n✓ Migration complete! Total changes: ${totalChanges} across ${testFiles.length} files`,
);
