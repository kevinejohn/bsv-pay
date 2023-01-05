import { PluginOptions } from "../classes"
import MApiPlugin from "../classes/mapi"

export default class GorillapoolPlugin extends MApiPlugin {
  name = "gorillapool"

  constructor(params: PluginOptions) {
    super({ ...params, url: "https://mapi.gorillapool.io" })
  }
}
