const MinercraftClass = require("../classes/minercraft_class")

module.exports = class Taal extends MinercraftClass {
  constructor(params) {
    const url = "https://merchantapi.taal.com"
    const name = "taal"

    if (!params.token) throw new Error(`Missing token`)
    super({ headers: { Authorization: params.token }, url, name })
  }

  static getName() {
    return "taal"
  }
}
