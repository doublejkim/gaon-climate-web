<template>
  <div class="devices-page">
    <div class="page-header">
      <h2><i class="pi pi-tablet" /> 내 디바이스</h2>
      <div class="header-actions">
        <Button
          icon="pi pi-refresh"
          label="새로고침"
          outlined
          size="small"
          :loading="loading"
          @click="fetchDevices"
        />
        <Button
          icon="pi pi-plus"
          label="디바이스 등록"
          size="small"
          @click="registerDevice"
        />
      </div>
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

    <div v-if="loading && devices.length === 0" class="skeleton-grid">
      <Skeleton v-for="i in 3" :key="i" height="120px" border-radius="12px" />
    </div>

    <div v-else-if="devices.length === 0 && !loading" class="empty-state">
      <i class="pi pi-inbox" />
      <p>등록된 디바이스가 없습니다.</p>
    </div>

    <div v-else class="device-scroll">
      <div class="device-grid">
        <div
          v-for="device in devices"
          :key="device.id"
          class="device-card"
          @click="router.push(`/devices/${device.id}`)"
        >
          <div class="device-card-top">
            <i class="pi pi-microchip device-icon" />
            <Tag :value="device.status" :severity="statusSeverity(device.status)" />
          </div>
          <div class="device-name">{{ device.name }}</div>
          <div v-if="device.location_name" class="device-location">
            <i class="pi pi-map-marker" /> {{ device.location_name }}
          </div>
          <div class="device-date">등록일: {{ formatDate(device.created_at) }}</div>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="claimDialogVisible"
      modal
      header="디바이스 등록"
      :style="{ width: '24rem' }"
      :closable="false"
      @hide="onClaimDialogHide"
    >
      <div class="claim-body">
        <template v-if="claimLoading">
          <Skeleton height="2.5rem" border-radius="8px" />
        </template>

        <template v-else-if="claimError">
          <Message severity="error" :closable="false">{{ claimError }}</Message>
        </template>

        <template v-else-if="!isExpired">
          <p class="claim-guide">디바이스에 아래 코드를 입력해 주세요.</p>
          <div class="claim-code">{{ claimCode }}</div>
          <div class="claim-countdown">
            남은 시간 <span class="claim-timer">{{ formattedRemaining }}</span>
          </div>
        </template>

        <template v-else>
          <div class="claim-expired">
            <i class="pi pi-clock" />
            <p>코드만료</p>
          </div>
        </template>
      </div>

      <template #footer>
        <Button label="닫기" outlined @click="closeClaimDialog" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import { deviceApi, type UserDevice } from '@/api'

const router = useRouter()
const devices = ref<UserDevice[]>([])
const loading = ref(false)
const errorMessage = ref('')

// 디바이스 등록(클레임 코드) 다이얼로그 상태
const claimDialogVisible = ref(false)
const claimLoading = ref(false)
const claimError = ref('')
const claimCode = ref('')
const remaining = ref(0) // 남은 유효시간(초)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const isExpired = computed(() => remaining.value <= 0)

const formattedRemaining = computed(() => {
  const total = Math.max(0, remaining.value)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function stopCountdown() {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function startCountdown() {
  stopCountdown()
  countdownTimer = setInterval(() => {
    if (remaining.value > 0) {
      remaining.value -= 1
    }
    if (remaining.value <= 0) {
      // 만료되면 코드는 더 이상 노출하지 않고 카운트다운 정지
      stopCountdown()
      claimCode.value = ''
    }
  }, 1000)
}

async function fetchDevices() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await deviceApi.getDevices()
    devices.value = res.data
  } catch {
    errorMessage.value = '디바이스 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

// 디바이스 등록: 일회용 클레임 코드를 발급받아 다이얼로그에 표시하고 카운트다운 시작
async function registerDevice() {
  claimDialogVisible.value = true
  claimLoading.value = true
  claimError.value = ''
  claimCode.value = ''
  remaining.value = 0
  stopCountdown()
  try {
    const res = await deviceApi.issueClaimCode()
    claimCode.value = res.data.claim_code
    remaining.value = res.data.expires_in
    if (remaining.value > 0) {
      startCountdown()
    }
  } catch {
    claimError.value = '임시번호 발급에 실패했습니다.'
  } finally {
    claimLoading.value = false
  }
}

// 닫기 → 다이얼로그를 닫는다. 실제 정리/목록 갱신은 onClaimDialogHide 에서 수행.
function closeClaimDialog() {
  claimDialogVisible.value = false
}

// 다이얼로그가 닫힌 뒤: 타이머 정리 후 디바이스 목록을 다시 조회한다.
function onClaimDialogHide() {
  stopCountdown()
  claimCode.value = ''
  claimError.value = ''
  remaining.value = 0
  fetchDevices()
}

function statusSeverity(status: string) {
  if (status === 'ACTIVE') return 'success'
  if (status === 'INACTIVE') return 'secondary'
  return 'warn'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

onMounted(fetchDevices)
onUnmounted(stopCountdown)
</script>

<style scoped>
.devices-page {
  padding: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--p-text-color);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* 디바이스 목록은 영역 내에서 스크롤 */
.device-scroll {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
  padding-right: 0.25rem;
}

.skeleton-grid,
.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.device-card {
  background: var(--p-surface-card);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  border: 1px solid var(--p-surface-border);
  transition: box-shadow 0.2s, transform 0.15s;
}

.device-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.device-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.device-icon {
  font-size: 1.75rem;
  color: var(--p-primary-color);
}

.device-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin-bottom: 0.4rem;
}

.device-location {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.device-date {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  margin-top: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: var(--p-text-muted-color);
}

.empty-state i {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

/* 디바이스 등록(클레임 코드) 다이얼로그 */
.claim-body {
  text-align: center;
}

.claim-guide {
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
  margin: 0 0 1rem;
}

.claim-code {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 0.3rem;
  color: var(--p-primary-color);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  padding: 0.75rem 0;
}

.claim-countdown {
  margin-top: 0.75rem;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}

.claim-timer {
  font-weight: 700;
  color: var(--p-text-color);
  font-variant-numeric: tabular-nums;
}

.claim-expired {
  padding: 1.5rem 0;
  color: var(--p-text-muted-color);
}

.claim-expired i {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.claim-expired p {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: var(--p-text-color);
}
</style>
