import fs from "fs";
import path from "node:path";
import { findProjectRoot } from "./helper.mts";
import { debounce } from "@weave-js/utils";
import type { Middleware, Runtime } from "../../../types/index.js";
import { generateTypeScriptContract } from "./schema-to-ts.mts";

export default (runtime: Runtime): Middleware => {
  const projectRoot = findProjectRoot();
  const weaveTypeFolder = path.join(projectRoot, ".weave/types");
  fs.mkdirSync(weaveTypeFolder, { recursive: true });

  const writeChanges = debounce(function (localServiceChanged) {
    const actionList = runtime.registry.actionCollection.list();
    const actionContracts = generateTypeScriptContract(actionList);
    fs.writeFileSync(path.join(weaveTypeFolder, "action-contracts.d.ts"), actionContracts);
  }, 1000);

  return {
    serviceChanged(a) {
      writeChanges(a);
    },
  };
};
