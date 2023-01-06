import { broadcastResult, statusResult } from "../classes"
import { ProviderPlugin } from "../classes"
import { statusReponsePayload } from "../mapi"

export default class WhatsonchainPlugin extends ProviderPlugin {
  name = "whatsonchain"

  async status({
    txid,
    verbose,
  }: {
    txid: string
    verbose: boolean
  }): Promise<statusResult> {
    // TODO: Implement

    return { error: "Not implemented" }
  }

  async broadcast({
    txhex,
    verbose,
  }: {
    txhex: string
    verbose: boolean
  }): Promise<broadcastResult> {
    return new Promise(async resolve => {
      const res = await this.fetchFunc(
        `https://api.whatsonchain.com/v1/bsv/main/tx/raw`,
        {
          method: "POST",
          body: JSON.stringify({ txhex }),
          headers: { "Content-Type": "application/json" },
        }
      )

      const response = await res.json()

      try {
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
