const MinercraftClass = require('../classes/minercraft_class')

module.exports = class Taal extends MinercraftClass {
  constructor () {
    const url = 'https://merchantapi.taal.com'
    const name = 'taal'
    super({ url, name })
  }

  static getName () {
    return 'taal'
  }
}
