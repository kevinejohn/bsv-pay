# bsv-pay

[![NPM Package](https://img.shields.io/npm/v/bsv-pay.svg?style=flat-square)](https://www.npmjs.org/package/bsv-pay)

Broadcast bitcoin transactions to miners

### Current supported services:

- taal
- whatsonchain
- gorillapool

### Use

`npm install bsv-pay`

```js
const BsvPay = require("bsv-pay")

const pay = new BsvPay({
  DEBUG: true
  plugins: []
  pluginOptions: {
    // whatsonchain: false // To disable specific service
    // taal: false,
    // gorillapool: false,
  },
})
const { success, report } = await pay.broadcast(txHex)
const { success, report } = await pay.status(txid)

pay.feePerKb()
```

### Tests

`npm run test`
