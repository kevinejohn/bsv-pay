import { ApiClass } from "../classes"

export default class Mattercloud extends ApiClass {
  constructor(params) {
    super(params)
    if (!params.api_key) throw new Error(`Missing mattercloud api_key`)
    this.api_key = params.api_key
  }

  static getName() {
    return "mattercloud"
  }

  async broadcast({ txhex }): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let response
      try {
        const res = await this.fetchFunc(
          `https://api.mattercloud.net/api/v3/main/merchants/tx/broadcast`,
          {
            method: "POST",
            body: JSON.stringify({ rawtx: txhex }),
            headers: {
              "Content-Type": "application/json",
              api_key: this.api_key,
            },
          }
        )
        response = await res.json()
        // console.log(`mattercloud response`, response)
        const hexstr = /^[a-f0-9]{64}$/gi
        if (
          response.success &&
          response.result &&
          response.result.txid &&
          hexstr.test(response.result.txid)
        ) {
          const txid = response.result.txid
          resolve({ txid, response })
        } else {
          let err = response.message
          if (response.error === "TXN-MEMPOOL-CONFLICT") {
            err = "Transaction already in the mempool"
          }
          throw new Error(`ERROR: ${err}`)
        }
      } catch (err) {
        resolve({ error: err.message, response })
      }
    })
  }
}
