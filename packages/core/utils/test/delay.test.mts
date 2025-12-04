import { describe, it } from "node:test";
import { delay } from "../lib/delay.mts";

describe("Delay function", () => {
  it("should delay execution", async () => {
    const start = Date.now();
    await delay(100);
    const elapsed = Date.now() - start;
    // Allow some tolerance for timing
    if (elapsed < 90) {
      throw new Error(`Delay was too short: ${elapsed}ms`);
    }
  });
});
