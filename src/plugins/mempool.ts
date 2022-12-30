import { MinercraftClass } from "../classes"

export default class Mempool extends MinercraftClass {
  constructor(params) {
    const url = "https://www.ddpurse.com/openapi"
    if (!params.token) throw new Error(`Missing token`)
    super({ headers: { token: params.token }, url })
  }

  static getName() {
    return "mempool"
  }
}
