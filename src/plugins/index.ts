import { ProviderPlugin } from "../classes"

import WhatsonchainPlugin from "./whatsonchain"
import TaalPlugin from "./taal"
import BitailsPlugin from "./bitails"
import GorillapoolPlugin from "./gorillapool"

const Plugins: typeof ProviderPlugin[] = [
  WhatsonchainPlugin,
  TaalPlugin,
  BitailsPlugin, // Currently does not provide pubkey and signature
  GorillapoolPlugin,
]

export default Plugins
