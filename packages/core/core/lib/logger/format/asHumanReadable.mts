import { green, magenta, red, yellow, gray, cyan, lightGray, colorizeJson } from "../utils/colorize.mts";
import os from "os";

export const asHumanReadable = (runtime: any, originObj: any, message: string, number: number, time: number) => {
  let logResult = "";


  const logLevelColors = {
    fatal: magenta,
    error: red,
    warn: yellow,
    info: green,
    debug: cyan,
    verbose: gray,
  };

  const labelsObj = runtime.levels.labels;
  const currentLabel = labelsObj[number];
  const allLabels = Object.values(labelsObj) as string[];
  const maxLabelWidth = Math.max(...allLabels.map((l) => l.toUpperCase().length));
  const label = currentLabel?.toUpperCase() ?? "UNKNOWN";
  const paddedLabel = label.padStart(maxLabelWidth, " ");
  const color = logLevelColors[currentLabel] || yellow;

  logResult += lightGray(new Date(time).toISOString()) + " ";
  logResult += color(paddedLabel);

  if (runtime.options.base?.pid && runtime.options.base?.hostname) {  
    const labelParts: string[] = [];
    if (runtime.options.base?.nodeId) {
      labelParts.push(runtime.options.base.nodeId);
    }
    if (runtime.options.base?.svc) {
      labelParts.push(runtime.options.base.svc);
    }
    if (runtime.options.base?.action) {
      labelParts.push(runtime.options.base.action);
    }
    // if (runtime.options.base?.pid) {
    //   labelParts.push(runtime.options.base.pid);
    // }
    // if (runtime.options.base?.hostname) {
    //   labelParts.push(runtime.options.base.hostname);
    // }
    logResult += lightGray(` ${labelParts.join("::")}`);
  }

  if (message) {
    logResult += " " + message;
  }

  if (originObj && typeof originObj === "object" && Object.keys(originObj).length > 0) {
    logResult += os.EOL;
    logResult += colorizeJson(originObj);
  }

  logResult += os.EOL;

  return logResult;
};