import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'

// 폰트 self-host (각 css에 font-display: swap 포함). 앱에서 쓰는 weight만 로드.
// Inter엔 한글 글리프가 없어 한글은 Noto Sans KR로 폴백 → 모든 브라우저에서 동일하게 렌더링.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/noto-sans-kr/400.css'
import '@fontsource/noto-sans-kr/500.css'
import '@fontsource/noto-sans-kr/600.css'
import '@fontsource/noto-sans-kr/700.css'

// 위 @font-face들을 실제로 body에 적용하는 전역 스타일 (반드시 로드되어야 함)
import './assets/global.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode',
    },
  },
})
app.use(ToastService)

app.mount('#app')
