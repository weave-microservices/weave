const { defaultsDeep } = require('@weave-js/utils')
const { format } = require('./format')
const { levelFormats } = require('./level-formats')
const util = require('util')
const { MESSAGE } = require('../constants')
const { combine } = require('./combine')
const { json } = require('./json')

const arrayify = (obj) => Array.isArray(obj) ? obj : [obj]
const formatMessage = args => util.formatWithOptions({ colors: true, compact: 1, breakLength: Infinity }, ...arrayify(args))

const getLongestValue = (items, field) => {
  const labels = Object.keys(items).map(x => items[x][field])
  return labels.reduce((x, y) => x.length > y.length ? x : y)
}

/**
 * @typedef {Object} FormatOptions
 * @property {Boolean} displayTimestamp
 * @property {Boolean} displayBadge
 * @property {Boolean} displayLabel
 * @property {Boolean} displayModuleName
 * @property {Boolean} displayFilename
*/

/** @type {FormatOptions} */
const defaultOptions = {
  displayTimestamp: true,
  displayLabel: true,
  displayBadge: true,
  displayModuleName: true,
  displayMeta: true,
  levelFormats
}

module.exports = (options) => {
  options = defaultsDeep(options, defaultOptions)

  const longestBadge = getLongestValue(options.levelFormats, 'badge')
  const longestLabel = getLongestValue(options.levelFormats, 'label')

  const defaultFormat = format(({ info, utils }) => {
    const parts = []
    const levelFormat = levelFormats[info.level]
    const { kleur } = utils
    // eslint-disable-next-line prefer-const
    let { nodeId, moduleName, service, ...meta } = info.meta

    if (options.displayTimestamp) {
      parts.push(utils.kleur.gray(`[${utils.getISODate()}]`))
    }

    if (parts.length !== 0) {
      parts.push(`${utils.figures.pointerSmall}`)
    }

    if (options.displayBadge && levelFormat.badge) {
      parts.push(kleur[levelFormat.color](levelFormat.badge.padEnd(longestBadge.length + 1)))
    }

    if (info.message instanceof Error && info.message.stack) {
      const [name, ...rest] = info.message.stack.split('\n')

      parts.push(name)
      parts.push(kleur.dim(kleur.grey(rest.map(l => l.replace(/^/, '\n')).join(''))))

      return parts.join(' ')
    }

    if (options.displayLabel && levelFormat.label) {
      parts.push(kleur[levelFormat.color](kleur.underline(levelFormat.label).padEnd(kleur.underline(longestLabel).length + 1)))
    }

    if (options.displayModuleName) {
      if (service) {
        moduleName = service.name
      }
      const module = `${nodeId}/${moduleName}`
      parts.push(kleur.gray(`[${module}]`))
    }

    parts.push(formatMessage(info.message))

    if (options.displayMeta && meta && Object.keys(meta).length > 0) {
      const inspectOptions = {
        showHidden: false,
        depth: 2,
        colors: true,
        compact: 1,
        breakLength: Infinity
      }
      parts.push(util.inspect(meta, inspectOptions))
    }

    if (options.displayFilename) {
      parts.push(utils.getFilename())
    }

    info[MESSAGE] = parts.join(' ')

    return info
  })

  return combine(
    json(options),
    defaultFormat(options)
  )
}

