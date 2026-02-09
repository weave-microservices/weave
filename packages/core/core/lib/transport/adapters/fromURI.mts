/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2019 Fachwerk
 */
import { parse } from "url";
import type { UrlWithStringQuery } from "url";
import getAdapterByName from "./getAdapterByName.mts";
import { BaseTransportAdapter } from "./adapterBase.mts";

/**
 * Adapter factory function type with optional uriToConfig method
 */
type AdapterFactory = ((config: unknown) => BaseTransportAdapter) & {
  uriToConfig?: (urlObject: UrlWithStringQuery) => unknown;
};

/**
 * Error handler function type
 */
type ErrorHandler = (error: unknown) => void;

/**
 * Creates a transport adapter from a URI string
 * @param uri - Transport URI (e.g., "tcp://localhost:5000")
 * @param handleError - Optional error handler function
 * @returns Transport adapter instance or null if error was handled
 */
function fromURI(uri: string, handleError?: ErrorHandler): BaseTransportAdapter | null {
  try {
    if (typeof uri !== "string") {
      throw new Error("URI needs to be a string.");
    }

    const urlObject = parse(uri);

    if (!urlObject.protocol) {
      throw new Error("Protocol is missing.");
    }

    const name = urlObject.protocol.slice(0, -1).toLowerCase();

    const AdapterFactory = getAdapterByName(name) as AdapterFactory | undefined;

    if (!AdapterFactory) {
      throw new Error("No adapter found.");
    }

    let config: unknown = null;
    if (AdapterFactory.uriToConfig) {
      config = AdapterFactory.uriToConfig(urlObject);
    }
    return AdapterFactory(config);
  } catch (error) {
    if (typeof handleError === "function") {
      handleError(error);
      return null;
    }
    throw error;
  }
}

export default fromURI;
