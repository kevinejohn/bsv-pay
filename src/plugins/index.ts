const Whatsonchain = require("./whatsonchain")
const Taal = require("./taal")
// const Bitails = require("./bitails");
const GorillaPool = require("./gorillapool")

module.exports = [
  Whatsonchain,
  Taal,
  //   Bitails, // Currently does not provide pubkey and signature
  GorillaPool,
]
