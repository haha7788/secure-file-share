<template>
  <div>
    <div v-if="!transferring && !waiting && !showComplete" :class="['rounded-2xl p-8 mb-8 shadow-sm border', theme === 'dark' ? 'bg-[#151515] border-gray-700' : 'bg-white border-gray-200']">
      <div :class="['flex gap-2 p-1.5 rounded-xl border mb-6 relative', theme === 'dark' ? 'bg-[#151515] border-gray-700' : 'bg-gray-100 border-gray-200']">
        <div
          class="absolute top-1.5 bottom-1.5 rounded-lg transition-all duration-300 ease-out pointer-events-none"
          :class="theme === 'dark' ? 'bg-white' : 'bg-gray-900'"
          :style="{
            width: 'calc((100% - 12px - 8px) / 2)',
            left: mode === 'send' ? '6px' : 'calc(50% + 4px)'
          }"
        />
        <button
          @click="switchModeWithoutReset('send')"
          :class="[
            'flex-1 py-3 rounded-lg transition-all duration-300 text-sm font-semibold relative z-10',
            mode === 'send'
              ? (theme === 'dark' ? 'text-black' : 'text-white')
              : (theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800')
          ]"
        >
          <Send :size="16" class="inline mr-2" />
          {{ t.p2pSend }}
        </button>
        <button
          @click="switchModeWithoutReset('receive')"
          :class="[
            'flex-1 py-3 rounded-lg transition-all duration-300 text-sm font-semibold relative z-10',
            mode === 'receive'
              ? (theme === 'dark' ? 'text-black' : 'text-white')
              : (theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800')
          ]"
        >
          <ArrowDownToLine :size="16" class="inline mr-2" />
          {{ t.p2pReceive }}
        </button>
      </div>

      <div class="relative overflow-hidden">
        <div
          :class="[
            'transition-all duration-500',
            mode === 'send' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute inset-0 pointer-events-none'
          ]"
        >
          <div class="relative overflow-hidden h-[318px]">
            <div @click="$refs.fileInput.click()" :class="['h-[286px] rounded-xl border-2 border-dashed transition-all relative cursor-pointer', theme === 'dark' ? 'border-gray-700 hover:bg-[#222222]' : 'border-gray-300 hover:bg-gray-100']">
            <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect" />
            <div v-if="!selectedFile" class="text-center px-4 flex items-center justify-center h-full">
              <div>
                <Upload :size="56" :class="['mx-auto mb-4', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']" />
                <p class="font-medium mb-1">{{ t.p2pDragFile }}</p>
                <p :class="['text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']">{{ t.p2pOrClick }}</p>
              </div>
            </div>

            <div v-else class="text-center px-4 flex items-center justify-center h-full">
              <div>
                <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-emerald-500">
                  <Check :size="32" class="text-white" />
                </div>
                <p class="font-semibold mb-1 break-all line-clamp-2">{{ selectedFile.name }}</p>
                <p :class="['text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600']">{{ formatBytes(selectedFile.size) }}</p>
              </div>
              <button @click.stop="selectedFile = null" :class="['absolute top-3 right-3 p-1.5 rounded transition-all z-10', theme === 'dark' ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-200 hover:text-black']">
                <X :size="18" />
              </button>
            </div>
          </div>
            <p :class="['text-xs mt-2 text-center h-[20px] leading-5', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']">
              {{ t.maxFileSize }}
            </p>
          </div>
          
          <div class="mt-6">
            <button
              @click="createRoom"
              :disabled="creating || !selectedFile"
              :class="[
                'w-full rounded-xl font-semibold transition-all text-sm shadow-sm',
                theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              ]"
              style="padding-top: 0.9375rem; padding-bottom: 0.9375rem;"
            >
              {{ creating ? t.p2pCreating : t.p2pCreateTransfer }}
            </button>
          </div>
        </div>

        <div
          :class="[
            'transition-all duration-500',
            mode === 'receive' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'
          ]"
        >
          <div class="relative overflow-hidden h-[318px]">
          <div :class="['h-[286px] rounded-xl border-2 border-dashed transition-all relative flex items-center justify-center', theme === 'dark' ? 'border-gray-700' : 'border-gray-300']">
            <div class="w-full px-6">
              <div class="text-center mb-6">
                <ArrowDownToLine :size="56" :class="['mx-auto mb-4', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']" />
                <p class="font-medium mb-1">{{ t.p2pEnterCode }}</p>
                <p :class="['text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']">{{ t.p2pEnterCodeDesc }}</p>
              </div>
              
              <div class="flex items-center justify-center gap-3">
                <div class="flex gap-1.5">
                  <input
                    v-for="i in 4"
                    :key="'g1-' + i"
                    :ref="el => { if (el) codeInputs[i - 1] = el }"
                    type="text"
                    maxlength="1"
                    :value="inputCode[i - 1] || ''"
                    @input="handleCodeInput($event, i - 1)"
                    @keydown="handleCodeKeydown($event, i - 1)"
                    @paste="handleCodePaste"
                    :class="[
                      'w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all',
                      theme === 'dark'
                        ? 'bg-[#1a1a1a] border-gray-700 text-white focus:border-white'
                        : 'bg-gray-50 border-gray-200 text-black focus:border-gray-900'
                    ]"
                    style="outline: none;"
                  />
                </div>
                <span :class="['text-3xl font-bold', theme === 'dark' ? 'text-gray-600' : 'text-gray-400']">-</span>
                <div class="flex gap-1.5">
                  <input
                    v-for="i in 4"
                    :key="'g2-' + i"
                    :ref="el => { if (el) codeInputs[i + 3] = el }"
                    type="text"
                    maxlength="1"
                    :value="inputCode[i + 3] || ''"
                    @input="handleCodeInput($event, i + 3)"
                    @keydown="handleCodeKeydown($event, i + 3)"
                    @paste="handleCodePaste"
                    :class="[
                      'w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all',
                      theme === 'dark'
                        ? 'bg-[#1a1a1a] border-gray-700 text-white focus:border-white'
                        : 'bg-gray-50 border-gray-200 text-black focus:border-gray-900'
                    ]"
                    style="outline: none;"
                  />
                </div>
              </div>

              <div v-if="receivingEncrypted" class="mt-4">
                <input
                  v-model="inputEncryptionKey"
                  type="text"
                  :placeholder="t.p2pKeyPlaceholder"
                  :class="[
                    'w-full px-4 py-3 rounded-xl border transition-all text-sm font-mono text-center',
                    theme === 'dark'
                      ? 'bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500 focus:border-white'
                      : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:border-gray-900'
                  ]"
                  style="outline: none;"
                />
              </div>
            </div>
          </div>
            <p :class="['text-xs mt-2 text-center h-[20px] leading-5', theme === 'dark' ? 'text-gray-400' : 'text-gray-500']">
              &nbsp;
            </p>
          </div>

          <div class="mt-6">
            <button
              @click="joinRoom"
              :disabled="joining || inputCode.length !== 8"
              :class="[
                'w-full rounded-xl font-semibold transition-all text-sm shadow-sm',
                theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              ]"
              style="padding-top: 0.9375rem; padding-bottom: 0.9375rem;"
            >
              {{ joining ? t.p2pJoining : t.p2pJoinRoom }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="mode === 'send' && waiting && !transferring && !showComplete" :class="['w-[720px] h-[540px] rounded-2xl p-8 mb-8 shadow-sm border mx-auto flex flex-col items-center justify-center', theme === 'dark' ? 'bg-[#151515] border-gray-700' : 'bg-white border-gray-200']">
      <div class="text-center mb-10">
        <div class="relative inline-block">
          <div class="relative w-28 h-28 mx-auto mb-10">
            <div :class="['absolute inset-0 rounded-full border-4 animate-ping', theme === 'dark' ? 'border-white/20' : 'border-gray-900/20']" style="animation-duration: 2s;"></div>
            <div :class="['absolute inset-2 rounded-full border-4 animate-ping', theme === 'dark' ? 'border-white/30' : 'border-gray-900/30']" style="animation-duration: 2s; animation-delay: 0.3s;"></div>
            <div :class="['absolute inset-4 rounded-full border-4 animate-ping', theme === 'dark' ? 'border-white/40' : 'border-gray-900/40']" style="animation-duration: 2s; animation-delay: 0.6s;"></div>
            <div :class="['absolute inset-6 rounded-full flex items-center justify-center', theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10']">
              <Send :size="36" :class="theme === 'dark' ? 'text-white' : 'text-gray-900'" />
            </div>
          </div>
          <p :class="['text-base font-medium animate-pulse', theme === 'dark' ? 'text-gray-300' : 'text-gray-700']">
            {{ t.p2pWaitingForReceiver || 'Ожидание подключения получателя...' }}
          </p>
        </div>
      </div>

      <p :class="['text-sm mb-8 text-center', theme === 'dark' ? 'text-gray-400' : 'text-gray-600']">
        {{ selectedFile?.name }} • {{ formatBytes(selectedFile?.size || 0) }}
      </p>

      <div class="flex items-center gap-3 w-full max-w-md mb-10">
        <code :class="['flex-1 px-5 py-3 rounded-lg font-mono font-bold text-lg tracking-wide border', theme === 'dark' ? 'bg-[#1a1a1a] border-gray-700' : 'bg-gray-50 border-gray-200']">
          {{ transferCode }}
        </code>
        
        <button 
          @click="copyRoomCode" 
          :class="[
            'px-5 py-3 rounded-lg transition-all flex items-center justify-center',
            codeCopied 
              ? 'bg-green-500 text-white' 
              : (theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800')
          ]"
        >
          <Copy v-if="!codeCopied" :size="20" />
          <Check v-else :size="20" />
        </button>
      </div>

      <button @click="cancelTransfer" :class="['w-full max-w-md py-3.5 rounded-xl font-semibold transition-all text-sm border', theme === 'dark' ? 'border-gray-700 hover:bg-[#222222]' : 'border-gray-200 hover:bg-gray-100']">
        {{ t.p2pCancelTransfer }}
      </button>
    </div>

    <TransferProgress
      v-if="transferring && !showComplete"
      :progress="transferProgress"
      :filename="mode === 'send' ? selectedFile.name : receivedFileInfo?.name"
      :size="mode === 'send' ? selectedFile.size : receivedFileInfo?.size"
      :role="mode === 'send' ? 'sender' : 'receiver'"
      :theme="theme"
      @cancel="cancelTransfer"
    />

    <div v-else-if="showComplete" :class="['w-[720px] h-[540px] rounded-2xl p-8 mb-8 shadow-sm border mx-auto flex items-center justify-center', theme === 'dark' ? 'bg-[#151515] border-gray-700' : 'bg-white border-gray-200']">
      <div class="text-center w-full">
          <div class="w-20 h-20 rounded-full bg-green-500 text-white mx-auto mb-4 flex items-center justify-center">
            <Check :size="40" />
          </div>
          <h2 class="text-2xl font-bold mb-6">{{ t.p2pTransferComplete }}</h2>
          
          <div :class="['text-left space-y-3 p-4 rounded-xl mb-6 border', theme === 'dark' ? 'bg-[#1a1a1a] border-gray-700' : 'bg-gray-50 border-gray-200']">
            <div class="flex justify-between text-sm">
              <span :class="theme === 'dark' ? 'text-gray-400' : 'text-gray-600'">{{ t.p2pFilename }}:</span>
              <span class="font-medium truncate ml-2">{{ completionStats.filename }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span :class="theme === 'dark' ? 'text-gray-400' : 'text-gray-600'">{{ t.p2pSize }}:</span>
              <span class="font-medium">{{ formatBytes(completionStats.size) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span :class="theme === 'dark' ? 'text-gray-400' : 'text-gray-600'">{{ t.p2pDuration }}:</span>
              <span class="font-medium">{{ completionStats.duration?.toFixed(2) }}s</span>
            </div>
            <div class="flex justify-between text-sm">
              <span :class="theme === 'dark' ? 'text-gray-400' : 'text-gray-600'">{{ t.p2pAvgSpeed }}:</span>
              <span class="font-medium">{{ formatBytes(completionStats.avgSpeed) }}/s</span>
            </div>
          </div>

          <button
            v-if="mode === 'receive'"
            @click="downloadFile"
            :class="[
              'w-full rounded-xl font-semibold mb-3 transition-all text-sm shadow-sm',
              theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'
            ]"
            style="padding-top: 0.9375rem; padding-bottom: 0.9375rem;"
          >
            {{ t.p2pDownload }}
          </button>

        <button @click="reset" :class="['w-full py-3 rounded-xl font-semibold transition-all text-sm border', theme === 'dark' ? 'border-gray-700 hover:bg-[#222222]' : 'border-gray-200 hover:bg-gray-100']">
          {{ t.p2pNewTransfer }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Upload, FileText, Copy, Check, X, Lock, Send, ArrowDownToLine } from 'lucide-vue-next'
import { P2PClient } from '../utils/p2pClient'
import { useFormatters } from '../composables/useFormatters'
import TransferProgress from './TransferProgress.vue'

const props = defineProps({
  mode: String,
  theme: String,
  t: Object
})

const emit = defineEmits(['update:mode'])

const { formatBytes } = useFormatters()

const switchMode = (newMode) => {
  reset()
  emit('update:mode', newMode)
}

const switchModeWithoutReset = (newMode) => {
  emit('update:mode', newMode)
}

const selectedFile = ref(null)
const encryptionEnabled = true
const encryptionKey = ref(null)
const transferCode = ref(null)
const creating = ref(false)
const joining = ref(false)
const inputCode = ref('')
const inputEncryptionKey = ref('')
const receivingEncrypted = ref(false)
const codeCopied = ref(false)
const keyCopied = ref(false)
const transferring = ref(false)
const waiting = ref(false)
const transferProgress = ref({
  bytesTransferred: 0,
  totalBytes: 0,
  percentage: 0,
  speed: 0
})
const receivedFileInfo = ref(null)
const showComplete = ref(false)
const completionStats = ref({})
const codeInputs = ref([])

let p2pClient = null

const handleCodeInput = (event, index) => {
  const value = event.target.value
  if (value && /^[A-Za-z0-9]$/.test(value)) {
    const codeArray = inputCode.value.split('')
    codeArray[index] = value
    inputCode.value = codeArray.join('')
    
    if (index < 7 && codeInputs.value[index + 1]) {
      codeInputs.value[index + 1].focus()
    }
  }
}

const handleCodeKeydown = (event, index) => {
  if (event.key === 'Backspace') {
    event.preventDefault()
    const codeArray = inputCode.value.split('')
    if (codeArray[index]) {
      codeArray[index] = ''
      inputCode.value = codeArray.join('')
    } else if (index > 0 && codeInputs.value[index - 1]) {
      codeArray[index - 1] = ''
      inputCode.value = codeArray.join('')
      codeInputs.value[index - 1].focus()
    }
  } else if (event.key === 'ArrowLeft' && index > 0 && codeInputs.value[index - 1]) {
    event.preventDefault()
    codeInputs.value[index - 1].focus()
  } else if (event.key === 'ArrowRight' && index < 7 && codeInputs.value[index + 1]) {
    event.preventDefault()
    codeInputs.value[index + 1].focus()
  }
}

const handleCodePaste = (event) => {
  event.preventDefault()
  const pastedText = event.clipboardData.getData('text').replace(/[^A-Za-z0-9]/g, '')
  if (pastedText.length <= 8) {
    inputCode.value = pastedText.padEnd(8, '').substring(0, 8)
    const nextIndex = Math.min(pastedText.length, 7)
    if (codeInputs.value[nextIndex]) {
      codeInputs.value[nextIndex].focus()
    }
  }
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    const cleanText = text.replace(/[^A-Za-z0-9]/g, '')
    if (cleanText.length <= 8) {
      inputCode.value = cleanText.padEnd(8, '').substring(0, 8)
      const nextIndex = Math.min(cleanText.length, 7)
      if (codeInputs.value[nextIndex]) {
        codeInputs.value[nextIndex].focus()
      }
    }
  } catch (err) {
    console.error(err)
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const createRoom = async () => {
  creating.value = true
  
  try {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${window.location.hostname}:3000/p2p`
    p2pClient = new P2PClient()
    
    await p2pClient.connect(wsUrl)
    await p2pClient.createRoom(selectedFile.value, encryptionEnabled)
    
    p2pClient.onPeerJoined = () => {
      waiting.value = false
      transferring.value = true
    }
    
    p2pClient.onProgress = (progress) => {
      transferProgress.value = progress
    }
    
    p2pClient.onComplete = (stats) => {
      completionStats.value = stats
      transferring.value = false
      showComplete.value = true
    }
    
    p2pClient.onError = (error) => {
      alert(error.message)
      if (!showComplete.value) {
        reset()
      }
    }
    
    p2pClient.onPeerDisconnected = () => {
      if (!showComplete.value) {
        alert('Peer disconnected')
        reset()
      }
    }
    
    setTimeout(() => {
      transferCode.value = p2pClient.roomId
      creating.value = false
      waiting.value = true
    }, 100)
    
    if (encryptionEnabled) {
      encryptionKey.value = await p2pClient.getEncryptionKey()
    }
    
  } catch (error) {
    alert(error.message)
    creating.value = false
  }
}

const joinRoom = async () => {
  joining.value = true
  
  try {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${window.location.hostname}:3000/p2p`
    p2pClient = new P2PClient()
    
    await p2pClient.connect(wsUrl)
    
    if (inputEncryptionKey.value) {
      await p2pClient.setEncryptionKey(inputEncryptionKey.value)
    }
    
    await p2pClient.joinRoom(inputCode.value)
    
    p2pClient.onProgress = (progress) => {
      transferProgress.value = progress
      if (!receivedFileInfo.value && p2pClient.transferData.file) {
        receivedFileInfo.value = p2pClient.transferData.file
      }
    }
    
    p2pClient.onComplete = (stats) => {
      completionStats.value = stats
      transferring.value = false
      showComplete.value = true
    }
    
    p2pClient.onError = (error) => {
      alert(error.message)
      if (!showComplete.value) {
        reset()
      }
    }
    
    p2pClient.onPeerDisconnected = () => {
      if (!showComplete.value) {
        alert('Peer disconnected')
        reset()
      }
    }
    
    joining.value = false
    transferring.value = true
    
    setTimeout(() => {
      if (p2pClient && p2pClient.transferData.file) {
        receivedFileInfo.value = p2pClient.transferData.file
      }
    }, 100)
    
  } catch (error) {
    alert(error.message)
    joining.value = false
  }
}

const copyRoomCode = () => {
  navigator.clipboard.writeText(transferCode.value)
  codeCopied.value = true
  setTimeout(() => codeCopied.value = false, 2000)
}

const copyEncryptionKey = () => {
  navigator.clipboard.writeText(encryptionKey.value)
  keyCopied.value = true
  setTimeout(() => keyCopied.value = false, 2000)
}

const cancelTransfer = () => {
  if (p2pClient) {
    p2pClient.cancel()
  }
  reset()
}

const downloadFile = () => {
  if (p2pClient) {
    const blob = p2pClient.getReceivedFile()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = receivedFileInfo.value.name
    a.click()
    URL.revokeObjectURL(url)
  }
}

const reset = () => {
  if (p2pClient) {
    p2pClient.disconnect()
    p2pClient = null
  }
  
  selectedFile.value = null
  encryptionKey.value = null
  transferCode.value = null
  creating.value = false
  joining.value = false
  waiting.value = false
  inputCode.value = ''
  inputEncryptionKey.value = ''
  receivingEncrypted.value = false
  codeCopied.value = false
  keyCopied.value = false
  transferring.value = false
  transferProgress.value = {
    bytesTransferred: 0,
    totalBytes: 0,
    percentage: 0,
    speed: 0
  }
  receivedFileInfo.value = null
  showComplete.value = false
  completionStats.value = {}
}
</script>