
// npm packages
const _ = require('lodash')
const async = require('async')
const download = require('download-git-repo')
const exeq = require('exeq')
const fs = require('fs')
const Handlebars = require('handlebars')
const inquirer = require('inquirer')
const kleur = require('kleur')
const match = require('minimatch')
const Metalsmith = require('metalsmith')
const mkdirp = require('mkdirp')
const multimatch = require('multimatch')
const ora = require('ora')
const path = require('path')
const render = require('consolidate').handlebars.render

// own packages
const { getTempDir, fail, evaluate } = require('../utils')

// package.json
const pkg = require('../../package.json')

/**
 * Yargs command
 */
module.exports = {
  command: 'create <template-name> [project-name]',
  describe: 'Create a weave project from template',
  handler: handler
}

/**
 * Default values
 */
const values = {
  year: new Date().getFullYear(),
  cliVersion: pkg.version
}

/**
 * Register handlebars helpers
 */
Handlebars.registerHelper('if_eq', (a, b, opts) => a === b ? opts.fn(this) : opts.inverse(this))
Handlebars.registerHelper('unless_eq', (a, b, opts) => a === b ? opts.inverse(this) : opts.fn(this))
Handlebars.registerHelper('if_or', (v1, v2, options) => (v1 || v2) ? options.fn(this) : options.inverse(this))
Handlebars.registerHelper('if_and', (v1, v2, options) => (v1 && v2) ? options.fn(this) : options.inverse(this))

function handler (opts) {
  Object.assign(values, opts)

  let templateMeta
  let metalsmith

  return Promise.resolve()
  // Resolve project name & folder
    .then(() => {
      values.inPlace = false
      if (!values.projectName || values.projectName === '.') {
        values.inPlace = true
        values.projectName = path.relative('../', process.cwd())
      }
      values.projectPath = path.resolve(values.projectName)
    })

  // Resolve template URL from name
    .then(() => {
      const { templateName } = values
      let { templateRepo } = values

      if (/^[./]|(^[a-zA-Z]:)/.test(templateName)) {
        values.tmp = path.isAbsolute(templateName) ? templateName : path.normalize(path.join(process.cwd(), templateName))

        console.log('Local template:', values.tmp)
      } else {
        if (templateName.indexOf('/') === -1) {
          templateRepo = `weave-microservices/weave-cli-template-${templateName}`
        } else {
          templateRepo = templateName
        }

        values.templateRepo = templateRepo
        values.tmp = getTempDir(templateName, true)

        console.log('Template repository:', templateRepo)
      }
    })
  // Download template
    .then(() => {
      if (values.templateRepo) {
        return new Promise((resolve, reject) => {
          const spinner = ora('Downloading template')
          spinner.start()
          download(values.templateRepo, values.tmp, {}, err => {
            spinner.stop()

            if (err) {
              return reject(`Failed to download repo from '${values.templateRepo}'!`, err)
            }
            resolve()
          })
        })
      }
    })
  // Prompt questions
    .then(() => {
      const { tmp } = values
      if (fs.existsSync(path.join(tmp, 'meta.js'))) {
        templateMeta = require(path.join(tmp, 'meta.js'))(values)
        if (templateMeta.questions) {
          return inquirer.prompt(templateMeta.questions).then(answers => Object.assign(values, answers))
        }
      } else {
        templateMeta = {}
      }
    })

  // Check target directory
    .then(() => {
      if (fs.existsSync(values.projectPath)) {
        return inquirer.prompt([{
          type: 'confirm',
          name: 'continue',
          message: kleur.yellow().bold(`The '${values.projectName} directory exists! Continue?`),
          default: false
        }]).then(answers => {
          if (!answers.continue) {
            process.exit(0)
          }
        })
      } else {
        console.log(`Create '${values.projectName}' folder...`)
        mkdirp(values.projectPath)
      }
    })

  // Build template
    .then(() => {
      return new Promise((resolve, reject) => {
        metalsmith = Metalsmith(values.tmp)
        Object.assign(metalsmith.metadata(), values)

        // Register custom template helpers
        if (templateMeta.helpers) {
          Object.keys(templateMeta.helpers).map(key => Handlebars.registerHelper(key, templateMeta.helpers[key]))
        }

        // metalsmith.before
        if (templateMeta.metalsmith && _.isFunction(templateMeta.metalsmith.before)) {
          templateMeta.metalsmith.before.call(templateMeta, metalsmith)
        }

        metalsmith
          .use(filterFiles(templateMeta.filters, templateMeta.skip))
          .use(renderTemplate(templateMeta.skipInterpolation))

        // metalsmith.after
        if (templateMeta.metalsmith && _.isFunction(templateMeta.metalsmith.after)) {
          templateMeta.metalsmith.after.call(templateMeta, metalsmith)
        }

        // Build
        metalsmith
          .clean(false)
          .source('template')
          .destination(values.projectPath)
          .build(err => {
            if (err) {
              return reject(err)
            }

            // metalsmith.complete
            if (templateMeta.metalsmith && _.isFunction(templateMeta.metalsmith.complete)) {
              templateMeta.metalsmith.complete.call(templateMeta, metalsmith)
            }
            resolve()
          })
      })
    })

  // Run 'npm install'
    .then(() => {
      return inquirer.prompt([{
        type: 'confirm',
        name: 'install',
        message: 'Would you like to run "npm install"?',
        default: true
      }]).then(({ install }) => {
        if (install) {
          console.log('\nRunning "npm install"...')
          return exeq([
            'cd ' + values.projectPath,
            'npm install'
          ])
        }
      })
    })

  // Show completeMessage
    .then(() => {
      return new Promise((resolve, reject) => {
        if (templateMeta.completeMessage) {
          render(templateMeta.completeMessage, metalsmith.metadata(), (error, res) => {
            if (error) {
              return reject(error)
            }

            console.log(kleur.green().bold('\n' + res.split(/\r?\n/g).map(line => '   ' + line).join('\n')))
            resolve()
          })
        } else {
          console.log(kleur.green().bold('\nDone!'))
          resolve()
        }
      })
    })

  // Error handler
    .catch(err => fail(err))
}

function filterFiles (filters) {
  return function (files, metalsmith, done) {
    if (!filters) {
      return done()
    }

    const data = metalsmith.metadata()

    const fileNames = Object.keys(files)
    Object.keys(filters).forEach(glob => {
      fileNames.forEach(file => {
        if (match(file, glob, { dot: true })) {
          const condition = filters[glob]
          if (!evaluate(condition, data)) {
            delete files[file]
          }
        }
      })
    })
    done()
  }
}

function renderTemplate (skipInterpolation) {
  skipInterpolation = typeof skipInterpolation === 'string' ? [skipInterpolation] : skipInterpolation

  return function (files, metalsmith, done) {
    const keys = Object.keys(files)
    const metadata = metalsmith.metadata()

    async.each(keys, (file, next) => {
      // skipping files with skipInterpolation option
      if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
        return next()
      }

      const str = files[file].contents.toString()

      if (!/{{([^{}]+)}}/g.test(str)) {
        return next()
      }

      render(str, metadata, function (err, res) {
        if (err) return done(err)
        files[file].contents = Buffer.from(res)
        next()
      })
    }, done)
  }
}
