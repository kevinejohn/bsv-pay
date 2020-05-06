const ApiClass = require('../classes/api_class')

module.exports = class Whatsonchain extends ApiClass {
  constructor (params) {
    super(params)
    this.params = params
  }

  static getName () {
    return 'whatsonchain'
  }

  broadcast ({ txhex }) {
    return new Promise(async resolve => {
      let response
      try {
        const res = await this.fetchFunc(
          `https://api.whatsonchain.com/v1/bsv/main/tx/raw`,
          {
            method: 'POST',
            body: JSON.stringify({ txhex }),
            headers: { 'Content-Type': 'application/json' }
          }
        )
        const response = await res.json()
        // console.log(`Whatsonchain.com response`, txid)
        if (!response || response.length !== 64) {
          throw new Error(`Could not broadcast transaction. ${response}.`)
        }
        const txid = response
        resolve({ txid, response })
      } catch (err) {
        resolve({ error: err.message, response })
      }
    })
  }
}
