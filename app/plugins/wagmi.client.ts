import { createConfig, http } from '@wagmi/core'
import { mainnet, base } from 'viem/chains'

export default defineNuxtPlugin(() => {
  const config = createConfig({
    chains: [mainnet, base],
    transports: {
      [mainnet.id]: http(),
      [base.id]: http(),
    },
  })

  return {
    provide: {
      wagmiConfig: config,
    },
  }
})
