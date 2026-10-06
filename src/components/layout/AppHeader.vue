<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { CATEGORIES } from '../../constants/categories'
import { useTheme } from '../../composables/useTheme'
import IconChevronDown from '../icons/IconChevronDown.vue'
import IconSun from '../icons/IconSun.vue'
import IconMoon from '../icons/IconMoon.vue'

const router = useRouter()
const { theme, toggleTheme } = useTheme()

const openDropdown = ref(null)   // desktop dropdown slug
const openDrawerCat = ref(null)  // mobile accordion slug (separate from desktop)
const menuOpen = ref(false)

// ── Desktop dropdown ──────────────────────────────────────────────────────────
function toggleDropdown(slug) {
  openDropdown.value = openDropdown.value === slug ? null : slug
}

function goToCategory(slug) {
  openDropdown.value = null
  openDrawerCat.value = null
  menuOpen.value = false
  router.push({ name: 'category', params: { slug } })
}

function closeDesktopDropdowns() {
  openDropdown.value = null
}

// ── Mobile drawer accordion ───────────────────────────────────────────────────
function toggleDrawerCat(slug) {
  // Collapse any other open category; collapse self if already open.
  openDrawerCat.value = openDrawerCat.value === slug ? null : slug
}

// ── Mobile drawer open/close ──────────────────────────────────────────────────
function toggleMenu() {
  menuOpen.value = !menuOpen.value
  openDrawerCat.value = null
}

function closeMenu() {
  menuOpen.value = false
  openDrawerCat.value = null
}

router.afterEach(() => closeMenu())

function onKeydown(e) {
  if (e.key === 'Escape') closeMenu()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <!-- Brand -->
      <router-link to="/" class="site-name" @click="closeMenu">poliRating</router-link>

      <!-- Desktop category nav -->
      <nav class="category-nav desktop-only" v-click-outside="closeDesktopDropdowns">
        <div v-for="cat in CATEGORIES" :key="cat.slug" class="nav-item">
          <button
            type="button"
            class="nav-btn"
            :class="{ active: openDropdown === cat.slug }"
            @click="toggleDropdown(cat.slug)"
          >
            <span>{{ cat.label }}</span>
            <IconChevronDown class="caret" />
          </button>

          <Transition name="dropdown">
          <div v-if="openDropdown === cat.slug" class="dropdown">
            <button type="button" class="dropdown-item" @click="goToCategory(cat.slug)">Reviews</button>
            <button type="button" class="dropdown-item disabled" disabled>
              Comparar <span class="soon">(em breve)</span>
            </button>
          </div>
          </Transition>
        </div>
      </nav>

      <!-- Desktop theme toggle -->
      <div class="header-actions desktop-only">
        <button
          type="button"
          class="theme-toggle"
          @click="toggleTheme"
          :title="theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'"
        >
          <IconSun v-if="theme === 'dark'" />
          <IconMoon v-else />
        </button>
      </div>

      <!-- Mobile hamburger -->
      <button
        type="button"
        class="hamburger mobile-only"
        :class="{ open: menuOpen }"
        @click="toggleMenu"
        :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'"
        :aria-expanded="menuOpen"
      >
        <span /><span /><span />
      </button>
    </div>

    <!-- Mobile drawer — @click.stop keeps clicks inside from reaching the
         document-level click-outside listener on .category-nav              -->
    <Transition name="drawer">
      <nav
        v-if="menuOpen"
        class="mobile-drawer mobile-only"
        aria-label="Categorias"
        @click.stop
      >
        <template v-for="cat in CATEGORIES" :key="cat.slug">
          <button
            type="button"
            class="drawer-cat-btn"
            :class="{ open: openDrawerCat === cat.slug }"
            @click="toggleDrawerCat(cat.slug)"
          >
            <span>{{ cat.label }}</span>
            <IconChevronDown class="drawer-caret" :class="{ rotated: openDrawerCat === cat.slug }" />
          </button>

          <Transition name="accordion">
            <div v-if="openDrawerCat === cat.slug" class="drawer-sub">
              <button type="button" class="drawer-sub-item" @click="goToCategory(cat.slug)">Reviews</button>
              <button type="button" class="drawer-sub-item disabled" disabled>
                Comparar <span class="soon">(em breve)</span>
              </button>
            </div>
          </Transition>
        </template>
      </nav>
    </Transition>

    <!-- Tap-outside backdrop -->
    <Transition name="fade">
      <div v-if="menuOpen" class="drawer-backdrop mobile-only" @click="closeMenu" />
    </Transition>
  </header>
</template>

<script>
export default {
  directives: {
    clickOutside: {
      mounted(el, binding) {
        el.__clickOutsideHandler__ = (e) => {
          if (!el.contains(e.target)) binding.value()
        }
        document.addEventListener('click', el.__clickOutsideHandler__)
      },
      unmounted(el) {
        document.removeEventListener('click', el.__clickOutsideHandler__)
      },
    },
  },
}
</script>

<style scoped>
/* ── Always-visible bar ──────────────────────────────────────────────────────── */
.site-header {
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
  background: var(--bg-header);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: border-color 0.25s ease, background-color 0.25s ease;
  /* overflow must stay visible so the desktop dropdown can paint below the bar */
  overflow: visible;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* ── Brand ──────────────────────────────────────────────────────────────────── */
.site-name {
  font-family: var(--font-title);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-main);
  text-decoration: none;
  letter-spacing: -0.03em;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* ── Desktop nav ────────────────────────────────────────────────────────────── */
.category-nav {
  display: flex;
  gap: 0.2rem;
  align-items: center;
  flex: 1;
  overflow: visible;
}

.nav-item {
  position: relative;
}

.nav-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-family: var(--font-title);
  font-size: 0.88rem;
  font-weight: 500;
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
  transition: background 0.25s, color 0.25s;
}

.nav-btn:hover,
.nav-btn.active {
  background: var(--bg-surface-hover);
  color: var(--text-main);
}

.caret {
  opacity: 0.7;
  transition: transform 0.25s;
}

.nav-btn.active .caret {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  min-width: 160px;
  overflow: hidden;
  z-index: 200;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.65rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-family: var(--font-body);
  font-size: 0.88rem;
  color: var(--text-main);
  cursor: pointer;
  transition: background 0.25s;
}

.dropdown-item:hover:not(:disabled) {
  background: var(--bg-surface-hover);
}

.dropdown-item.disabled,
.dropdown-item:disabled {
  color: var(--text-subtle);
  cursor: default;
}

.soon {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* ── Desktop theme toggle ───────────────────────────────────────────────────── */
.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.theme-toggle {
  background: var(--bg-surface-hover);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
}

.theme-toggle:hover {
  transform: scale(1.05);
}

/* ── Hamburger ──────────────────────────────────────────────────────────────── */
.hamburger {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  transition: background 0.15s;
}

.hamburger:hover {
  background: var(--bg-surface-hover);
}

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text-main);
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.2s ease;
  transform-origin: center;
}

