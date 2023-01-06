declare module "bsv" {
  export class Bsm {
    static magicHash(messageBuf: Buffer): Buffer
    static verify(messageBuf: Buffer, sigstr: string, address: Address): boolean
  }

  export class Bip32 {
    static fromString(str: string): Bip32

    pubKey: PubKey

    derive(path: string): this
  }

  export class Address {
    hashBuf: Buffer

    static fromPubKey(pubKey: PubKey): Address
    static fromString(str: string): Address
  }

  export class PubKey {}

  export class Address {
    static fromPubKey(pubKey: PubKey): Address

    toString(): string
  }

  export class Tx {
    static fromHex(hex: string): Tx

    toBuffer(): Buffer
    id(): string
  }

  export class Script {
    static fromPubKeyHash(hashBuf: Buffer): Script

    toBuffer(): Buffer
  }

  export class Hash {
    static ripemd160(buf: Buffer): Buffer
  }

  export class Base58 {
    static fromBuffer(buf: Buffer): Base58

    toString(): string
  }
}
