import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as fbLogin, logout as fbLogout, onAuthChange } from '../firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  // Subscribe to Firebase Auth state changes
  const unsubscribe = onAuthChange(u => {
    user.value = u
    loading.value = false
  })

  const isAuthenticated = computed(() => !!user.value)

  async function login(email, password) {
    await fbLogin(email, password)
  }

  async function logout() {
    await fbLogout()
  }

  return { user, loading, isAuthenticated, login, logout }
})
