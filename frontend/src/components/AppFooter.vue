<template>
  <footer>
    <div class="max-w-3xl mx-auto px-6">
      <div :class="['h-px w-full mb-6', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300']"></div>
      <div :class="['flex items-center justify-between text-sm pb-6', muted]">
        <span>© {{ new Date().getFullYear() }} {{ translations.title }}</span>
        <span>{{ translations.secureFileSharing }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useTheme } from '../composables/useTheme'
import { useLocale } from '../composables/useLocale'

const { theme, muted } = useTheme()
const { t: translations } = useLocale()
</script>