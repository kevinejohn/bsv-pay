import MapiClient from "../mapi"
import { mapiReponse, pushResponsePayload, statusReponsePayload } from "../mapi"
import { ProviderPlugin, minerResult, PluginOptions } from "."
import { DEFAULT_RATE } from "../config"

const MIN_REFRESH = 300 * 1000 // 5 minutes

export default abstract class MApiPlugin extends ProviderPlugin {
  abstract name: string
  mapi: MapiClient
  dataRate?: {
    satsPerByte: number
    expiration: number
    lastUpdate: number
  }
  headers: any
  url: string

  constructor({
    DEBUG,
    url,
    headers,
  }: PluginOptions & { url: string; headers?: any }) {
    super({ DEBUG })

    this.url = url
    this.headers = headers || {}

    this.mapi = new MapiClient(this.url, this.headers)
  }

  async broadcast(txhex: string): Promise<minerResult> {
    if (this.hasExpiredDataRate()) await this.refreshDataRate()

    let response: mapiReponse<pushResponsePayload>
    try {
      response = (await this.mapi.pushTx(
        txhex,
        true
      )) as mapiReponse<pushResponsePayload>
    } catch (err) {
      throw new Error(`mAPI error: ${(err as Error).message}`)
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

      const success = response.payload.txid === "success"

      return { success: success, response: response.payload }
    } catch (err) {
      return {
        success: false,
        response: response,
        error: (err as Error).message,
      }
    }
  }

  async status(txid: string): Promise<minerResult> {
    if (this.hasExpiredDataRate()) await this.refreshDataRate()

    let response: mapiReponse<statusReponsePayload>
    try {
      response = (await this.mapi.getTxStatus(
        txid,
        true
      )) as mapiReponse<statusReponsePayload>
    } catch (err) {
      throw new Error(`mAPI error: ${(err as Error).message}`)
    }

    try {
      if (this.DEBUG)
        console.log(`bsv-pay: status ${this.name} response`, response)

      if (!response.payload) throw Error("Missing payload")

      const success = response.payload.returnResult === "success"

      return { success: success, response: response.payload }
    } catch (err) {
      return {
        success: false,
        response: response,
        error: (err as Error).message,
      }
    }
  }

  hasExpiredDataRate(): boolean {
    if (!this.dataRate) return true

    const currentTime = new Date().getTime()

    if (this.dataRate.expiration - currentTime < 0) return true

    if (currentTime - this.dataRate.lastUpdate > MIN_REFRESH) return true

    return false
  }

  async refreshDataRate(): Promise<void> {
    const rate = await this.mapi.getFeeRate()

    if (rate.mine.data > 0) {
      this.dataRate = {
        satsPerByte: rate.mine.data * 1000,
        expiration: new Date(rate.expires).getTime(),
        lastUpdate: new Date().getTime(),
      }
    } else {
      throw new Error(`Invalid fee rate`)
    }

    if (this.DEBUG) {
      console.log(
        `bsv-pay: Updated ${this.name} rate: ${this.dataRate.satsPerByte}.`
      )
    }
  }

  getRate(): number {
    return Math.min(DEFAULT_RATE, this.dataRate?.satsPerByte || DEFAULT_RATE)
  }
}
