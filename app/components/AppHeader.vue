<template>
  <header class="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span class="text-2xl">🎯</span>
          <span class="text-lg font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
            Price Targets
          </span>
        </NuxtLink>

        <div class="flex items-center gap-3">
          <div v-if="farcasterUser" class="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
            {{ farcasterUser }}
          </div>

          <button
            v-if="!walletAddress"
            @click="connectWallet"
            class="px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors"
          >
            Connect
          </button>
          <button
            v-else
            @click="disconnectWallet"
            class="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors font-mono"
          >
            {{ truncatedAddress }}
          </button>

          <ThemeToggle />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { getAccount, connect, disconnect, watchAccount, injected } from '@wagmi/core'

export default {
  data() {
    return {
      walletAddress: '',
      farcasterUser: '',
      unwatchAccount: null,
    }
  },
  computed: {
    truncatedAddress() {
      if (!this.walletAddress) return ''
      return this.walletAddress.slice(0, 6) + '...' + this.walletAddress.slice(-4)
    },
  },
  mounted() {
    this.initWallet()
    this.initFarcaster()
  },
  beforeUnmount() {
    if (this.unwatchAccount) this.unwatchAccount()
  },
  methods: {
    initWallet() {
      const nuxtApp = useNuxtApp()
      const config = nuxtApp.$wagmiConfig
      if (!config) return

      const account = getAccount(config)
      if (account.address) {
        this.walletAddress = account.address
      }

      this.unwatchAccount = watchAccount(config, {
        onChange: (account) => {
          this.walletAddress = account.address || ''
        },
      })
    },
    async connectWallet() {
      const nuxtApp = useNuxtApp()
      const config = nuxtApp.$wagmiConfig
      if (!config) return

      try {
        const result = await connect(config, { connector: injected() })
        this.walletAddress = result.accounts[0] || ''
      } catch (err) {
        console.warn('Wallet connection failed:', err)
      }
    },
    async disconnectWallet() {
      const nuxtApp = useNuxtApp()
      const config = nuxtApp.$wagmiConfig
      if (!config) return

      try {
        await disconnect(config)
        this.walletAddress = ''
      } catch (err) {
        console.warn('Wallet disconnect failed:', err)
      }
    },
    async initFarcaster() {
      const nuxtApp = useNuxtApp()
      const farcasterSDK = nuxtApp.$farcasterSDK
      if (!farcasterSDK) return

      try {
        const context = await farcasterSDK.context
        if (context?.user?.displayName) {
          this.farcasterUser = String(context.user.displayName)
        }
      } catch {
        // Not in a Farcaster context
      }
    },
  },
}
</script>
