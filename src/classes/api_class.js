const { DEFAULT_RATE } = require('../config')

class ApiClass {
  constructor ({ name, fetchFunc }) {
    this.name = name
    this.fetchFunc = fetchFunc
    if (!this.fetchFunc) throw new Error(`Missing fetchFunc!`)
    if (!this.name) throw new Error(`Missing name!`)
  }

  async broadcast () {
    throw new Error(`Missing broacast function!`)
  }

  async status () {
    return `Not implimented`
  }

  getRate () {
    return DEFAULT_RATE
  }
}

module.exports = ApiClass
