<script setup>
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import IconList from '../../components/icons/IconList.vue'
import IconPlus from '../../components/icons/IconPlus.vue'
import IconLogOut from '../../components/icons/IconLogOut.vue'
import IconSettings from '../../components/icons/IconSettings.vue'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1 class="font-title">Painel Admin</h1>
      <button @click="handleLogout" class="logout-btn font-title">
        <IconLogOut />
        <span>Sair</span>
      </button>
    </div>

    <div class="dashboard-cards">
      <router-link to="/admin/products" class="dash-card">
        <div class="dash-icon"><IconList /></div>
        <span class="font-title">Produtos / Reviews</span>
      </router-link>
      <router-link to="/admin/review/new" class="dash-card">
        <div class="dash-icon"><IconPlus /></div>
        <span class="font-title">Novo Review</span>
      </router-link>
      <router-link to="/admin/settings" class="dash-card">
        <div class="dash-icon"><IconSettings /></div>
        <span class="font-title">Configurações</span>
      </router-link>
    </div>

    <p class="admin-user font-body">Conectado como: <strong>{{ auth.user?.email }}</strong></p>
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
}

.admin-header h1 {
  margin: 0;
  color: var(--text-main);
  font-size: 2rem;
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-main);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  transition: background 0.15s, border-color 0.15s;
}

.logout-btn:hover {
  background: var(--bg-surface-hover);
  border-color: var(--text-muted);
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.dash-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem 2rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  text-decoration: none;
  color: var(--text-main);
  font-weight: 600;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease, background 0.25s ease;
  background: var(--bg-surface);
}

.dash-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--text-muted);
}

.dash-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-site);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
}

.admin-user {
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
