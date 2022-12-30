import { DEFAULT_RATE } from "../config"

export default class ApiClass {
  name: string
  DEBUG: boolean
  fetchFunc: any
  api_key?: string

  constructor({ name, DEBUG, fetchFunc }) {
    this.name = name
    this.DEBUG = DEBUG
    this.fetchFunc = fetchFunc
    if (!this.fetchFunc) throw new Error(`Missing fetchFunc!`)
    if (!this.name) throw new Error(`Missing name!`)
  }

  async broadcast({ txhex }: { txhex: string }) {
    throw new Error(`Missing broacast function!`)
  }

  async status() {
    return `Not implimented`
  }

  getRate() {
    return DEFAULT_RATE
  }
}
