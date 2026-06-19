<template>
  <div class="devices-page">
    <div class="page-header">
      <h2><i class="pi pi-tablet" /> 내 디바이스</h2>
      <Button
        icon="pi pi-refresh"
        label="새로고침"
        outlined
        size="small"
        :loading="loading"
        @click="fetchDevices"
      />
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

    <div v-if="loading && devices.length === 0" class="skeleton-grid">
      <Skeleton v-for="i in 3" :key="i" height="120px" border-radius="12px" />
    </div>

    <div v-else-if="devices.length === 0 && !loading" class="empty-state">
      <i class="pi pi-inbox" />
      <p>등록된 디바이스가 없습니다.</p>
    </div>

    <div v-else class="device-grid">
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import { deviceApi, type UserDevice } from '@/api'

const router = useRouter()
const devices = ref<UserDevice[]>([])
const loading = ref(false)
const errorMessage = ref('')

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

function statusSeverity(status: string) {
  if (status === 'ACTIVE') return 'success'
  if (status === 'INACTIVE') return 'secondary'
  return 'warn'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

onMounted(fetchDevices)
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
</style>
