import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 서버 응답이 { code, message, data } 로 감싸여 있으므로 data 필드만 꺼냄
api.interceptors.response.use((response) => {
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    response.data = response.data.data
  }
  return response
})

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
