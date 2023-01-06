import MApiPlugin from "../classes/mapi"
import { PluginOptions } from "../classes"

export default class TaalPlugin extends MApiPlugin {
  name = "taal"

  constructor({ token, ...params }: PluginOptions & { token: string }) {
    if (!token) throw new Error(`Missing token`)
    const headers = { Authorization: token }

    super({ ...params, headers, url: "https://merchantapi.taal.com" })
  }
}
