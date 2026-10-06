<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReviewsStore } from '../../stores/reviews'

const store = useReviewsStore()

// -- Hero image ---------------------------------------------------------------
const heroFile = ref(null)
const heroPreview = ref('')
const heroInput = ref(null)
const saving = ref(false)
const saveMsg = ref('')

const currentHeroUrl = computed(() => store.siteSettings.heroImage || '')

onMounted(() => store.fetchSiteSettings())

function onHeroPick(e) {
  const file = e.target.files[0]
  if (!file) return
  heroFile.value = file
  heroPreview.value = URL.createObjectURL(file)
}

function clearHeroPick() {
  heroFile.value = null
  heroPreview.value = ''
  if (heroInput.value) heroInput.value.value = ''
}

function triggerPick() {
  heroInput.value?.click()
}

async function saveHero() {
  saving.value = true
  saveMsg.value = ''
  try {
    await store.saveSiteSettings({}, heroFile.value || null)
    saveMsg.value = 'Imagem de capa salva!'
    clearHeroPick()
  } catch (e) {
    saveMsg.value = 'Erro ao salvar: ' + e.message
  } finally {
    saving.value = false
    setTimeout(() => (saveMsg.value = ''), 3500)
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="font-title">Configurações do Site</h1>
      <router-link to="/admin" class="back-link font-body">← Voltar ao painel</router-link>
    </div>

    <!-- Hero Image Section -->
    <section class="settings-section">
      <h2 class="section-heading font-title">Imagem de Capa</h2>
      <p class="section-desc font-body">
        Essa imagem aparece como fundo do banner principal na página inicial.
      </p>

      <!-- Current / Preview -->
      <div class="hero-preview-wrap">
        <div class="hero-preview-box">
          <img
            v-if="heroPreview || currentHeroUrl"
            :src="heroPreview || currentHeroUrl"
            alt="Imagem de capa"
            class="hero-preview-img"
          />
          <div v-else class="hero-preview-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span class="font-body">Nenhuma imagem configurada</span>
          </div>
          <div v-if="heroPreview" class="hero-preview-badge font-body">Pré-visualização</div>
        </div>
      </div>

      <!-- File picker -->
      <div class="file-row">
        <input
          ref="heroInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="hidden-input"
          @change="onHeroPick"
        />
        <button @click="triggerPick" class="btn-outline font-body">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {{ heroFile ? 'Trocar imagem' : 'Escolher imagem' }}
        </button>
        <span v-if="heroFile" class="file-name font-body">{{ heroFile.name }}</span>
        <button v-if="heroFile" @click="clearHeroPick" class="btn-ghost font-body">Cancelar</button>
      </div>

      <div class="action-row">
        <button
          @click="saveHero"
          :disabled="saving || (!heroFile && !currentHeroUrl)"
          class="btn-primary font-title"
        >
          {{ saving ? 'Salvando…' : 'Salvar imagem de capa' }}
        </button>
        <span :class="['save-msg font-body', saveMsg.includes('Erro') ? 'error' : 'success']" v-if="saveMsg">
          {{ saveMsg }}
        </span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 780px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
}

.page-header h1 {
  margin: 0;
  color: var(--text-main);
  font-size: 2rem;
}

.back-link {
  font-size: 0.9rem;
  color: var(--text-muted);
  transition: color 0.15s;
}
.back-link:hover { color: var(--text-main); }

/* Sections */
.settings-section {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 2rem;
  background: var(--bg-surface);
  margin-bottom: 2rem;
}

.section-heading {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
  color: var(--text-main);
}

.section-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0 0 1.5rem;
}

/* Hero preview */
.hero-preview-wrap {
  margin-bottom: 1.25rem;
}

.hero-preview-box {
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-site);
}

.hero-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-preview-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--text-subtle);
  font-size: 0.9rem;
}

.hero-preview-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

/* File controls */
.hidden-input {
  display: none;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.file-name {
  font-size: 0.85rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Buttons */
.btn-primary {
  padding: 0.6rem 1.4rem;
  background: var(--text-main);
  color: var(--bg-site);
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-primary:hover:not(:disabled) { opacity: 0.82; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-site);
  color: var(--text-main);
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.btn-outline:hover {
  background: var(--bg-surface-hover);
  border-color: var(--text-muted);
}

.btn-ghost {
  padding: 0.45rem 0.85rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.15s;
}
.btn-ghost:hover { color: var(--accent-red); }

/* Feedback */
.save-msg {
  font-size: 0.88rem;
  font-weight: 500;
}
.save-msg.success { color: var(--accent-green); }
.save-msg.error   { color: var(--accent-red); }
</style>
