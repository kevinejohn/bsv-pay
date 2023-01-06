import Plugins from "./plugins"
import { DEFAULT_RATE } from "./config"

import type {
  ProviderPlugin,
  PluginOptions,
  broadcastResult,
  statusResult,
} from "./classes"

type Options = {
  plugins?: typeof ProviderPlugin[]
  DEBUG?: boolean
  pluginOptions?: { [plugin: string]: false | PluginOptions }
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

  constructor({ DEBUG = false, plugins = [], pluginOptions = {} }: Options) {
    this.DEBUG = DEBUG

    const usePlugins = [...plugins, ...Plugins]

    usePlugins.map(Plugin => {
      const name = Plugin.name

      if (pluginOptions[name] !== false) {
        try {
          // @ts-ignore
          const plugin = new Plugin({
            DEBUG,
            ...pluginOptions[name],
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
    txhex,
    verbose = false,
    callback,
  }: {
    txhex: string
    verbose?: boolean
    callback?: (report: broadcastReport) => void
  }): Promise<broadcastReport | broadcastResult> {
    const report: broadcastReport = {}

    // Try all plugins in parallel, resolve as soon as one returns a success message
    return new Promise(async resolveReport => {
      await Promise.all(
        this.plugins.map(async plugin => {
          try {
            const res = await plugin.broadcast({ txhex, verbose })
            report[plugin.name] = res
          } catch (err) {
            this.DEBUG && console.error(`bsv-pay: broadcast error`, err)
            report[plugin.name] = {
              error: (err as Error).message,
            }
          }

          if ("txid" in report[plugin.name]) {
            if (typeof callback === "function") callback(report)

            resolveReport(report[plugin.name])
          }
        })
      )
      if (typeof callback === "function") callback(report)

      resolveReport(report)
    })
  }

  async status({
    txid,
    verbose = false,
    callback,
  }: {
    txid: string
    verbose?: boolean
    callback?: (report: statusReport) => void
  }): Promise<statusReport | statusResult> {
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
            if (typeof callback === "function") callback(report)

            resolve(report[plugin.name])
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

export = BsvPay
