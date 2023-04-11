import { PluginOptions } from "../classes"
import MApiPlugin from "../classes/mapi"

export default class BitailsPlugin extends MApiPlugin {
  name = "bitails"

  constructor(params: PluginOptions) {
    super({ ...params, url: "https://mapi.bitails.io" })
  }
}
