<template>
  <Toast />
  <template v-if="auth.isAuthenticated && !isAuthPage">
    <div class="app-layout">
      <header class="app-header">
        <div class="header-left">
          <i class="pi pi-cloud" />
          <span class="app-title">Gaon Climate</span>
        </div>
        <Button
          icon="pi pi-sign-out"
          label="로그아웃"
          text
          size="small"
          @click="handleLogout"
        />
      </header>
      <main class="app-main">
        <RouterView />
      </main>
    </div>
  </template>
  <template v-else>
    <RouterView />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isAuthPage = computed(() => route.path === '/login' || route.path === '/sign-up')

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--p-surface-ground);
}

.app-header {
  background: var(--p-surface-card);
  border-bottom: 1px solid var(--p-surface-border);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.header-left .pi {
  font-size: 1.4rem;
  color: var(--p-primary-color);
}

.app-main {
  flex: 1;
}
</style>
