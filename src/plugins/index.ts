import { ProviderPlugin } from "../classes"

const Whatsonchain = require("./whatsonchain")
const Taal = require("./taal")
// const Bitails = require("./bitails");
const GorillaPool = require("./gorillapool")

const Plugins: ProviderPlugin[] = [
  Whatsonchain,
  Taal,
  //   Bitails, // Currently does not provide pubkey and signature
  GorillaPool,
]

export default Plugins
