import { DEFAULT_RATE } from "../config"

import { mapiReponse, pushResponsePayload, statusReponsePayload } from "../mapi"

export type PluginOptions = { DEBUG?: boolean }

export type broadcastResult =
  | {
      txid: string
      response: mapiReponse<pushResponsePayload> | pushResponsePayload
    }
  | { error: string; response?: any }

export type statusResult =
  | {
      valid: boolean
      response: mapiReponse<statusReponsePayload> | statusReponsePayload
    }
  | { error: string; response?: any }

export abstract class ProviderPlugin {
  abstract name: string
  DEBUG: boolean

  constructor(params: PluginOptions) {
    this.DEBUG = params.DEBUG || false
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
