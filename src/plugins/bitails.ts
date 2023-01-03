import MApiPlugin from "../classes/mapi"

export default class BitailsPlugin extends MApiPlugin {
  name = "bitails"
  url = "https://mapi.bitails.net"

  getMapiConfig() {
    return { url: this.url }
  }
}
