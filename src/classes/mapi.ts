import Minercraft from "minercraft"
import { ProviderPlugin, broadcastResult, PluginOptions, statusResult } from "."
import { DEFAULT_RATE } from "../config"

export default abstract class MApiPlugin extends ProviderPlugin {
  abstract name: string
  miner: any
  abstract url: string
  dataRate?: number

  constructor({ DEBUG, fetchFunc }: PluginOptions) {
    super({ DEBUG, fetchFunc })

    this.miner = new Minercraft(this.getMapiConfig())
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
    let response
    try {
      response = await this.miner.tx.push(txhex, { verbose: true })
      if (this.DEBUG)
        console.log(`bsv-pay: broadcast ${this.name} response`, response)
      if (response.error) throw Error(response.error)
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
      const rate = await this.miner.fee.rate()
      // console.log(this.name, rate)
      if (rate.valid && rate.mine.data > 0) {
        this.dataRate = rate.mine.data * 1000
        let nextUpdate = new Date(rate.expires).getTime() - new Date().getTime()
        nextUpdate -= 30 * 1000 // 30 seconds buffer time
        if (!(nextUpdate > 0) || nextUpdate < MIN_REFRESH) {
          nextUpdate = MIN_REFRESH
        }
        // console.log(
        //   `bsv-pay: Updated ${this.name} rate: ${
        //     this.dataRate
        //   }. Next update in ${(nextUpdate / (60 * 1000)).toFixed(1)} minutes.`
        // )
        setTimeout(() => this.refreshRates(), nextUpdate)
      } else {
        throw new Error(`Invalid`)
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
  }): Promise<statusResult> {
    return this.miner.tx.status(txid, { verbose })
  }

  getRate() {
    return Math.min(DEFAULT_RATE, this.dataRate || DEFAULT_RATE)
  }
}
