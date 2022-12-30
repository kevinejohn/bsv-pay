import { MinercraftClass } from "../classes"

export default class Plugin extends MinercraftClass {
  constructor(params) {
    const url = "https://mapi.bitails.net"
    super({ ...params, url, name: "bitails" })
  }

  static getName() {
    return "bitails"
  }
}
