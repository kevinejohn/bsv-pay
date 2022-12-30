import { MinercraftClass } from "../classes"

export default class Plugin extends MinercraftClass {
  constructor(params) {
    const url = "https://merchantapi.matterpool.io"
    super({ ...params, url })
  }

  static getName() {
    return "matterpool"
  }
}
