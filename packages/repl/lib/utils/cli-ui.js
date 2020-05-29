const kleur = require('kleur')

module.exports = {
  tableHeaderText (text) {
    return kleur.bold(text)
  },
  successLabel (text) {
    return kleur
      .bgGreen()
      .black(text)
  },
  failureLabel (text) {
    return kleur
      .bgRed()
      .white()
      .bold(text)
  },
  text (text) {
    return kleur.white(text)
  },
  highlightedText (text) {
    return kleur.bold(text)
  },
  infoText (text) {
    return kleur.blue(text)
  },
  successText (text) {
    return kleur.green(text)
  },
  neutralText (text) {
    return kleur.gray(text)
  },
  whiteText (text) {
    return kleur.white(text)
  },
  warningText (text) {
    return kleur.yellow(text)
  },
  errorText (text) {
    return kleur.red(text)
  },
  printHeader (name, length = 30) {
    const lines = '-'.repeat(length)
    console.log(' ')
    console.log(kleur.red(lines))
    console.log(kleur.red().bold('| ' + name))
    console.log(kleur.red(lines))
    console.log(' ')
  },
  printIntended (caption, value) {
    console.log(' ', caption.padEnd(25, ' ') + (value != null ? ': ' + kleur.bold(value) : ''))
  }
}
