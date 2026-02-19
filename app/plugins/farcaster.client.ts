import { sdk } from '@farcaster/miniapp-sdk'

export default defineNuxtPlugin(async () => {
  try {
    await sdk.actions.ready()
  } catch {
    // Not running inside a Farcaster client
  }

  return {
    provide: {
      farcasterSDK: sdk,
    },
  }
})
