import { DEFAULT_RATE } from "../config"

import type { FetchFunc } from "../../@types/node-fetch"

export type PluginOptions = { DEBUG?: boolean; fetchFunc: FetchFunc }

export type broadcastResult =
  | { txid: string; response: any }
  | { error: string; response?: any }

// export type statusResult = { valid: boolean }

export abstract class ProviderPlugin {
  abstract name: string
  DEBUG: boolean
  fetchFunc: FetchFunc

  constructor(params: PluginOptions) {
    this.DEBUG = params.DEBUG || false
    this.fetchFunc = params.fetchFunc

    if (!this.fetchFunc) throw new Error(`Missing fetchFunc!`)
  }
  abstract broadcast({
    txhex,
    verbose,
  }: {
    txhex: string
    verbose: boolean
  }): Promise<broadcastResult>

  abstract status({
    txid,
    verbose,
  }: {
    txid: string
    verbose: boolean
  }): Promise<any>

  getRate(): number {
    return DEFAULT_RATE
  }
}
