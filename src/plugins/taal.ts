import MApiPlugin from "../classes/mapi"
import { MapiConstructorArgs } from "../classes/mapi"

export default class TaalPlugin extends MApiPlugin {
  url = "https://merchantapi.taal.com"
  name = "taal"
  token: string

  constructor(params: MapiConstructorArgs & { token: string }) {
    super(params)

    if (!params.token) throw new Error(`Missing token`)
    this.token = params.token
  }

  getMapiConfig(): { url: string; headers?: any } {
    const config = super.getMapiConfig()
    config.headers = { Authorization: this.token }

    return config
  }
}
