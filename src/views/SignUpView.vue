<template>
  <div class="signup-wrapper">
    <div class="signup-card">
      <div class="signup-header">
        <i class="pi pi-cloud signup-icon" />
        <h1>회원가입</h1>
        <p>Gaon Climate에 오신 것을 환영합니다</p>
      </div>

      <form @submit.prevent="handleSignUp">
        <div class="field">
          <label for="email">이메일</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="이메일 입력"
            fluid
          />
        </div>

        <div class="field">
          <label for="password">비밀번호</label>
          <Password
            id="password"
            v-model="password"
            placeholder="비밀번호 입력"
            :invalid="!!passwordMismatch"
            toggleMask
            fluid
          />
        </div>

        <div class="field">
          <label for="confirmPassword">비밀번호 확인</label>
          <Password
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="비밀번호 재입력"
            :feedback="false"
            :invalid="!!passwordMismatch"
            toggleMask
            fluid
          />
          <small v-if="passwordMismatch" class="error-hint">
            <i class="pi pi-exclamation-circle" /> 비밀번호가 일치하지 않습니다.
          </small>
        </div>

        <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
        <Message v-if="successMessage" severity="success" :closable="false">{{ successMessage }}</Message>

        <Button
          type="submit"
          label="회원가입"
          :loading="loading"
          :disabled="!!successMessage"
          fluid
          class="mt-2"
        />
      </form>

      <div class="login-link">
        이미 계정이 있으신가요?
        <RouterLink to="/login">로그인</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { authApi } from '@/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const passwordMismatch = computed(() =>
  confirmPassword.value && password.value !== confirmPassword.value
)

async function handleSignUp() {
  if (passwordMismatch.value) return
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  try {
    await authApi.signUp({ email: email.value, password: password.value })
    successMessage.value = '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다...'
    setTimeout(() => router.replace('/login'), 1500)
  } catch {
    errorMessage.value = '회원가입에 실패했습니다. 다시 시도해주세요.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.signup-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-surface-ground);
}

.signup-card {
  background: var(--p-surface-card);
  border-radius: 12px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.signup-header {
  text-align: center;
  margin-bottom: 2rem;
}

.signup-icon {
  font-size: 2.5rem;
  color: var(--p-primary-color);
}

.signup-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0.5rem 0 0.25rem;
  color: var(--p-text-color);
}

.signup-header p {
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

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}

.login-link a {
  color: var(--p-primary-color);
  text-decoration: none;
  font-weight: 500;
}

.error-hint {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--p-red-500);
  font-size: 0.825rem;
  margin-top: 0.35rem;
}
</style>
