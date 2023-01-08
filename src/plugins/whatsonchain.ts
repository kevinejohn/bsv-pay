import { minerResult } from "../classes"
import { ProviderPlugin } from "../classes"
import fetch from "isomorphic-fetch"

export default class WhatsonchainPlugin extends ProviderPlugin {
  name = "whatsonchain"

  async status(txid: string): Promise<minerResult> {
    // TODO: Implement
    throw new Error("Not Implemented")
  }

  async broadcast(txhex: string): Promise<minerResult> {
    return new Promise(async resolve => {
      const res = await fetch(
        `https://api.whatsonchain.com/v1/bsv/main/tx/raw`,
        {
          method: "POST",
          body: JSON.stringify({ txhex }),
          headers: { "Content-Type": "application/json" },
        }
      )

      const response = await res.json()

      try {
        const hexstr = /^[a-f0-9]{64}$/gi
        if (!hexstr.test(response)) {
          throw new Error(`ERROR: ${response}`)
        }

        resolve({ success: true, response })
      } catch (err) {
        return {
          success: false,
          response: response,
          error: (err as Error).message,
        }
      }
    })
  }
}