.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── Mobile drawer ──────────────────────────────────────────────────────────── */
.mobile-drawer {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  z-index: 99;
  overflow-y: auto;
  max-height: calc(100svh - 56px);
  padding-bottom: 0.75rem;
}

.drawer-cat-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  border-top: 1px solid var(--border-color);
  padding: 0.9rem 1.25rem;
  font-family: var(--font-title);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: background 0.25s;
}

.drawer-cat-btn:first-child {
  border-top: none;
}

.drawer-cat-btn:hover,
.drawer-cat-btn.open {
  background: var(--bg-surface-hover);
}

.drawer-caret {
  opacity: 0.6;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.drawer-caret.rotated {
  transform: rotate(180deg);
}

.drawer-sub {
  background: var(--bg-site);
  overflow: hidden;
}

.drawer-sub-item {
  display: block;
  width: 100%;
  padding: 0.7rem 2.25rem;
  background: none;
  border: none;
  text-align: left;
  font-family: var(--font-body);
  font-size: 0.92rem;
  color: var(--text-main);
  cursor: pointer;
  transition: background 0.25s;
}

.drawer-sub-item:hover:not(:disabled) {
  background: var(--bg-surface-hover);
}

.drawer-sub-item.disabled,
.drawer-sub-item:disabled {
  color: var(--text-subtle);
  cursor: default;
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  top: 56px;
  background: rgba(0, 0, 0, 0.45);
  z-index: 98;
}

/* ── Visibility helpers ─────────────────────────────────────────────────────── */
.desktop-only { display: flex; }
.mobile-only  { display: none; }

@media (max-width: 640px) {
  .desktop-only { display: none !important; }
  .mobile-only  { display: flex; }
  .mobile-drawer   { display: block; }
  .drawer-backdrop { display: block; }
}

/* ── Drawer slide-down transition ───────────────────────────────────────────── */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}

/* ── Accordion expand transition (same easing as the slide-down) ────────────── */
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              opacity    0.25s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 200px;  /* generous upper bound; must be >= tallest sub-menu */
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── Backdrop fade ──────────────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }

/* ── Desktop dropdown slide-down (mirrors the mobile drawer) ────────────────── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  transform: translateY(-6px);
  opacity: 0;
}
</style>
