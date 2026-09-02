const path = require('path');

/**
 * Resolve a module from the current project (process.cwd()) first, so the CLI
 * always uses the weave version installed in the project it is run in.
 * Falls back to the version bundled with the CLI when the project does not
 * provide the module (standalone mode).
 * @param {string} moduleName Module name (e.g. "@weave-js/core")
 * @returns {{ module: any, origin: 'project' | 'cli', resolvedPath: string }} Resolution result
 */
const resolveProjectModule = (moduleName) => {
  try {
    const resolvedPath = require.resolve(moduleName, { paths: [process.cwd()] });
    return { module: require(resolvedPath), origin: 'project', resolvedPath };
  } catch (projectError) {
    try {
      const resolvedPath = require.resolve(moduleName);
      return { module: require(resolvedPath), origin: 'cli', resolvedPath };
    } catch (cliError) {
      const packageName = moduleName.startsWith('@')
        ? moduleName.split('/').slice(0, 2).join('/')
        : moduleName.split('/')[0];

      throw new Error(
        `Cannot find module "${packageName}". ` +
        `Install it in your project ("npm install ${packageName}") ` +
        `or alongside the CLI ("npm install -g ${packageName}") for standalone usage.`
      );
    }
  }
};

/**
 * Get the installed version of a resolved module.
 * @param {string} resolvedPath Resolved entry file of the module
 * @param {string} moduleName Module name
 * @returns {string|null} Version from the module's package.json
 */
const getModuleVersion = (resolvedPath, moduleName) => {
  try {
    const packageJsonPath = require.resolve(
      path.join(moduleName, 'package.json'),
      { paths: [path.dirname(resolvedPath)] }
    );
    return require(packageJsonPath).version;
  } catch (error) {
    return null;
  }
};

module.exports = { resolveProjectModule, getModuleVersion };
