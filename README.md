# bsv-pay

[![NPM Package](https://img.shields.io/npm/v/bsv-pay.svg?style=flat-square)](https://www.npmjs.org/package/bsv-pay)

Broadcast bitcoin transactions to many services

### Current supported services:

- Mattercloud
- Matterpool
- Mempool
- Taal
- WhatsOnChain

### Use

`npm install bsv-pay`

```
const BsvPay = require('bsv-pay')
const fetchFunc = require('node-fetch')

const pay = new BsvPay({
    fetchFunc,
    mattercloud: {
        api_key: ''
    },
    mempool: {
        token: ''
    }
})
pay.feePerKb()
const { txid } = await pay.broadcast({ tx })
const status = await pay.status({ txid, verbose: true })
```

### Tests

`npm run test`
