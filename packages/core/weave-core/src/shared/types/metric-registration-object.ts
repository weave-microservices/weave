import { MetricLabel } from "./metric-label.interface";

export type MetricRegistrationObject = {
  type: string,
  name: string,
  description?: string,
  labels?: Array<MetricLabel>
}