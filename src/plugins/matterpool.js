const MinercraftClass = require('../classes/minercraft_class')

module.exports = class Plugin extends MinercraftClass {
  constructor (params) {
    const url = 'https://merchantapi.matterpool.io'
    super({ ...params, url })
  }

  static getName () {
    return 'matterpool'
  }
}
