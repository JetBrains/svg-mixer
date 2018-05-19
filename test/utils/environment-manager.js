const { resolve, basename } = require('path');
const { existsSync, readFileSync, writeFileSync, unlinkSync } = require('fs');

const { sync: glob } = require('glob');
const { exec, cd } = require('shelljs');

class Environment {
  constructor(dir) {
    this.dir = dir;
    this.name = basename(dir);
    this.pkg = require(resolve(dir, 'package.json'));
    this.dependencies = Object.keys(this.pkg.dependencies).map(pkgName => ({
      name: pkgName,
      version: this.pkg.dependencies[pkgName],
      dir: resolve(dir, 'node_modules', pkgName)
    }));
  }

  install(targetDir) {
    if (!targetDir) {
      throw new Error('Target dir should be specified');
    }

    this.dependencies.forEach(({ dir }) => {
      cd(dir);
      exec('yarn link');
    });

    cd(targetDir);

    this.dependencies.forEach(({ name }) => {
      exec(`yarn link "${name}"`);
    });
  }

  uninstall(targetDir) {
    if (!targetDir) {
      throw new Error('Target dir should be specified');
    }

    cd(targetDir);

    this.dependencies.forEach(({ name }) => {
      exec(`yarn unlink "${name}" || true`);
    });

    this.dependencies.forEach(({ dir }) => {
      cd(dir);
      exec('yarn unlink');
    });
  }

  /**
   * @return {string}
   */
  serialize() {
    return JSON.stringify({
      name: this.name,
      dir: this.dir,
      dependencies: this.pkg.dependencies
    }, null, 2);
  }
}

class EnvironmentManager {
  constructor({
    envsDir,
    targetDir,
    currentEnvFilePath = resolve(targetDir, '.current-env')
  }) {
    this.envsDir = envsDir;
    this.targetDir = targetDir;
    this.currentEnvFilePath = currentEnvFilePath;
    this.environments = glob(`${envsDir}/*`).map(path => new Environment(path));
  }

  /**
   * @param {string} envName
   * @return {Environment}
   */
  get(envName) {
    return this.environments.find(e => e.name === envName);
  }

  getCurrentEnvName() {
    const { currentEnvFilePath } = this;
    return existsSync(currentEnvFilePath)
      ? readFileSync(currentEnvFilePath).toString()
      : null;
  }

  /**
   * @param {string} envName
   */
  install(envName) {
    this.clean();
    this.get(envName).install(this.targetDir);
    writeFileSync(this.currentEnvFilePath, envName);
  }

  /**
   * @param {string} envName
   */
  uninstall(envName) {
    this.get(envName).uninstall(this.targetDir);
    unlinkSync(this.currentEnvFilePath);
    cd(this.targetDir);
    exec('yarn install');
  }

  clean() {
    const currentEnvName = this.getCurrentEnvName();
    if (currentEnvName) {
      this.uninstall(currentEnvName);
    }
  }
}

module.exports = EnvironmentManager;
module.exports.Environment = Environment;
