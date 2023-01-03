import { DEFAULT_RATE } from "../config"
import { ProviderPlugin } from "."

import type { RequestInfo, RequestInit, Response } from "node-fetch"

type fetchFunc = (url: RequestInfo, init?: RequestInit) => Promise<Response>

export default abstract class ApiPlugin implements ProviderPlugin {
  abstract name: string
  DEBUG: boolean
  fetchFunc: fetchFunc

  constructor(params: { name: string; DEBUG?: boolean; fetchFunc: fetchFunc }) {
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
  }): Promise<{ txid: string; response: any }>

  abstract status({
    txid,
    verbose,
  }: {
    txid: string
    verbose: boolean
  }): Promise<{ valid: boolean }>

  getRate() {
    return DEFAULT_RATE
  }
}
