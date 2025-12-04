import { describe, it } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import { cpuUsage } from "../lib/cpu-usage.mts";

describe("CPU usage method", () => {
  it("should get CPU usage", async () => {
    const cpus = os.cpus();
    const result = await cpuUsage();
    assert.ok(result.avg !== undefined);
    assert.strictEqual(result.usages.length, cpus.length);
  });
});
