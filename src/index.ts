import Plugins from "./plugins"
import { DEFAULT_RATE } from "./config"

import type { ProviderPlugin, PluginOptions, minerResult } from "./classes"

type Options = {
  plugins?: typeof ProviderPlugin[]
  DEBUG?: boolean
  pluginOptions?: { [plugin: string]: false | PluginOptions }
}

type report = {
  [plugin: string]:
    | minerResult
    | { success: false; response?: any; error: string }
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

  async broadcast(txhex: string): Promise<report> {
    const report: report = {}

    // Try all plugins in parallel, resolve as soon as one returns a success message
    return new Promise(async resolveReport => {
      await Promise.all(
        this.plugins.map(async plugin => {
          try {
            report[plugin.name] = await plugin.broadcast(txhex)
          } catch (err) {
            this.DEBUG && console.error(`bsv-pay: broadcast error`, err)
            report[plugin.name] = {
              success: false,
              error: (err as Error).message,
            }
          }

          if (report[plugin.name].success === true) {
            resolveReport(report)
          }
        })
      )

      resolveReport(report)
    })
  }

  async status(txid: string): Promise<report> {
    return await new Promise(async resolve => {
      const report: report = {}

      await Promise.all(
        this.plugins.map(async plugin => {
          try {
            const status = await plugin.status(txid)
            report[plugin.name] = status
          } catch (err) {
            this.DEBUG && console.error(`bsv-pay: status error`, err)
            report[plugin.name] = {
              success: false,
              error: (err as Error).message,
            }
          }

          if (report[plugin.name].success === true) {
            resolve(report)
          }
        })
      )

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
