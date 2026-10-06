// Shared theme composable — keeps a single reactive `theme` ref so AppHeader
// and AppFooter always stay in sync without prop-drilling or a heavy store.
import { ref } from 'vue'

const theme = ref('dark')   // module-level singleton

let initialised = false

export function useTheme() {
  // Only read localStorage / matchMedia once across all consumers.
  if (!initialised) {
    initialised = true
    const saved = localStorage.getItem('polirating-theme')
    if (saved) {
      theme.value = saved
    } else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      theme.value = 'light'
    }
    apply(theme.value)
  }

  function apply(t) {
    document.documentElement.setAttribute('data-theme', t)
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('polirating-theme', theme.value)
    apply(theme.value)
  }

  return { theme, toggleTheme }
}
