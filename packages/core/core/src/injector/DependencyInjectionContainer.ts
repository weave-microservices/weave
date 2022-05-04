class DependencyInjectionContainer {
  #dependencies: Record<string, any>;

  constructor () {
    this.#dependencies = {}
  }

  registerWithFactory (dependencyName: string) {

  }

  startModules () {
    
  }
}

export { DependencyInjectionContainer }