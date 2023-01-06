import type { FetchFunc } from "../@types/node-fetch"

export type mapiReponse<PayloadType> = {
  payload: PayloadType
  signature: string
  publicKey: string
  encoding: string
  mimetype: string
}

export type pushResponsePayload = {
  apiVersion: string
  timestamp: string
  txid: string
  returnResult: string
  resultDescription: string
  minerId: string
  currentHighestBlockHash: string
  currentHighestBlockHeight: number
  txSecondMempoolExpiry: number
  warnings: any[]
  failureRetryable: boolean
}

export type statusReponsePayload = {
  apiVersion: string
  timestamp: string
  txid: string
  returnResult: string
  blockHash: string
  blockHeight: number
  confirmations: number
  minerId: string
  txSecondMempoolExpiry: number
  merkleProof: {
    index: number
    txOrId: string
    targetType: string
    target: string
    nodes: string[]
  }
}

export type feeResponsePayload = {
  apiVersion: string
  timestamp: string
  expiryTime: string
  minerId: string
  currentHighestBlockHash: string
  currentHighestBlockHeight: number
  fees: {
    feeType: string
    miningFee: {
      satoshis: number
      bytes: number
    }
    relayFee: {
      satoshis: number
      bytes: number
    }
  }[]
  callbacks: {
    ipAddress: string
  }[]
}

const FEE_PATH = "/mapi/feeQuote"
const TX_PATH = "/mapi/tx"

export default class MapiClient {
  headers: any = { "Content-Type": "application/json" }

  constructor(
    public url: string,
    headers: any = {},
    public fetchFunc: FetchFunc
  ) {
    this.headers = Object.assign(this.headers, headers)
  }

  async pushTx(
    txhex: string,
    verbose = false
  ): Promise<pushResponsePayload | mapiReponse<pushResponsePayload>> {
    const pushUrl = this.url + TX_PATH

    const reponse = await this.fetchFunc(pushUrl, {
      headers: this.headers,
      method: "POST",
      body: JSON.stringify({ rawtx: txhex }),
    })
    const responseJSON = await reponse.json()

    const payload = JSON.parse(responseJSON.payload) as pushResponsePayload

    return verbose
      ? {
          ...responseJSON.data,
          payload,
        }
      : payload
  }

  async getTxStatus(
    txid: string,
    verbose = false
  ): Promise<statusReponsePayload | mapiReponse<statusReponsePayload>> {
    const pushUrl = this.url + TX_PATH + "/" + txid

    const reponse = await this.fetchFunc(pushUrl, {
      headers: this.headers,
    })
    const reponseJSON = await reponse.json()

    const payload = JSON.parse(reponseJSON.payload) as statusReponsePayload

    return verbose
      ? {
          ...reponseJSON.data,
          payload,
        }
      : payload
  }

  async getFeeRate(): Promise<{
    expires: string
    mine: {
      [feeType: string]: number
    }
    relay: {
      [feeType: string]: number
    }
  }> {
    const feeRateUrl = this.url + FEE_PATH

    const response = await this.fetchFunc(feeRateUrl, { headers: this.headers })
    const responseJSON = await response.json()
    const payload = JSON.parse(responseJSON.payload) as feeResponsePayload

    const parsedFees = (payload.fees as any[]).reduce(
      (fees, fee) => {
        fees.mine[fee.feeType] = fee.miningFee.satoshis / fee.miningFee.bytes
        fees.relay[fee.feeType] = fee.relayFee.satoshis / fee.relayFee.bytes
        return fees
      },
      { mine: {}, relay: {} }
    )

    return {
      expires: payload.expiryTime,
      ...parsedFees,
    }
  }
}

// FIXME: This is rather pointless without verifying the public key...
// function validateSignature(status: any) {
//   const payloadHash = bsv.crypto.Hash.sha256(Buffer.from(status.payload))
//   const signature = bsv.crypto.Signature.fromString(status.signature)
//   const publicKey = bsv.PublicKey.fromString(status.publicKey)

//   return bsv.crypto.ECDSA.verify(payloadHash, signature, publicKey)
// }
