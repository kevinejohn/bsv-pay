# bsv-pay

[![NPM Package](https://img.shields.io/npm/v/bsv-pay.svg?style=flat-square)](https://www.npmjs.org/package/bsv-pay)

Broadcast bitcoin transactions to many services

### Current supported services:

- mattercloud
- matterpool
- mempool
- taal
- whatsonchain

### Use

`npm install bsv-pay`

```
const BsvPay = require('bsv-pay')

const pay = new BsvPay({
    fetchFunc: require('node-fetch'),  // Node.js
    // fetchFunc: fetch, // Browser
    mattercloud: {
        api_key: ''
    },
    mempool: {
        token: ''
    },
    // whatsonchain: false // To disable specific service
})
const { txid } = await pay.broadcast({ tx, verbose: false })
const { valid } = await pay.status({ txid, verbose: true })
pay.feePerKb()
```

### Tests

`npm run test`
