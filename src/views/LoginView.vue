<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <i class="pi pi-cloud login-icon" />
        <h1>Gaon Climate</h1>
        <p>로그인하여 디바이스를 관리하세요</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="email">이메일</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="이메일 입력"
            :invalid="!!errorMessage"
            fluid
          />
        </div>

        <div class="field">
          <label for="password">비밀번호</label>
          <Password
            id="password"
            v-model="password"
            placeholder="비밀번호 입력"
            :feedback="false"
            :invalid="!!errorMessage"
            toggleMask
            fluid
          />
        </div>

        <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

        <Button
          type="submit"
          label="로그인"
          :loading="loading"
          fluid
          class="mt-2"
        />
      </form>

      <div class="signup-link">
        계정이 없으신가요?
        <RouterLink to="/sign-up">회원가입</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { isAxiosError } from 'axios'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    const res = await authApi.login({ email: email.value, password: password.value })
    auth.setTokens(res.data.access_token, res.data.refresh_token)
    router.replace('/devices')
  } catch (e) {
    // 403 + ACCOUNT_PENDING 인 경우 서버가 내려준 message 를 그대로 노출한다.
    // (에러 응답은 인터셉터의 언래핑을 타지 않아 { code, message, data } 형태 유지)
    const body = isAxiosError(e) ? (e.response?.data as { code?: string; message?: string }) : undefined
    if (isAxiosError(e) && e.response?.status === 403 && body?.code === 'ACCOUNT_PENDING') {
      errorMessage.value = body?.message ?? '계정 승인 대기 중입니다.'
    } else {
      errorMessage.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-surface-ground);
}

.login-card {
  background: var(--p-surface-card);
  border-radius: 12px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-icon {
  font-size: 2.5rem;
  color: var(--p-primary-color);
}

.login-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0.5rem 0 0.25rem;
  color: var(--p-text-color);
}

.login-header p {
  color: var(--p-text-muted-color);
  margin: 0;
}

.field {
  margin-bottom: 1.25rem;
}

.field label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: var(--p-text-color);
}

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}

.signup-link a {
  color: var(--p-primary-color);
  text-decoration: none;
  font-weight: 500;
}
</style>
