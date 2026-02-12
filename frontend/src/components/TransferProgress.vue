<template>
  <div :class="['w-[720px] h-[540px] rounded-2xl p-8 mb-8 shadow-sm border mx-auto flex flex-col justify-center', theme === 'dark' ? 'bg-[#151515] border-gray-700' : 'bg-white border-gray-200']">
    <div class="text-center mb-6">
      <h2 class="text-xl font-bold mb-1">{{ role === 'sender' ? t.p2pSending : t.p2pReceiving }}</h2>
      <p :class="['text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600']">{{ filename }}</p>
    </div>

    <div class="relative h-48 mb-6">
      <div class="absolute left-12 top-1/2 -translate-y-1/2 z-10">
        <div :class="['w-20 h-20 rounded-full flex items-center justify-center relative', theme === 'dark' ? 'bg-[#1a1a1a] border-2 border-white' : 'bg-white border-2 border-gray-900']">
          <Upload :size="32" :class="theme === 'dark' ? 'text-white' : 'text-gray-900'" />
          <div :class="['absolute inset-0 rounded-full animate-ping', theme === 'dark' ? 'bg-white/20' : 'bg-gray-900/20']" style="animation-duration: 1.5s;"></div>
        </div>
      </div>
      
      <div class="absolute right-12 top-1/2 -translate-y-1/2 z-10">
        <div :class="['w-20 h-20 rounded-full flex items-center justify-center relative', theme === 'dark' ? 'bg-[#1a1a1a] border-2 border-white' : 'bg-white border-2 border-gray-900']">
          <Download :size="32" :class="theme === 'dark' ? 'text-white' : 'text-gray-900'" />
          <div :class="['absolute inset-0 rounded-full animate-ping', theme === 'dark' ? 'bg-white/20' : 'bg-gray-900/20']" style="animation-duration: 1.5s; animation-delay: 0.3s;"></div>
        </div>
      </div>

      <div class="absolute left-32 right-32 top-1/2 -translate-y-1/2 h-32">
        <canvas 
          ref="canvas" 
          :width="456" 
          :height="128"
          class="w-full h-full"
        ></canvas>
      </div>
    </div>

    <div class="text-center mb-6">
      <p :class="['text-3xl font-bold mb-2', theme === 'dark' ? 'text-white' : 'text-gray-900']">{{ progress.percentage.toFixed(1) }}%</p>
      <p :class="['text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600']">{{ formatBytes(progress.bytesTransferred) }} / {{ formatBytes(size) }}</p>
    </div>

    <div :class="['grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl border', theme === 'dark' ? 'bg-[#1a1a1a] border-gray-700' : 'bg-gray-50 border-gray-200']">
      <div class="text-center">
        <p :class="['text-xs mb-1', theme === 'dark' ? 'text-gray-400' : 'text-gray-600']">{{ t.p2pSpeed }}</p>
        <p :class="['text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900']">{{ formatBytes(progress.speed) }}/s</p>
      </div>
      <div class="text-center">
        <p :class="['text-xs mb-1', theme === 'dark' ? 'text-gray-400' : 'text-gray-600']">{{ t.p2pRemaining }}</p>
        <p :class="['text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900']">{{ estimatedTime > 0 ? formatTime(estimatedTime) : '--' }}</p>
      </div>
    </div>

    <button @click="$emit('cancel')" :class="['w-full max-w-md mx-auto py-3 rounded-xl font-semibold transition-all text-sm border', theme === 'dark' ? 'border-gray-700 hover:bg-[#222222]' : 'border-gray-200 hover:bg-gray-100']">
      {{ t.p2pCancel }}
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Upload, Download } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'
import { useLocale } from '../composables/useLocale'
import { useFormatters } from '../composables/useFormatters'

const props = defineProps({
  progress: {
    type: Object,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    required: true
  }
})

defineEmits(['cancel'])

const { theme } = useTheme()
const { t } = useLocale()
const { formatBytes } = useFormatters()

const canvas = ref(null)
let ctx = null
let animationFrame = null
let particles = []

const estimatedTime = computed(() => {
  if (props.progress.speed === 0) return 0
  const remaining = props.size - props.progress.bytesTransferred
  return remaining / props.progress.speed
})

const formatTime = (seconds) => {
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const secs = Math.ceil(seconds % 60)
  return `${minutes}m ${secs}s`
}

class Particle {
  constructor(width, height, isDark) {
    this.reset(width, height, isDark, true)
  }

  reset(width, height, isDark, initial = false) {
    this.x = initial ? Math.random() * width : 0
    this.y = height / 2 + (Math.random() - 0.5) * 60
    this.baseY = this.y
    this.speed = 1 + Math.random() * 2
    this.size = 2 + Math.random() * 3
    this.opacity = 0.3 + Math.random() * 0.7
    this.color = isDark ? 'rgba(255, 255, 255,' : 'rgba(0, 0, 0,'
    this.offset = Math.random() * Math.PI * 2
    this.waveAmplitude = 10 + Math.random() * 20
    this.waveFrequency = 0.01 + Math.random() * 0.02
  }

  update(width, height, progress, isDark) {
    this.x += this.speed * (progress / 100)
    this.y = this.baseY + Math.sin(this.x * this.waveFrequency + this.offset) * this.waveAmplitude
    
    if (this.x > width) {
      this.reset(width, height, isDark)
    }
  }

  draw(ctx) {
    ctx.save()
    
    ctx.shadowBlur = 15
    ctx.shadowColor = this.color + this.opacity + ')'
    
    ctx.globalAlpha = this.opacity
    ctx.fillStyle = this.color + this.opacity + ')'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    
    const gradient = ctx.createLinearGradient(this.x - 20, this.y, this.x, this.y)
    gradient.addColorStop(0, this.color + '0)')
    gradient.addColorStop(1, this.color + (this.opacity * 0.5) + ')')
    ctx.fillStyle = gradient
    ctx.fillRect(this.x - 20, this.y - this.size / 2, 20, this.size)
    
    ctx.restore()
  }
}

function initCanvas() {
  if (!canvas.value) return
  
  ctx = canvas.value.getContext('2d')
  const width = canvas.value.width
  const height = canvas.value.height
  const isDark = theme.value === 'dark'
  
  particles = []
  for (let i = 0; i < 50; i++) {
    particles.push(new Particle(width, height, isDark))
  }
  
  animate()
}

function animate() {
  if (!canvas.value || !ctx) return
  
  const width = canvas.value.width
  const height = canvas.value.height
  const isDark = theme.value === 'dark'
  
  ctx.clearRect(0, 0, width, height)
  
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()
  
  particles.forEach(particle => {
    particle.update(width, height, props.progress.percentage, isDark)
    particle.draw(ctx)
  })
  
  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  if (canvas.value) {
    initCanvas()
  }
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
</style>