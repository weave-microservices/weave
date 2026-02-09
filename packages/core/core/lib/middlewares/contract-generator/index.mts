import fs from "fs";
import path from "node:path";
import { findProjectRoot, formatIfAvailable } from "./helper.mts";
import { debounce } from "@weave-js/utils";
import type { Middleware, Runtime } from "../../../types/index.js";
import { generateActionContract, generateEventContract } from "./schema-to-ts.mts";

export default (runtime: Runtime): Middleware => {
  const projectRoot = findProjectRoot();
  const weaveTypeFolder = path.join(projectRoot, ".weave/types");
  fs.mkdirSync(weaveTypeFolder, { recursive: true });

  // Track pending cleanup operations to ensure graceful shutdown
  let pendingCleanup: Promise<void> | null = null;

  async function writeActionContracts(): Promise<void> {
    const actionList = runtime.registry.actionCollection.list();
    const filePath = path.join(weaveTypeFolder, "action-contracts.d.ts");
    
    if (actionList.length > 0) {
      const actionContracts = generateActionContract(actionList);
      const formattedContracts = await formatIfAvailable(actionContracts);
      fs.writeFileSync(filePath, formattedContracts);
    } else {
      // Safely delete file if it exists
      try {
        fs.unlinkSync(filePath);
      } catch (error: any) {
        // Ignore ENOENT errors (file already deleted or never existed)
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
  }

  async function writeEventContracts(): Promise<void> {
    const eventList = runtime.registry.eventCollection.list();
    const filePath = path.join(weaveTypeFolder, "event-contracts.d.ts");
    
    if (eventList.length > 0) {
      const eventContracts = generateEventContract(eventList);
      const formattedContracts = await formatIfAvailable(eventContracts);
      fs.writeFileSync(filePath, formattedContracts);
    } else {
      // Safely delete file if it exists
      try {
        fs.unlinkSync(filePath);
      } catch (error: any) {
        // Ignore ENOENT errors (file already deleted or never existed)
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
  }

  const writeChanges = debounce(async function () {
    // Track the cleanup operation
    pendingCleanup = Promise.all([
      writeActionContracts(),
      writeEventContracts()
    ]).then(() => { 
      pendingCleanup = null; 
    }).catch((error) => {
      runtime.handleError(error);
      pendingCleanup = null;
    });
    
    return pendingCleanup;
  }, 1000);

  return {
    serviceChanged() {
      writeChanges();
    },
    // Wait for pending cleanup operations before stopping
    async stopping() {
      if (pendingCleanup) {
        await pendingCleanup;
      }
    }
  };
};
