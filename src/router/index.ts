import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/devices' },
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/sign-up',
      component: () => import('@/views/SignUpView.vue'),
    },
    {
      path: '/devices',
      component: () => import('@/views/DevicesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/devices/:id',
      component: () => import('@/views/DeviceDetailView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
})

export default router
