import { MinercraftClass } from "../classes"

export default class Plugin extends MinercraftClass {
  constructor(params) {
    const url = "https://mapi.gorillapool.io"
    super({ ...params, url, name: "gorillapool" })
  }

  static getName() {
    return "gorillapool"
  }
}
