const Plugins = require('./plugins')
const { DEFAULT_RATE } = require('./config')

class BsvPay {
  constructor (params) {
    this.plugins = []
    Plugins.map(Plugin => {
      const name = Plugin.getName()
      if (params[name] !== false) {
        const { fetchFunc } = params
        const plugin = new Plugin({ ...params[name], name, fetchFunc })
        this.plugins.push(plugin)
      }
    })
  }

  async broadcast ({ tx, verbose, callback }) {
    if (typeof tx !== 'string') {
      tx = tx.toBuffer().toString('hex')
    }
    let err
    const result = await new Promise(async resolve => {
      const report = {}
      await Promise.all(
        this.plugins.map(async plugin => {
          const result = await plugin.broadcast({ txhex: tx, verbose })
          report[plugin.name] = result
          if (result.txid) {
            resolve(result)
          } else if (result.error && !err) {
            err = result.error
          }
        })
      )
      if (typeof callback === 'function') callback(report)
      resolve()
    })
    if (result) return result
    throw new Error(err)
  }

  async status ({ txid, verbose, callback }) {
    const result = await new Promise(async resolve => {
      const report = {}
      await Promise.all(
        this.plugins.map(async plugin => {
          const status = await plugin.status({ txid, verbose })
          report[plugin.name] = status
          if (status.valid === true) {
            status.name = plugin.name
            resolve(status)
          }
        })
      )
      if (typeof callback === 'function') callback(report)
      resolve(false)
    })
    return result
  }

  feePerKb () {
    return Math.min(
      ...this.plugins.map(plugin => plugin.getRate() || DEFAULT_RATE)
    )
  }
}

module.exports = BsvPay
