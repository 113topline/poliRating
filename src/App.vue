<script setup>
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// Don't show the main header/footer on the login page (full-screen layout)
const isLoginPage = computed(() => route.name === 'login')
</script>

<template>
  <div id="app-root">
    <AppHeader v-if="!isLoginPage" />
    <main>
      <RouterView />
    </main>
    <AppFooter v-if="!isLoginPage" />
  </div>
</template>

<style>
/* App Root Layout */
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-site);
  color: var(--text-main);
}

main {
  flex: 1;
  padding-top: 56px; /* matches .header-inner height — keeps content below the fixed header */
}

button, input, select, textarea {
  font-family: inherit;
  color: inherit;
}

img {
  max-width: 100%;
  height: auto;
}
</style>
