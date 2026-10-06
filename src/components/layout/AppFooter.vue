<script setup>
import { useTheme } from '../../composables/useTheme'
import IconSun from '../icons/IconSun.vue'
import IconMoon from '../icons/IconMoon.vue'

const year = new Date().getFullYear()
const { theme, toggleTheme } = useTheme()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <p>© {{ year }} <span class="brand font-title">poliRating</span> · Reviews caseiros de periféricos</p>

      <div class="footer-right">
        <!-- Theme toggle — shown on mobile (hidden on desktop where the header has it) -->
        <button
          class="theme-toggle mobile-only"
          @click="toggleTheme"
          :title="theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'"
        >
          <IconSun v-if="theme === 'dark'" />
          <IconMoon v-else />
          <span class="theme-label">{{ theme === 'dark' ? 'Modo Claro' : 'Modo Escuro' }}</span>
        </button>

        <router-link to="/admin" class="admin-link">Admin</router-link>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--bg-surface);
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.85rem;
  padding: 1.25rem 1.25rem;
  margin-top: auto;
  transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-inner p {
  margin: 0;
}

.brand {
  font-weight: 700;
  color: var(--text-main);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Theme toggle in footer — mobile only */
.theme-toggle {
  display: none;
  align-items: center;
  gap: 0.4rem;
  background: var(--bg-surface-hover);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.4rem 0.75rem;
  border-radius: 99px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.8rem;
  transition: background 0.15s, border-color 0.15s;
}

.theme-toggle:hover {
  border-color: var(--text-muted);
}

.theme-label {
  font-weight: 500;
}

.admin-link {
  color: var(--text-subtle);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.admin-link:hover {
  color: var(--text-main);
}

/* Show theme toggle only on mobile */
@media (max-width: 640px) {
  .theme-toggle.mobile-only {
    display: flex;
  }
}
</style>
