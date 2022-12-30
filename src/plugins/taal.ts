import { MinercraftClass } from "../classes"

export default class Taal extends MinercraftClass {
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
