import { TracingCollector } from "../interfaces/tracig-collector.interface";

export type TracingOptions = {
  enabled: Boolean,
  samplingRate: number,
  collectors: Array<TracingCollector>
}