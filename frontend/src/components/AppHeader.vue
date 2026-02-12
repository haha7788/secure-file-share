<template>
  <header class="max-w-3xl mx-auto px-6 pt-6 pb-4">
    <div class="flex items-center justify-between">
      <router-link to="/" :class="['text-xl font-bold transition-colors', text]">
        {{ translations.title }}
      </router-link>
      <div class="flex items-center gap-2">
        <button
          @click="toggleLocale"
          :class="['px-3 py-2 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium', border, hover]"
        >
          <Globe :size="16" />
          <span>{{ translations.langBtn }}</span>
        </button>
        <button
          @click="toggleTheme"
          :class="['px-3 py-2 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium', border, hover]"
        >
          <Moon v-if="theme === 'dark'" :size="16" />
          <Sun v-else :size="16" />
          <span>{{ theme === 'dark' ? translations.themeBtn : translations.themeBtnLight }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Globe, Moon, Sun } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'
import { useLocale } from '../composables/useLocale'

const { theme, text, border, hover, toggleTheme } = useTheme()
const { lang, toggleLocale, t: translations } = useLocale()
</script>