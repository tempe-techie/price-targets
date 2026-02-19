import { sdk } from '@farcaster/miniapp-sdk'

export default defineNuxtPlugin(async () => {
  let isInMiniApp = false

  try {
    await sdk.actions.ready()
    isInMiniApp = await sdk.isInMiniApp()
  } catch {
    // Not running inside a Farcaster client
  }

  return {
    provide: {
      farcasterSDK: sdk,
      isInMiniApp,
    },
  }
})
