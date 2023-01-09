import Plugins from "./plugins"
import { DEFAULT_RATE } from "./config"

import type { ProviderPlugin, PluginOptions, minerResult } from "./classes"

type Options = {
  plugins?: typeof ProviderPlugin[]
  DEBUG?: boolean
  pluginOptions?: { [plugin: string]: false | PluginOptions }
}

type results = {
  [plugin: string]: minerResult
}

type report = {
  success: boolean
  results: results
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
    const results: results = {}

    // Try all plugins in parallel, resolve as soon as one returns a success message
    return new Promise(async resolveReport => {
      await Promise.all(
        this.plugins.map(async plugin => {
          try {
            results[plugin.name] = await plugin.broadcast(txhex)
          } catch (err) {
            this.DEBUG && console.error(`bsv-pay: broadcast error`, err)
            results[plugin.name] = {
              success: false,
              error: (err as Error).message,
            }
          }

          if (results[plugin.name].success === true) {
            resolveReport({
              results,
              success: true,
            })
          }
        })
      )

      resolveReport({
        results,
        success: false,
      })
    })
  }

  async status(txid: string): Promise<report> {
    return await new Promise(async resolve => {
      const results: results = {}

      await Promise.all(
        this.plugins.map(async plugin => {
          try {
            const status = await plugin.status(txid)
            results[plugin.name] = status
          } catch (err) {
            this.DEBUG && console.error(`bsv-pay: status error`, err)
            results[plugin.name] = {
              success: false,
              error: (err as Error).message,
            }
          }

          if (results[plugin.name].success === true) {
            resolve({
              results,
              success: true,
            })
          }
        })
      )

      resolve({
        results,
        success: false,
      })
    })
  }

  feePerKb() {
    return Math.min(
      ...this.plugins.map(plugin => plugin.getRate() || DEFAULT_RATE)
    )
  }
}

export = BsvPay
