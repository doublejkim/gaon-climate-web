import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const api = axios.create({ baseURL })

// 토큰 재발급 전용 인스턴스. api의 인터셉터를 타지 않아 401 무한 루프를 방지한다.
const refreshClient = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 수행하도록 공유 Promise 사용
let refreshing: Promise<string> | null = null

// refresh_token 자체가 만료/무효라 더 이상 세션을 살릴 수 없는 상황을 나타내는 에러
class SessionExpiredError extends Error {}

// refresh_token 으로 access/refresh 토큰을 재발급(회전)받아 저장하고 새 access_token 반환.
// refresh_token이 없거나 만료(401/403)면 SessionExpiredError를 던진다.
async function reissueTokens(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) throw new SessionExpiredError('no refresh token')

  try {
    const res = await refreshClient.post('/users/refresh', { refresh_token: refreshToken })
    // refreshClient는 언래핑 인터셉터가 없으므로 { code, message, data } 직접 처리
    const body = (res.data?.data ?? res.data) as { access_token: string; refresh_token: string }
    localStorage.setItem('access_token', body.access_token)
    localStorage.setItem('refresh_token', body.refresh_token)
    return body.access_token
  } catch (e) {
    const status = (e as AxiosError).response?.status
    if (status === 401 || status === 403) {
      // 리프레시 토큰까지 만료됨 → 세션 종료 신호
      throw new SessionExpiredError('refresh token expired')
    }
    // 네트워크 등 일시적 오류는 토큰을 유지한 채 그대로 전파
    throw e
  }
}

// 가지고 있던 토큰을 모두 삭제하고 로그인 화면으로 이동
function clearSessionAndRedirect() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

// 서버 응답이 { code, message, data } 로 감싸여 있으므로 data 필드만 꺼냄
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  // 401: refresh_token 으로 access_token 재발급 후 원요청을 1회 재시도
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true
    try {
      refreshing = refreshing ?? reissueTokens()
      const newToken = await refreshing
      refreshing = null
      original.headers = AxiosHeaders.from(original.headers)
      original.headers.set('Authorization', `Bearer ${newToken}`)
      return api(original)
    } catch (e) {
      refreshing = null
      // 리프레시 토큰까지 만료된 경우에만 세션을 비우고 로그인 화면으로 보낸다.
      if (e instanceof SessionExpiredError) {
        clearSessionAndRedirect()
      }
      return Promise.reject(e)
    }
  },
)

export interface SignUpRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
}

export interface UserDevice {
  id: number
  name: string
  location_name: string | null
  status: string
  created_at: string
}

export interface DeviceMeasurement {
  device_id: number
  temperature: number
  humidity: number | null
  measured_at: string
}

export const authApi = {
  signUp: (data: SignUpRequest) => api.post('/users/sign-up', data),
  login: (data: LoginRequest) => api.post<LoginResponse>('/users/login', data),
}

export const deviceApi = {
  getDevices: () => api.get<UserDevice[]>('/users/me/devices'),
  getLatestMeasurement: (deviceId: number) =>
    api.get<DeviceMeasurement>(`/users/me/devices/${deviceId}/latest-measurement`),
}
