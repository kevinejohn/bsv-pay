const BsvPay = require("../index/index");

const pay = new BsvPay({
  fetchFunc: require("isomorphic-fetch"),
});

(async () => {
  const txid =
    "48ef867724a5028a9c40beedae58e6292249bf4b5db590b750744c7dae6cf216";
  // const { txid } = await pay.broadcast({ tx, verbose: false });
  const { valid } = await pay.status({ txid, verbose: true });
  console.log(`Txid: ${txid} is ${valid ? "valid" : "invalid"}`);
  const fee = await pay.feePerKb();
  console.log(`${fee}/kbs sats miner fee`);
})();
