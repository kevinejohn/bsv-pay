const Minercraft = require('minercraft')
const { DEFAULT_RATE } = require('../config')

class MinerClass {
  constructor ({ name, url, token }) {
    this.name = name
    const params = { url }
    if (token) params.headers = { token }
    this.miner = new Minercraft(params)
    this.refreshRates()
  }

  async broadcast ({ txhex, verbose }) {
    let error, txid, response
    try {
      response = await this.miner.tx.push(txhex, { verbose })
      // console.log(response)
      if (response.txid) {
        txid = response.txid
      } else if (response.payload && response.payload.txid) {
        txid = response.payload.txid
      } else if (response.payload) {
        throw new Error(response.payload.resultDescription || `Unknown error`)
      } else {
        throw new Error(response.resultDescription || `Unknown error`)
      }
    } catch (err) {
      error = err.message
    }
    if (txid) {
      return { txid, response }
    } else {
      return { error, response }
    }
  }

  async refreshRates () {
    const MIN_REFRESH = 60 * 1000
    try {
      const rate = await this.miner.fee.rate()
      // console.log(this.name, rate)
      if (rate.valid && rate.mine.data > 0) {
        this.dataRate = rate.mine.data * 1000
        let nextUpdate = new Date(rate.expires) - new Date()
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
      const TRY_AGAIN = 1000
      console.log(
        `bsv-pay: Could not get rates for ${
          this.name
        }. Retrying in ${TRY_AGAIN / 1000} seconds...`,
        err.message
      )
      await new Promise(resolve => setTimeout(resolve, TRY_AGAIN))
      this.refreshRates()
    }
  }

  status ({ txid, verbose }) {
    return this.miner.tx.status(txid, { verbose })
  }

  getRate () {
    return Math.min(DEFAULT_RATE, this.dataRate || DEFAULT_RATE)
  }
}

module.exports = MinerClass
