import os from "os";
import * as Constants from "./constants.mts";
import type { Runtime, MetricType } from "../../types/index.js";

/**
 * Metric instance with chainable set method as used in this module.
 * Labels parameter is optional in practice (defaults to null at runtime).
 */
interface ChainableMetric {
  set(value: string | number | undefined, labels?: Record<string, string> | null, timestamp?: number): void;
}

/**
 * Options for creating a metric
 */
interface MetricOptions {
  name: string;
  type: MetricType;
  description?: string;
}

/**
 * Internal metrics registry interface as used in this module.
 * The public MetricRegistry interface doesn't accurately reflect the actual implementation.
 */
interface InternalMetricRegistry {
  register(obj: MetricOptions): ChainableMetric;
  set(name: string, value: string | number, labels?: Record<string, string> | null, timestamp?: number): void;
}

const getUserInfo = (): Partial<os.UserInfo<string>> => {
  try {
    return os.userInfo();
  } catch (e) {
    return {};
  }
};

/**
 * @param  {Runtime} runtime Runtime reference
 * @returns {void}
 */
export const registerCommonMetrics = (runtime: Runtime): void => {
  // This function is only called when metrics is enabled, so we can assert it exists
  const metrics = runtime.metrics as unknown as InternalMetricRegistry;

  // Process metrics
  metrics
    .register({ name: Constants.PROCESS_PID, type: "info", description: "Process PID" })
    .set(process.pid);
  metrics
    .register({ name: Constants.PROCESS_PPID, type: "info", description: "Process parent PID" })
    .set(process.ppid);
  metrics
    .register({ name: Constants.PROCESS_UPTIME, type: "info", description: "Process uptime" })
    .set(process.uptime());

  // Weave metrics
  metrics
    .register({ name: Constants.WEAVE_ENVIRONMENT, type: "info", description: "Environment" })
    .set("Node.js");
  metrics
    .register({
      name: Constants.WEAVE_ENVIRONMENT_VERSION,
      type: "info",
      description: "Runtime version",
    })
    .set(process.version);
  metrics
    .register({ name: Constants.WEAVE_VERSION, type: "info", description: "Weave version" })
    .set(runtime.version);
  metrics
    .register({ name: Constants.WEAVE_NODE_ID, type: "info", description: "Node ID" })
    .set(runtime.nodeId);
  metrics
    .register({
      name: Constants.WEAVE_NAMESPACE,
      type: "info",
      description: "Namespace in which the node runs.",
    })
    .set(runtime.options.namespace);

  // OS Metrics
  metrics
    .register({ name: Constants.OS_HOSTNAME, type: "info", description: "Hostname" })
    .set(os.hostname());
  metrics
    .register({ name: Constants.OS_TYPE, type: "info", description: "OS type" })
    .set(os.type());
  metrics
    .register({ name: Constants.OS_RELEASE, type: "info", description: "OS release" })
    .set(os.release());
  metrics
    .register({ name: Constants.OS_ARCH, type: "info", description: "OS architecture" })
    .set(os.arch());
  metrics
    .register({ name: Constants.OS_PLATTFORM, type: "info", description: "OS plattform" })
    .set(os.platform());
  metrics.register({
    name: Constants.OS_MEMORY_TOTAL,
    type: "gauge",
    description: "OS free memory",
  });
  metrics.register({
    name: Constants.OS_MEMORY_USED,
    type: "gauge",
    description: "OS memory used",
  });
  metrics.register({
    name: Constants.OS_MEMORY_FREE,
    type: "gauge",
    description: "OS memory free",
  });
  metrics
    .register({ name: Constants.OS_UPTIME, type: "gauge", description: "OS uptime" })
    .set(os.uptime());

  metrics.register({ name: Constants.OS_CPU_LOAD_1, type: "gauge", description: "OS CPU load 1" });
  metrics.register({ name: Constants.OS_CPU_LOAD_5, type: "gauge", description: "OS CPU load 5" });
  metrics.register({
    name: Constants.OS_CPU_LOAD_15,
    type: "gauge",
    description: "OS CPU load 15",
  });

  const userInfo = getUserInfo();
  metrics
    .register({ name: Constants.OS_USER_UID, type: "info", description: "User UID" })
    .set(userInfo.uid);
  metrics
    .register({ name: Constants.OS_USER_GID, type: "info", description: "User GID" })
    .set(userInfo.gid);
  metrics
    .register({ name: Constants.OS_USER_USERNAME, type: "info", description: "Username" })
    .set(userInfo.username);
  metrics
    .register({ name: Constants.OS_USER_HOMEDIR, type: "info", description: "User home directory" })
    .set(userInfo.homedir);
};

/**
 * @param  {Runtime} runtime Runtime reference
 * @returns {void}
 */
export const updateCommonMetrics = (runtime: Runtime): void => {
  // This function is only called when metrics is enabled, so we can assert it exists
  const metrics = runtime.metrics as unknown as InternalMetricRegistry;

  metrics.set(Constants.PROCESS_UPTIME, process.uptime());
  const freeMemory = os.freemem();
  const totalMemory = os.totalmem();
  const usedMemory = totalMemory - freeMemory;

  metrics.set(Constants.OS_RELEASE, os.release());
  metrics.set(Constants.OS_MEMORY_TOTAL, totalMemory);
  metrics.set(Constants.OS_MEMORY_USED, usedMemory);
  metrics.set(Constants.OS_MEMORY_FREE, freeMemory);
  metrics.set(Constants.OS_UPTIME, os.uptime());

  const load = os.loadavg();
  metrics.set(Constants.OS_CPU_LOAD_1, load[0]);
  metrics.set(Constants.OS_CPU_LOAD_5, load[1]);
  metrics.set(Constants.OS_CPU_LOAD_15, load[2]);
};
