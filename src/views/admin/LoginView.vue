<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = route.query.redirect || '/admin'
    router.push(redirect)
  } catch (e) {
    error.value = 'Email ou senha incorretos.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-form" @submit.prevent="submit">
      <h1 class="login-title font-title">poliRating Admin</h1>

      <div class="field">
        <label class="font-title">Email</label>
        <input v-model="email" type="email" required autocomplete="username" class="font-body" />
      </div>
      <div class="field">
        <label class="font-title">Senha</label>
        <input v-model="password" type="password" required autocomplete="current-password" class="font-body" />
      </div>

      <p v-if="error" class="error-msg font-body">{{ error }}</p>

      <button type="submit" :disabled="loading" class="login-btn font-title">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-site);
  padding: 1.5rem;
}

.login-form {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.login-title {
  margin: 0 0 0.5rem;
  font-size: 1.6rem;
  text-align: center;
  color: var(--text-main);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}

.field input {
  padding: 0.7rem 0.85rem;
  background: var(--bg-site);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 0.95rem;
  transition: border-color 0.15s;
}

.field input:focus {
  outline: none;
  border-color: var(--text-main);
}

.error-msg {
  color: var(--accent-red);
  font-size: 0.88rem;
  margin: 0;
  text-align: center;
}

.login-btn {
  padding: 0.75rem;
  background: var(--text-main);
  color: var(--bg-site);
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
