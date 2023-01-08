import { DEFAULT_RATE } from "../config"

export type PluginOptions = { DEBUG?: boolean }

export type minerResult = { success: boolean; response?: any; error?: any }

export abstract class ProviderPlugin {
  abstract name: string
  DEBUG: boolean

  constructor(params: PluginOptions) {
    this.DEBUG = params.DEBUG || false
  }
  abstract broadcast(txhex: string): Promise<minerResult>

  abstract status(txid: string): Promise<minerResult>

  getRate(): number {
    return DEFAULT_RATE
  }
}
