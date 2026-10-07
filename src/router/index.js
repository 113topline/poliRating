import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase/config'

const routes = [
  // -- Public routes ----------------------------------------------------------
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/category/:slug',
    name: 'category',
    component: () => import('../views/CategoryView.vue'),
  },
  {
    path: '/review/:id',
    name: 'review',
    component: () => import('../views/ReviewView.vue'),
  },

  // -- Admin routes -----------------------------------------------------------
  {
    path: '/admin/login',
    name: 'login',
    component: () => import('../views/admin/LoginView.vue'),
  },
  {
    path: '/admin',
    name: 'dashboard',
    component: () => import('../views/admin/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/products',
    name: 'products',
    component: () => import('../views/admin/ProductsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/review/new',
    name: 'review-new',
    component: () => import('../views/admin/ReviewEditView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/review/:id/edit',
    name: 'review-edit',
    component: () => import('../views/admin/ReviewEditView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/settings',
    name: 'admin-settings',
    component: () => import('../views/admin/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  // Pass the same base Vite uses so sub-path deployments (e.g. /poliRating/)
  // don't produce 404s on page refresh or direct deep-link navigation.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Auth guard -- wait for Firebase to initialize before checking
let authResolved = false
let currentUser = null

auth.onAuthStateChanged(user => {
  currentUser = user
  authResolved = true
})

router.beforeEach(async (to) => {
  // Wait up to 2 s for Firebase to resolve the auth state
  if (!authResolved) {
    await new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(user => {
        currentUser = user
        authResolved = true
        unsub()
        resolve()
      })
    })
  }

  if (to.meta.requiresAuth && !currentUser) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && currentUser) {
    return { name: 'dashboard' }
  }
})

export default router
