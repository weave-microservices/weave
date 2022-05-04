import { DependencyInjectionContainer } from "./DependencyInjectionContainer";

export interface Module {
  register (container: DependencyInjectionContainer): void
}

export { Module }