import MapiClient from "../mapi"
import { mapiReponse, pushResponsePayload, statusReponsePayload } from "../mapi"
import { ProviderPlugin, broadcastResult, PluginOptions } from "."
import { DEFAULT_RATE } from "../config"

export default abstract class MApiPlugin extends ProviderPlugin {
  abstract name: string
  mapi: MapiClient
  abstract url: string
  dataRate?: number

  constructor({ DEBUG, fetchFunc }: PluginOptions) {
    super({ DEBUG, fetchFunc })

    const mapiConfig = this.getMapiConfig()
    this.mapi = new MapiClient(mapiConfig.url, mapiConfig.headers, fetchFunc)
    this.refreshRates()
  }

  getMapiConfig(): { url: string; headers?: any } {
    return { url: this.url }
  }

  async broadcast({
    txhex,
    verbose,
  }: {
    txhex: string
    verbose: boolean
  }): Promise<broadcastResult> {
    let response: mapiReponse<pushResponsePayload>
    try {
      response = (await this.mapi.pushTx(
        txhex,
        true
      )) as mapiReponse<pushResponsePayload>
    } catch (err) {
      return { error: (err as Error).message }
    }

    try {
      if (this.DEBUG)
        console.log(`bsv-pay: broadcast ${this.name} response`, response)

      if (!response.payload) throw Error("Missing payload")
      if (response.payload.returnResult !== "success") {
        throw Error(
          `Result ${response.payload.returnResult}: ${response.payload.resultDescription}`
        )
      }
      const txid = response.payload.txid
      if (!txid || Buffer.from(txid, "hex").toString("hex") !== txid) {
        throw Error("Missing txid")
      }
      return { txid, response: verbose ? response : response.payload }
    } catch (err) {
      return { error: (err as Error).message, response }
    }
  }

  async refreshRates() {
    const MIN_REFRESH = 60 * 1000
    try {
      const rate = await this.mapi.getFeeRate()

      if (rate.mine.data > 0) {
        this.dataRate = rate.mine.data * 1000

        let nextUpdate = new Date(rate.expires).getTime() - new Date().getTime()
        nextUpdate -= 30 * 1000 // 30 seconds buffer time
        if (!(nextUpdate > 0) || nextUpdate < MIN_REFRESH) {
          nextUpdate = MIN_REFRESH
        }

        console.debug(
          `bsv-pay: Updated ${this.name} rate: ${
            this.dataRate
          }. Next update in ${(nextUpdate / (60 * 1000)).toFixed(1)} minutes.`
        )

        setTimeout(() => this.refreshRates(), nextUpdate)
      } else {
        throw new Error(`Invalid fee rate`)
      }
    } catch (err) {
      const TRY_AGAIN = 60 * 1000
      this.DEBUG &&
        console.log(
          `bsv-pay: Could not get rates for ${this.name}. Retrying in ${
            TRY_AGAIN / 1000
          } seconds...`,
          (err as Error).message
        )
      await new Promise(resolve => setTimeout(resolve, TRY_AGAIN))
      this.refreshRates()
    }
  }

  async status({
    txid,
    verbose,
  }: {
    txid: string
    verbose: boolean
  }): Promise<statusReponsePayload | mapiReponse<statusReponsePayload>> {
    return await this.mapi.getTxStatus(txid, verbose)
  }

  getRate() {
    return Math.min(DEFAULT_RATE, this.dataRate || DEFAULT_RATE)
  }
}
