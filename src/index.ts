import Plugins from "./plugins"
import { DEFAULT_RATE } from "./config"

import type { ProviderPlugin, PluginOptions, broadcastResult } from "./classes"
import type { FetchFunc } from "../@types/node-fetch"
import type { Tx } from "bsv"

type Options =
  | {
      plugins?: typeof ProviderPlugin[]
      fetchFunc: FetchFunc
      DEBUG?: boolean
    } & {
      [plugin: string]: false | PluginOptions
    }

type broadcastReport = {
  [plugin: string]: broadcastResult
}

type statusReport = {
  [plugin: string]: any
}

class BsvPay {
  DEBUG: boolean
  plugins: ProviderPlugin[] = []

  constructor({ fetchFunc, DEBUG = false, plugins = [], ...params }: Options) {
    this.DEBUG = DEBUG

    const usePlugins = [...plugins, ...Plugins]

    usePlugins.map(Plugin => {
      const name = Plugin.name

      if (params[name] !== false) {
        const pluginOptions: PluginOptions = {
          DEBUG,
          fetchFunc,
          ...params[name],
        }

        try {
          // @ts-ignore
          const plugin = new Plugin({
            DEBUG,
            fetchFunc,
            ...params[name],
          })
          this.plugins.push(plugin)
        } catch (err) {
          console.log(
            `bsv-pay: plugin ${name} disabled. ${(err as Error).message}`
          )
        }
      }
    })
  }

  async broadcast({
    tx,
    verbose,
    callback,
  }: {
    tx: string | Tx
    verbose: boolean
    callback: (report: broadcastReport) => void
  }): Promise<broadcastReport> {
    // Ensure backwards-compatibility if called with bsv.js tx
    const txHex = typeof tx === "string" ? tx : tx.toBuffer().toString("hex")

    const report: broadcastReport = {}

    // Try all plugins in parallel, resolve as soon as one returns a success message
    return new Promise(async resolveReport => {
      await Promise.all(
        this.plugins.map(async plugin => {
          try {
            const res = await plugin.broadcast({ txhex: txHex, verbose })
            report[plugin.name] = res
          } catch (err) {
            this.DEBUG && console.error(`bsv-pay: broadcast error`, err)
            report[plugin.name] = {
              error: (err as Error).message,
            }
          }

          if ("txid" in report[plugin.name]) {
            resolveReport(report)
          }
        })
      )

      resolveReport(report)
    })
  }

  async status({
    txid,
    verbose,
    callback,
  }: {
    txid: string
    verbose: boolean
    callback: (report: statusReport) => void
  }): Promise<statusReport> {
    return await new Promise(async resolve => {
      const report: statusReport = {}

      await Promise.all(
        this.plugins.map(async plugin => {
          try {
            const status = await plugin.status({ txid, verbose })
            report[plugin.name] = status
          } catch (err) {
            this.DEBUG && console.error(`bsv-pay: status error`, err)
            report[plugin.name] = (err as Error).message
          }
          if (report[plugin.name].valid === true) {
            resolve(report)
          }
        })
      )
      if (typeof callback === "function") callback(report)

      resolve(report)
    })
  }

  feePerKb() {
    return Math.min(
      ...this.plugins.map(plugin => plugin.getRate() || DEFAULT_RATE)
    )
  }
}

module.exports = BsvPay
