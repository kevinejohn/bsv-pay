import type { RequestInfo, RequestInit, Response } from "node-fetch"

export type fetchFunc = (
  url: RequestInfo,
  init?: RequestInit
) => Promise<Response>

export type broadcastResult =
  | { txid: string; response: any }
  | { error: string; response: any }

export interface ProviderPlugin {
  name: string
  DEBUG: boolean
  fetchFunc: fetchFunc

  broadcast({
    txhex,
    verbose,
  }: {
    txhex: string
    verbose: boolean
  }): Promise<broadcastResult>

  status({
    txid,
    verbose,
  }: {
    txid: string
    verbose: boolean
  }): Promise<{ valid: boolean }>

  getRate(): number
}
