import Plugins from "./plugins"
import { DEFAULT_RATE } from "./config"

import type { ProviderPlugin } from "./classes"

export default class BsvPay {
  DEBUG: boolean
  plugins: ProviderPlugin[]

  constructor(params) {
    this.plugins = []
    const plugins = params.plugins as ProviderPlugin[]
    const { fetchFunc, DEBUG } = params
    this.DEBUG = DEBUG
    const usePlugins = [...plugins, ...Plugins]
    usePlugins.map(Plugin => {
      const name = Plugin.name
      if (params[name] !== false) {
        try {
          const plugin = new Plugin({
            ...params[name],
            DEBUG,
            name,
            fetchFunc,
          })
          this.plugins.push(plugin)
        } catch (err) {
          console.log(`bsv-pay: plugin ${name} disabled. ${err.message}`)
        }
      }
    })
  }

  async broadcast({ tx, verbose, callback }) {
    if (typeof tx !== "string") {
      tx = tx.toBuffer().toString("hex")
    }

    // Try all plugins in parallel, resolve as soon as one returns a success message
    // Throw if no plugin was successful
    let err
    const result = await new Promise(async resolve => {
      const report: any = {}
      await Promise.all(
        this.plugins.map(async plugin => {
          try {
            const result = await plugin.broadcast({ txhex: tx, verbose })
            report[plugin.name] = result
            if ("txid" in result) {
              resolve(result)
            } else if (result.error && !err) {
              err = result.error
            }
          } catch (err) {
            this.DEBUG && console.error(`bsv-pay: broadcast error`, err)
          }
        })
      )
      if (typeof callback === "function") callback(report)
    })

    if (result) return result
    throw new Error(err)
  }

  async status({ txid, verbose, callback }) {
    const result = await new Promise(async resolve => {
      const report: any = {}
      await Promise.all(
        this.plugins.map(async plugin => {
          try {
            const status = await plugin.status({ txid, verbose })
            report[plugin.name] = status
            if (status.valid === true) {
              status.name = plugin.name
              resolve(status)
            }
          } catch (err) {
            this.DEBUG && console.error(`bsv-pay: status error`, err)
          }
        })
      )
      if (typeof callback === "function") callback(report)
      resolve(false)
    })
    return result
  }

  feePerKb() {
    return Math.min(
      ...this.plugins.map(plugin => plugin.getRate() || DEFAULT_RATE)
    )
  }
}
