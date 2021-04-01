const { defaultsDeep } = require('@weave-js/utils')
const { format } = require('./format')
const { levelFormats } = require('./level-formats')
const util = require('util')

const getLongestValue = (items, field) => {
  const labels = Object.keys(items).map(x => items[x][field])
  return labels.reduce((x, y) => x.length > y.length ? x : y)
}

const defaultOptions = {
  displayTimestamp: true,
  displayLabel: true,
  displayBadge: true,
  displayModuleName: true,
  displayMeta: true,
  levelFormats
}

/**
 * @typedef {Object} FormatOptions
 * @property {Boolean} displayTimestamp
 * @property {Boolean} displayBadge
 * @property {Boolean} displayLabel
 * @property {Boolean} displayModuleName
 * @property {Boolean} displayFilename
*/
module.exports = (options) => {
  options = defaultsDeep(options, defaultOptions)

  const longestBadge = getLongestValue(options.levelFormats, 'badge')
  const longestLabel = getLongestValue(options.levelFormats, 'label')

  return format(({ info, utils }) => {
    const parts = []
    const levelFormat = levelFormats[info.level]
    const { kleur } = utils
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

    parts.push(info.message)

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

    info.message = parts.join(' ')

    return info
  })
}

