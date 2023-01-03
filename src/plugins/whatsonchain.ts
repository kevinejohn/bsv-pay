import { broadcastResult } from "../classes"
import { ProviderPlugin } from "../classes"

export default class WhatsonchainPlugin extends ProviderPlugin {
  name = "whatsonchain"

  async status({
    txid,
    verbose,
  }: {
    txid: string
    verbose: boolean
  }): Promise<{ valid: boolean }> {
    // TODO: Implement

    return { valid: false }
  }

  async broadcast({
    txhex,
    verbose,
  }: {
    txhex: string
    verbose: boolean
  }): Promise<broadcastResult> {
    return new Promise(async resolve => {
      let response
      try {
        const res = await this.fetchFunc(
          `https://api.whatsonchain.com/v1/bsv/main/tx/raw`,
          {
            method: "POST",
            body: JSON.stringify({ txhex }),
            headers: { "Content-Type": "application/json" },
          }
        )
        response = await res.json()
        // console.log(`Whatsonchain.com response`, txid)
        const hexstr = /^[a-f0-9]{64}$/gi
        if (!hexstr.test(response)) {
          throw new Error(`ERROR: ${response}`)
        }
        const txid = response
        resolve({ txid, response })
      } catch (err) {
        resolve({ error: (err as Error).message, response })
      }
    })
  }
}
