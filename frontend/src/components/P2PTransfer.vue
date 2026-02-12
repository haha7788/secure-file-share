<template>
  <div :class="['min-h-screen transition-colors duration-300', bg, text]">
    <AppHeader />

    <main class="max-w-3xl mx-auto px-6 pt-8 pb-20">
      <div v-if="!mode" class="space-y-4">
        <h1 class="text-3xl font-bold mb-8">{{ t.p2pTitle }}</h1>
        
        <div :class="['rounded-2xl p-8 shadow-sm border cursor-pointer transition-all', card, border, hover]" @click="mode = 'send'">
          <div class="flex items-center gap-4">
            <div :class="['w-16 h-16 rounded-full flex items-center justify-center', theme === 'dark' ? 'bg-white text-black' : 'bg-gray-900 text-white']">
              <Upload :size="32" />
            </div>
            <div>
              <h2 class="text-xl font-bold mb-1">{{ t.p2pSendTitle }}</h2>
              <p :class="['text-sm', muted]">{{ t.p2pSendDesc }}</p>
            </div>
          </div>
        </div>

        <div :class="['rounded-2xl p-8 shadow-sm border cursor-pointer transition-all', card, border, hover]" @click="mode = 'receive'">
          <div class="flex items-center gap-4">
            <div :class="['w-16 h-16 rounded-full flex items-center justify-center', theme === 'dark' ? 'bg-white text-black' : 'bg-gray-900 text-white']">
              <Download :size="32" />
            </div>
            <div>
              <h2 class="text-xl font-bold mb-1">{{ t.p2pReceiveTitle }}</h2>
              <p :class="['text-sm', muted]">{{ t.p2pReceiveDesc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="mode === 'send'">
        <div class="flex items-center gap-3 mb-6">
          <button @click="reset" :class="['px-3 py-2 rounded-lg border transition-all', border, hover]">
            <ArrowLeft :size="20" />
          </button>
          <h1 class="text-2xl font-bold">{{ t.p2pSendTitle }}</h1>
        </div>

        <div v-if="!selectedFile" :class="['rounded-2xl p-8 border-2 border-dashed text-center cursor-pointer transition-all', border, hover]" @click="$refs.fileInput.click()">
          <Upload :size="48" class="mx-auto mb-4 opacity-50" />
          <p class="font-medium mb-2">{{ t.p2pSelectFile }}</p>
          <p :class="['text-sm', muted]">{{ t.p2pClickToSelect }}</p>
          <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect" />
        </div>

        <div v-else-if="!transferring">
          <div :class="['rounded-2xl p-6 mb-6 shadow-sm border', card, border]">
            <div class="flex items-center gap-4 mb-4">
              <FileText :size="40" class="opacity-70" />
              <div class="flex-1">
                <p class="font-medium break-all">{{ selectedFile.name }}</p>
                <p :class="['text-sm', muted]">{{ formatBytes(selectedFile.size) }}</p>
              </div>
              <button @click="selectedFile = null" :class="['p-2 rounded-lg transition-all', hover]">
                <X :size="20" />
              </button>
            </div>

            <div class="space-y-3">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="encryptionEnabled" class="w-4 h-4" />
                <span class="text-sm">{{ t.p2pEnableEncryption }}</span>
              </label>
            </div>
          </div>

          <button v-if="!roomCode" @click="createRoom" :disabled="creating" :class="['w-full py-3.5 rounded-xl font-semibold transition-all text-sm shadow-sm', theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800']">
            {{ creating ? t.p2pCreating : t.p2pCreateRoom }}
          </button>

          <div v-else :class="['rounded-2xl p-8 shadow-sm border text-center', card, border]">
            <Lock :size="48" class="mx-auto mb-4 opacity-70" />
            <p :class="['text-sm mb-2', muted]">{{ t.p2pRoomCode }}</p>
            <div class="flex items-center justify-center gap-3 mb-4">
              <code class="text-3xl font-mono font-bold tracking-wider">{{ roomCode }}</code>
              <button @click="copyRoomCode" :class="['p-2 rounded-lg transition-all', hover]">
                <Copy v-if="!codeCopied" :size="20" />
                <Check v-else :size="20" class="text-green-500" />
              </button>
            </div>
            
            <div v-if="encryptionEnabled && encryptionKey" class="mt-4 p-4 rounded-lg" :class="theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'">
              <p :class="['text-xs mb-2', muted]">{{ t.p2pEncryptionKey }}</p>
              <div class="flex items-center gap-2">
                <code class="text-xs break-all flex-1">{{ encryptionKey }}</code>
                <button @click="copyEncryptionKey" :class="['p-1 rounded transition-all', hover]">
                  <Copy v-if="!keyCopied" :size="16" />
                  <Check v-else :size="16" class="text-green-500" />
                </button>
              </div>
            </div>

            <p :class="['text-sm mt-4', muted]">{{ t.p2pWaitingForReceiver }}</p>
            <div class="flex items-center justify-center gap-2 mt-2">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>

        <div v-else>
          <TransferProgress
            :progress="transferProgress"
            :filename="selectedFile.name"
            :size="selectedFile.size"
            :role="'sender'"
            @cancel="cancelTransfer"
          />
        </div>
      </div>

      <div v-else-if="mode === 'receive'">
        <div class="flex items-center gap-3 mb-6">
          <button @click="reset" :class="['px-3 py-2 rounded-lg border transition-all', border, hover]">
            <ArrowLeft :size="20" />
          </button>
          <h1 class="text-2xl font-bold">{{ t.p2pReceiveTitle }}</h1>
        </div>

        <div v-if="!transferring" :class="['rounded-2xl p-8 shadow-sm border', card, border]">
          <label :class="['block text-sm font-semibold mb-2', text]">{{ t.p2pEnterCode }}</label>
          <input
            v-model="inputCode"
            type="text"
            maxlength="6"
            :placeholder="t.p2pCodePlaceholder"
            @input="inputCode = inputCode.toUpperCase()"
            :class="[
              'w-full px-4 py-3 rounded-xl border transition-all text-center text-2xl font-mono font-bold tracking-wider mb-4',
              theme === 'dark'
                ? 'bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500 focus:border-white'
                : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:border-gray-900'
            ]"
            style="outline: none;"
          />

          <div v-if="receivingEncrypted" class="mb-4">
            <label :class="['block text-sm font-semibold mb-2', text]">{{ t.p2pEncryptionKey }}</label>
            <input
              v-model="inputEncryptionKey"
              type="text"
              :placeholder="t.p2pKeyPlaceholder"
              :class="[
                'w-full px-4 py-3 rounded-xl border transition-all text-sm font-mono',
                theme === 'dark'
                  ? 'bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500 focus:border-white'
                  : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:border-gray-900'
              ]"
              style="outline: none;"
            />
          </div>

          <button @click="joinRoom" :disabled="joining || inputCode.length !== 6" :class="['w-full py-3.5 rounded-xl font-semibold transition-all text-sm shadow-sm', theme === 'dark' ? 'bg-white text-black hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-600' : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400']">
            {{ joining ? t.p2pJoining : t.p2pJoinRoom }}
          </button>
        </div>

        <div v-else>
          <TransferProgress
            :progress="transferProgress"
            :filename="receivedFileInfo?.name"
            :size="receivedFileInfo?.size"
            :role="'receiver'"
            @cancel="cancelTransfer"
          />
        </div>
      </div>

      <Teleport to="body">
        <div v-if="showComplete" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" @click="showComplete = false">
          <div :class="['rounded-2xl p-8 max-w-md w-full shadow-xl', card]" @click.stop>
            <div class="text-center">
              <div class="w-20 h-20 rounded-full bg-green-500 text-white mx-auto mb-4 flex items-center justify-center">
                <Check :size="40" />
              </div>
              <h2 class="text-2xl font-bold mb-4">{{ t.p2pTransferComplete }}</h2>
              
              <div :class="['text-left space-y-2 p-4 rounded-lg mb-6', theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100']">
                <div class="flex justify-between text-sm">
                  <span :class="muted">{{ t.p2pFilename }}:</span>
                  <span class="font-medium">{{ completionStats.filename }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span :class="muted">{{ t.p2pSize }}:</span>
                  <span class="font-medium">{{ formatBytes(completionStats.size) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span :class="muted">{{ t.p2pDuration }}:</span>
                  <span class="font-medium">{{ completionStats.duration?.toFixed(2) }}s</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span :class="muted">{{ t.p2pAvgSpeed }}:</span>
                  <span class="font-medium">{{ formatBytes(completionStats.avgSpeed) }}/s</span>
                </div>
              </div>

              <button v-if="mode === 'receive'" @click="downloadFile" :class="['w-full py-3 rounded-xl font-semibold mb-3 transition-all', theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800']">
                {{ t.p2pDownload }}
              </button>

              <button @click="reset" :class="['w-full py-3 rounded-xl font-semibold transition-all', border, hover]">
                {{ t.p2pNewTransfer }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Upload, Download, FileText, Copy, Check, X, Lock, ArrowLeft } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'
import { useLocale } from '../composables/useLocale'
import { useFormatters } from '../composables/useFormatters'
import { P2PClient } from '../utils/p2pClient'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import TransferProgress from './TransferProgress.vue'

const { theme, bg, text, card, border, hover, muted } = useTheme()
const { t } = useLocale()
const { formatBytes } = useFormatters()

const mode = ref(null)
const selectedFile = ref(null)
const encryptionEnabled = ref(true)
const encryptionKey = ref(null)
const roomCode = ref(null)
const creating = ref(false)
const joining = ref(false)
const inputCode = ref('')
const inputEncryptionKey = ref('')
const receivingEncrypted = ref(false)
const codeCopied = ref(false)
const keyCopied = ref(false)
const transferring = ref(false)
const transferProgress = ref({
  bytesTransferred: 0,
  totalBytes: 0,
  percentage: 0,
  speed: 0
})
const receivedFileInfo = ref(null)
const showComplete = ref(false)
const completionStats = ref({})

let p2pClient = null

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
    await p2pClient.createRoom(selectedFile.value, encryptionEnabled.value)
    
    p2pClient.onPeerJoined = () => {
      transferring.value = true
    }
    
    p2pClient.onProgress = (progress) => {
      transferProgress.value = progress
    }
    
    p2pClient.onComplete = (stats) => {
      completionStats.value = stats
      showComplete.value = true
      transferring.value = false
    }
    
    p2pClient.onError = (error) => {
      alert(error.message)
      reset()
    }
    
    setTimeout(async () => {
      roomCode.value = p2pClient.roomId
      if (encryptionEnabled.value) {
        encryptionKey.value = await p2pClient.getEncryptionKey()
      }
      creating.value = false
    }, 500)
    
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
    }
    
    p2pClient.onComplete = (stats) => {
      completionStats.value = stats
      showComplete.value = true
      transferring.value = false
    }
    
    p2pClient.onError = (error) => {
      alert(error.message)
      reset()
    }
    
    setTimeout(() => {
      receivedFileInfo.value = p2pClient.transferData.file
      transferring.value = true
      joining.value = false
    }, 500)
    
  } catch (error) {
    alert(error.message)
    joining.value = false
  }
}

const copyRoomCode = () => {
  navigator.clipboard.writeText(roomCode.value)
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
  
  mode.value = null
  selectedFile.value = null
  encryptionEnabled.value = true
  encryptionKey.value = null
  roomCode.value = null
  creating.value = false
  joining.value = false
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