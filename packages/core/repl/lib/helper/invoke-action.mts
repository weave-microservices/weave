import type { Broker } from "@weave-js/core/types/index.js";
import type { Readable } from "stream";
import type { CommandArgs } from "../types.mts";

/** Options a REPL call is made with. */
interface CallOptions {
  meta: Record<string, unknown>;
  stream?: Readable;
  [key: string]: unknown;
}

/** An error as thrown by the broker - carries the weave specific data field. */
interface WeaveErrorLike extends Error {
  data?: unknown;
}

import path from "path";
import fs from "fs";
import * as cliUI from "../utils/cli-ui.mts";
import convertArgs from "../utils/convert-args.mts";
import { safeCopy, isStream, isObject, timespanFromUnixTimes } from "@weave-js/utils";
import util from "util";

function handleResult(result: unknown, args: CommandArgs, startTime: [number, number]) {
  const endTime = process.hrtime(startTime);
  // Save response
  if (args.options.save) {
    const resultIsStream = isStream(result);
    let filePath;

    if (typeof args.options.save === "string") {
      filePath = path.resolve(args.options.save);
    } else {
      filePath = path.resolve(`${args.actionName}.response`);

      if (resultIsStream) {
        filePath += ".stream";
      } else {
        filePath += isObject(result) ? ".json" : ".txt";
      }
    }

    if (resultIsStream) {
      const ws = fs.createWriteStream(filePath);
      (result as NodeJS.ReadableStream).pipe(ws);
    } else {
      const data = isObject(result) ? JSON.stringify(safeCopy(result), null, 2) : String(result);
      fs.writeFileSync(filePath, data, { encoding: "utf8", flag: "w" });
    }
  }
  const duration = (endTime[0] + endTime[1] / 1e9) * 1000;

  console.log(cliUI.warningText(`>> Response (${timespanFromUnixTimes(duration)}):`));
  console.log(
    util.inspect(result, {
      showHidden: false,
      depth: 4,
      colors: true,
    }),
  );
}

function handleError(error: WeaveErrorLike) {
  const [name, ...rest] = (error.stack ?? "").split("\n");

  console.log(cliUI.errorText(`>> ERROR: ${error.message}`));
  console.log(cliUI.text(name));
  console.log(cliUI.neutralText(rest.map((line) => line.replace(/^/, "\n")).join("")));
  console.log(
    "Data: ",
    util.inspect(error.data, {
      showHidden: false,
      depth: 4,
      colors: true,
    }),
  );
}

/**
 * Prepare request options
 * @param {*} args Params
 * @returns {object} Options
 */
function prepareOptions(args: CommandArgs): CallOptions {
  const options: CallOptions = {
    meta: {
      $repl: true,
    },
  };

  if (args.nodeId) {
    options.nodeId = String(args.nodeId);
  }

  return options;
}

function preparePayloadArguments(
  args: CommandArgs,
  payload: Record<string, unknown>,
  done: () => void,
): Record<string, unknown> | undefined {
  if (typeof args.jsonParams === "string") {
    try {
      return JSON.parse(args.jsonParams);
    } catch (error) {
      console.log((error as Error).message);
      done();
    }
  } else {
    const options = convertArgs(args.options);

    // Remove save parameter from params
    // if (args.options.save) {
    //   delete options.save
    // }

    Object.keys(options).map((key) => {
      payload[key] = options[key];
    });

    return payload;
  }
}

/**
 * Send payload from file as object.
 * @param {*} args Params
 * @returns {void}
 */
function preparePayloadFromFile(args: CommandArgs) {
  let filePath;

  if (typeof args.options.data === "string") {
    filePath = path.resolve(args.options.data);
  } else {
    filePath = path.resolve(`${args.actionName}.data.json`);
  }

  if (fs.existsSync(filePath)) {
    try {
      console.log(cliUI.infoText(`Load data from ${filePath}`));
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      console.log(cliUI.errorText("Can't parse parameter file"), error);
    }
  } else {
    console.log(cliUI.errorText(`File not found: ${filePath}`));
  }
}

function prepareMetadataFromFile(args: CommandArgs, metadata: Record<string, unknown>) {
  let filePath;

  if (typeof args.options.loadMeta === "string") {
    filePath = path.resolve(args.options.loadMeta);
  } else {
    filePath = path.resolve(`${args.actionName}.meta.json`);
  }

  if (fs.existsSync(filePath)) {
    try {
      console.log(cliUI.infoText(`Load metadata from ${filePath}`));
      const loadedMetadata = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return {
        ...loadedMetadata,
        ...metadata,
      };
    } catch (error) {
      console.log(cliUI.errorText("Can't parse parameter file"), error);
    }
  } else {
    console.log(cliUI.errorText(`File not found: ${filePath}`));
  }
}

function preparePayloadStream(args: CommandArgs) {
  let filePath;

  if (typeof args.options.stream === "string") {
    filePath = path.resolve(args.options.stream);
  } else {
    filePath = path.resolve(`${args.actionName}.file`);
  }

  if (fs.existsSync(filePath)) {
    console.log(cliUI.infoText(`Send stream from ${filePath}`));
    return fs.createReadStream(filePath);
  } else {
    console.log(cliUI.errorText(`File not found: ${filePath}`));
  }
}

export default (broker: Broker) => (args: CommandArgs, done: () => void) => {
  const callOptions = prepareOptions(args);
  // try to get data from arguments
  let payload = preparePayloadArguments(args, {}, done) ?? {};

  // Send parameters from file
  if (args.options.data) {
    payload = preparePayloadFromFile(args) || payload;
  }

  if (args.options.metadata) {
    delete payload.metadata;
    callOptions.meta = prepareMetadataFromFile(args, callOptions.meta);
  }

  // Prepare send file stream
  if (args.options.stream) {
    callOptions.stream = preparePayloadStream(args);
  }

  console.log(cliUI.infoText(`>> Call "${String(args.actionName)}" with data:`), payload);

  // Save the start time.
  const startTime = process.hrtime();

  broker
    .call(String(args.actionName), payload, callOptions)
    .then((result: unknown) => handleResult(result, args, startTime))
    .catch((error: WeaveErrorLike) => handleError(error))
    .finally(done);
};
