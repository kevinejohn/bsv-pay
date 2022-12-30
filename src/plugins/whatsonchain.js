const ApiClass = require("../classes/api_class")

module.exports = class Whatsonchain extends ApiClass {
  constructor(params) {
    super(params)
    this.params = params
  }

  static getName() {
    return "whatsonchain"
  }

  broadcast({ txhex }) {
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
        resolve({ error: err.message, response })
      }
    })
  }
}
