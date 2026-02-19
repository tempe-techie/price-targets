<template>
  <div :class="{ dark: colorMode.value === 'dark' }">
    <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200">
      <AppHeader />
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    colorMode() {
      return useColorMode()
    },
  },
}
</script>
