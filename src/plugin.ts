export interface ProviderPlugin {
  name: string
  DEBUG: boolean

  broadcast({
    txhex,
  }: {
    txhex: string
  }): Promise<{ txid: string; response: any }>

  status({
    txid,
    verbose,
  }: {
    txid: string
    verbose: boolean
  }): Promise<{ valid: boolean }>

  getRate(): number
}
