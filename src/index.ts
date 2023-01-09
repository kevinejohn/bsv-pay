import Plugins from "./plugins"
import { DEFAULT_RATE, DEFAULT_TIMEOUT } from "./config"

import type { ProviderPlugin, PluginOptions, minerResult } from "./classes"

type Options = {
  plugins?: typeof ProviderPlugin[]
  DEBUG?: boolean
  TIMEOUT?: number
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
  TIMEOUT: number
  plugins: ProviderPlugin[] = []

  constructor({
    DEBUG = false,
    TIMEOUT = DEFAULT_TIMEOUT,
    plugins = [],
    pluginOptions = {},
  }: Options) {
    this.DEBUG = DEBUG
    this.TIMEOUT = TIMEOUT

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
    const resolveFunction = (plugin: ProviderPlugin) => plugin.broadcast(txhex)
    return await this.resolvePluginQueries(resolveFunction)
  }

  async status(txid: string): Promise<report> {
    const resolveFunction = (plugin: ProviderPlugin) => plugin.status(txid)
    return await this.resolvePluginQueries(resolveFunction)
  }

  async resolvePluginQueries(
    resolveFunction: (plugin: ProviderPlugin) => Promise<minerResult>
  ): Promise<report> {
    const results: results = {}

    // Try all plugins in parallel, resolve as soon as one returns a success message
    return new Promise(async resolveReport => {
      await Promise.all(
        this.plugins.map(async (plugin): Promise<void> => {
          return new Promise(async resolveResult => {
            setTimeout(() => resolveResult(), this.TIMEOUT)

            try {
              results[plugin.name] = await resolveFunction(plugin)
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
        })
      )

      resolveReport({
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
