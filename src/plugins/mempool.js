const MinercraftClass = require('../classes/minercraft_class')

module.exports = class Mempool extends MinercraftClass {
  constructor (params) {
    const url = 'https://www.ddpurse.com/openapi'
    if (!params.token) throw new Error(`Missing token`)
    super({ ...params, url })
  }

  static getName () {
    return 'mempool'
  }
}
