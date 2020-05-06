const ApiClass = require('../classes/api_class')

module.exports = class Mattercloud extends ApiClass {
  constructor (params) {
    super(params)
    if (!params.api_key) throw new Error(`Missing mattercloud api_key`)
    this.api_key = params.api_key
  }

  static getName () {
    return 'mattercloud'
  }

  broadcast ({ txhex }) {
    return new Promise(async (resolve, reject) => {
      let response
      try {
        const res = await this.fetchFunc(
          `https://api.mattercloud.net/api/v3/main/merchants/tx/broadcast`,
          {
            method: 'POST',
            body: JSON.stringify({ rawtx: txhex }),
            headers: {
              'Content-Type': 'application/json',
              api_key: this.api_key
            }
          }
        )
        response = await res.json()
        // console.log(`mattercloud response`, response)
        if (
          response.success &&
          response.result &&
          response.result.txid &&
          response.result.txid.length === 64
        ) {
          const txid = response.result.txid
          resolve({ txid, response })
        } else {
          let err = response.message
          if (response.error === 'TXN-MEMPOOL-CONFLICT') {
            err = 'Transaction already in the mempool'
          }
          throw new Error(`ERROR: ${err}`)
        }
      } catch (err) {
        resolve({ error: err.message, response })
      }
    })
  }
}
