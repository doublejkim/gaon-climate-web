<template>
  <div class="detail-page">
    <div class="page-header">
      <Button icon="pi pi-arrow-left" text @click="router.push('/devices')" />
      <h2>디바이스 상세</h2>
      <Button
        icon="pi pi-refresh"
        label="새로고침"
        outlined
        size="small"
        :loading="loading"
        @click="fetchMeasurement"
      />
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

    <div v-if="loading && !measurement" class="skeleton-wrapper">
      <Skeleton height="220px" border-radius="12px" />
    </div>

    <div v-else-if="measurement" class="measurement-section">
      <div class="measurement-grid">
        <div class="metric-card temperature">
          <div class="metric-label"><i class="pi pi-sun" /> 온도</div>
          <div class="metric-value">{{ measurement.temperature.toFixed(1) }}<span class="unit">°C</span></div>
          <div class="metric-time">측정: {{ formatDateTime(measurement.measured_at) }}</div>
        </div>

        <div class="metric-card humidity">
          <div class="metric-label"><i class="pi pi-droplet" /> 습도</div>
          <div v-if="measurement.humidity !== null" class="metric-value">
            {{ Number(measurement.humidity).toFixed(1) }}<span class="unit">%</span>
          </div>
          <div v-else class="metric-value no-data">—</div>
          <div class="metric-time">측정: {{ formatDateTime(measurement.measured_at) }}</div>
        </div>
      </div>

      <div class="chart-card">
        <h3>측정 현황</h3>
        <Chart type="bar" :data="chartData" :options="chartOptions" style="height: 260px" />
      </div>
    </div>

    <div v-else-if="!loading" class="empty-state">
      <i class="pi pi-inbox" />
      <p>측정 데이터가 없습니다.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Chart from 'primevue/chart'
import { deviceApi, type DeviceMeasurement } from '@/api'

const route = useRoute()
const router = useRouter()

const deviceId = Number(route.params.id)
const measurement = ref<DeviceMeasurement | null>(null)
const loading = ref(false)
const errorMessage = ref('')

const chartData = computed(() => ({
  labels: ['온도 (°C)', '습도 (%)'],
  datasets: [
    {
      label: '최신 측정값',
      data: [
        measurement.value?.temperature ?? 0,
        measurement.value?.humidity ?? 0,
      ],
      backgroundColor: ['rgba(99, 102, 241, 0.7)', 'rgba(34, 197, 94, 0.7)'],
      borderColor: ['rgba(99, 102, 241, 1)', 'rgba(34, 197, 94, 1)'],
      borderWidth: 2,
      borderRadius: 6,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { beginAtZero: true },
  },
}

async function fetchMeasurement() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await deviceApi.getLatestMeasurement(deviceId)
    measurement.value = res.data
  } catch {
    errorMessage.value = '측정 데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR')
}

onMounted(fetchMeasurement)
</script>

<style scoped>
.detail-page {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.page-header h2 {
  flex: 1;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--p-text-color);
  margin: 0;
}

.skeleton-wrapper {
  margin-top: 1rem;
}

.measurement-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.metric-card {
  background: var(--p-surface-card);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  border: 1px solid var(--p-surface-border);
  text-align: center;
}

.metric-card.temperature {
  border-top: 4px solid rgba(99, 102, 241, 0.8);
}

.metric-card.humidity {
  border-top: 4px solid rgba(34, 197, 94, 0.8);
}

.metric-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.metric-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--p-text-color);
  line-height: 1;
}

.metric-value.no-data {
  color: var(--p-text-muted-color);
}

.unit {
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--p-text-muted-color);
  margin-left: 0.25rem;
}

.metric-time {
  font-size: 0.78rem;
  color: var(--p-text-muted-color);
  margin-top: 0.75rem;
}

.chart-card {
  background: var(--p-surface-card);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--p-surface-border);
}

.chart-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin: 0 0 1rem;
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

@media (max-width: 600px) {
  .measurement-grid {
    grid-template-columns: 1fr;
  }
}
</style>
