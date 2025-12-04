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

  async function writeActionContracts() {
    const actionList = runtime.registry.actionCollection.list();
    if (actionList.length > 0) {
      const actionContracts = generateActionContract(actionList);
      const formattedContracts = await formatIfAvailable(actionContracts);
      fs.writeFileSync(path.join(weaveTypeFolder, "action-contracts.d.ts"), formattedContracts);
      return;
    } else {
      fs.unlinkSync(path.join(weaveTypeFolder, "action-contracts.d.ts"));
    }
  }

  async function writeEventContracts() {
    const eventList = runtime.registry.eventCollection.list();
    if (eventList.length > 0) {
      const eventContracts = generateEventContract(eventList);
      const formattedContracts = await formatIfAvailable(eventContracts);
      fs.writeFileSync(path.join(weaveTypeFolder, "event-contracts.d.ts"), formattedContracts);
    } else {
      fs.unlinkSync(path.join(weaveTypeFolder, "event-contracts.d.ts"));
    }
  }

  const writeChanges = debounce(function () {
    writeActionContracts();
    writeEventContracts();
  }, 1000);

  return {
    serviceChanged() {
      writeChanges();
    },
  };
};
