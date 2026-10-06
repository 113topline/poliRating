<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReviewsStore } from '../../stores/reviews'
import { useAuthStore } from '../../stores/auth'
import { uploadImage } from '../../firebase/firestore'
import { CATEGORIES } from '../../constants/categories'
import ContentBlock from '../../components/admin/ContentBlock.vue'
import SpecsEditor from '../../components/admin/SpecsEditor.vue'

const route = useRoute()
const router = useRouter()
const store = useReviewsStore()
const auth = useAuthStore()

const isEditing = computed(() => !!route.params.id)

// ── Form state ─────────────────────────────────────────────────────────────
const title = ref('')
const category = ref('')
const tags = ref('')          // comma-separated string → stored as array
const author = ref(auth.user?.email ?? '')
const published = ref(false)

// Hero image
const heroImageFile = ref(null)
const heroImagePreview = ref('')
const heroImageExisting = ref('')  // URL from Firestore when editing

// Content blocks: array of { id, type, content?, url?, caption?, file?, previewUrl? }
const blocks = ref([])

function createBlockId() {
  return 'b_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
}

// Specs: plain object { [key]: value }
const specs = ref({})

// Quando o usuário altera a categoria manualmente, limpa as specs da categoria
// anterior para não poluir o Firestore com chaves obsoletas.
watch(category, (newCat, oldCat) => {
  if (oldCat && newCat !== oldCat) {
    specs.value = {}
  }
})

const saving = ref(false)
const error = ref('')

// ── Load for editing ────────────────────────────────────────────────────────
onMounted(async () => {
  if (isEditing.value) {
    await store.fetchReview(route.params.id)
    const r = store.currentReview
    if (!r) { error.value = 'Review não encontrado.'; return }

    title.value = r.title ?? ''
    category.value = r.category ?? ''
    tags.value = (r.tags ?? []).join(', ')
    author.value = r.author ?? ''
    published.value = r.published ?? false
    heroImageExisting.value = r.heroImage ?? ''
    heroImagePreview.value = r.heroImage ?? ''
    blocks.value = (r.blocks ?? []).map(b => {
      const base = { id: b.id || createBlockId(), ...b }
      // Retrocompatibilidade: bloco antigo com { url, caption } → novo { images: [] }
      if (base.type === 'image' && !Array.isArray(base.images)) {
        base.images = base.url ? [{ url: base.url }] : []
        base.caption = base.caption ?? ''
        delete base.url
      }
      if (base.type === 'image') {
        base.caption = base.caption ?? base.images.find(img => img.caption)?.caption ?? ''
      }
      return base
    })
    specs.value = { ...(r.specs ?? {}) }
  }
})

// ── Hero image ───────────────────────────────────────────────────────────────
function handleHeroUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  heroImageFile.value = file
  heroImagePreview.value = URL.createObjectURL(file)
}

// ── Blocks ──────────────────────────────────────────────────────────────────
function addBlock(type) {
  if (type === 'paragraph') blocks.value.push({ id: createBlockId(), type: 'paragraph', content: '' })
  else if (type === 'heading') blocks.value.push({ id: createBlockId(), type: 'heading', content: '' })
  // Carrossel: images é um array de slots { url, caption, file, previewUrl }
  else if (type === 'image')   blocks.value.push({ id: createBlockId(), type: 'image', caption: '', images: [] })
}

function updateBlock(index, updated) {
  blocks.value[index] = updated
}

function moveUp(index) {
  if (index === 0) return
  const arr = [...blocks.value]
  ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
  blocks.value = arr
}

function moveDown(index) {
  if (index === blocks.value.length - 1) return
  const arr = [...blocks.value]
  ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
  blocks.value = arr
}

function removeBlock(index) {
  blocks.value.splice(index, 1)
}

// ── Save ─────────────────────────────────────────────────────────────────────
async function save(shouldPublish = null) {
  error.value = ''

  // Validation
  if (!title.value.trim()) { error.value = 'O título é obrigatório.'; return }
  if (!category.value)     { error.value = 'Selecione uma categoria.'; return }
  if (!heroImagePreview.value && !heroImageExisting.value) {
    error.value = 'A imagem de capa é obrigatória.'; return
  }

  saving.value = true
  try {
    // Upload hero image if new file selected
    let heroImageUrl = heroImageExisting.value
    if (heroImageFile.value) {
      const path = `reviews/hero-${Date.now()}-${heroImageFile.value.name}`
      heroImageUrl = await uploadImage(heroImageFile.value, path)
    }

    // Upload block images — cada bloco image tem images: [{ url, caption, file, previewUrl }]
    const processedBlocks = await Promise.all(
      blocks.value.map(async (block) => {
        const { id, ...rest } = block
        if (block.type !== 'image') return rest

        // Faz upload de cada imagem que ainda tem um File local pendente
        const processedImages = await Promise.all(
          (block.images ?? []).map(async (img) => {
            const { file, previewUrl, ...imgRest } = img
            if (file) {
              const path = `reviews/blocks-${Date.now()}-${file.name}`
              const url = await uploadImage(file, path)
              return { ...imgRest, url }
            }
            return imgRest   // já era URL do Storage — mantém
          })
        )
        return { ...rest, images: processedImages }
      })
    )

    const payload = {
      title: title.value.trim(),
      category: category.value,
      tags: tags.value.split(',').map(t => t.trim()).filter(Boolean),
      author: author.value.trim(),
      published: shouldPublish !== null ? shouldPublish : published.value,
      heroImage: heroImageUrl,
      blocks: processedBlocks,
      specs: specs.value,
      ...(isEditing.value ? { id: route.params.id } : {}),
    }

    const id = await store.saveReview(payload)
    router.push({ name: 'review-edit', params: { id } })
  } catch (e) {
    error.value = `Erro ao salvar: ${e.message}`
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="font-title">{{ isEditing ? 'Editar Review' : 'Novo Review' }}</h1>
      <router-link to="/admin/products" class="back-link font-body">← Voltar</router-link>
    </div>

    <p v-if="error" class="error-banner font-body">{{ error }}</p>

    <div class="edit-layout">
      <!-- ── Left: main form ── -->
      <div class="edit-main">

        <!-- Hero image -->
        <section class="form-section">
          <label class="section-label font-title">Imagem de Capa <span class="required">*</span></label>
          <div class="hero-upload">
            <img v-if="heroImagePreview" :src="heroImagePreview" class="hero-preview" />
            <label class="upload-btn font-body">
              <input type="file" accept="image/*" @change="handleHeroUpload" hidden />
              {{ heroImagePreview ? 'Trocar imagem' : 'Selecionar imagem de capa' }}
            </label>
          </div>
        </section>

        <!-- Title -->
        <section class="form-section">
          <label class="section-label font-title">Título <span class="required">*</span></label>
          <input v-model="title" type="text" placeholder="Nome do produto / review" class="text-input font-body" />
        </section>

        <!-- Category + Tags + Author -->
        <section class="form-section form-row">
          <div class="form-field">
            <label class="section-label font-title">Categoria <span class="required">*</span></label>
            <select v-model="category" class="text-input font-body">
              <option value="">Selecionar...</option>
              <option v-for="c in CATEGORIES" :key="c.slug" :value="c.slug">{{ c.label }}</option>
            </select>
          </div>
          <div class="form-field">
            <label class="section-label font-title">Tags <span class="hint font-body">(separadas por vírgula)</span></label>
            <input v-model="tags" type="text" placeholder="ex: mecânico, RGB, sem fio" class="text-input font-body" />
          </div>
          <div class="form-field">
            <label class="section-label font-title">Autor</label>
            <input v-model="author" type="text" class="text-input font-body" />
          </div>
        </section>

        <!-- Content blocks -->
        <section class="form-section">
          <label class="section-label font-title">Conteúdo do Review</label>

          <div class="blocks-list">
            <ContentBlock
              v-for="(block, i) in blocks"
              :key="block.id"
              :block="block"
              :index="i"
              :is-first="i === 0"
              :is-last="i === blocks.length - 1"
              @update="(updated) => updateBlock(i, updated)"
              @move-up="moveUp"
              @move-down="moveDown"
              @remove="removeBlock"
            />
          </div>

          <div class="add-block-btns">
            <button type="button" @click="addBlock('paragraph')" class="add-btn font-body">+ Parágrafo</button>
            <button type="button" @click="addBlock('heading')"   class="add-btn font-body">+ Título</button>
            <button type="button" @click="addBlock('image')"     class="add-btn font-body">+ Imagem</button>
          </div>
        </section>

        <!-- Specs -->
        <section class="form-section">
          <SpecsEditor :category="category" v-model:specs="specs" />
        </section>
      </div>

      <!-- ── Right: publish panel ── -->
      <aside class="edit-sidebar">
        <div class="publish-panel">
          <h3 class="font-title">Publicação</h3>
          <p class="publish-status font-body">
            Status: <strong>{{ published ? 'Publicado' : 'Rascunho' }}</strong>
          </p>
          <div class="publish-actions">
            <button
              type="button"
              class="btn-secondary font-title"
              :disabled="saving"
              @click="save(false)"
            >
              {{ saving ? 'Salvando...' : 'Salvar rascunho' }}
            </button>
            <button
              type="button"
              class="btn-primary font-title"
              :disabled="saving"
              @click="save(true)"
            >
              {{ saving ? 'Publicando...' : 'Publicar' }}
            </button>
          </div>

          <div v-if="isEditing" class="preview-link font-body">
            <router-link :to="{ name: 'review', params: { id: route.params.id } }" target="_blank">
              Ver publicação
            </router-link>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.admin-page { max-width: 1100px; margin: 0 auto; padding: 3rem 1.5rem 6rem; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
.page-header h1 { margin: 0; color: var(--text-main); font-size: 2rem; }
.back-link { color: var(--text-muted); font-size: 0.9rem; text-decoration: none; }
.back-link:hover { color: var(--text-main); }
.error-banner {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid var(--accent-red);
  border-radius: 8px;
  color: var(--accent-red);
  padding: 0.85rem 1.1rem;
  margin-bottom: 1.5rem;
}

.edit-layout { display: flex; gap: 1.75rem; align-items: flex-start; }
.edit-main { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
.edit-sidebar { width: 250px; flex-shrink: 0; position: sticky; top: 90px; }

.form-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-label { display: block; font-size: 0.88rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem; }
.required { color: var(--accent-red); }
.hint { font-weight: 400; color: var(--text-muted); }

.text-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: var(--bg-site);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.text-input:focus { outline: none; border-color: var(--text-main); }

.form-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.form-field { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 0.4rem; }

/* Hero upload */
.hero-upload { display: flex; flex-direction: column; gap: 0.85rem; }
.hero-preview { max-height: 220px; object-fit: contain; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-site); }
.upload-btn {
  display: inline-block; cursor: pointer; padding: 0.65rem 1rem;
  border: 1px dashed var(--border-color); border-radius: 8px; font-size: 0.9rem;
  color: var(--text-muted); text-align: center; transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.upload-btn:hover { background: var(--bg-surface-hover); border-color: var(--text-main); color: var(--text-main); }

/* Blocks */
.blocks-list { display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 0.85rem; }
.add-block-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.add-btn {
  padding: 0.5rem 0.95rem; border: 1px dashed var(--border-color); border-radius: 8px;
  background: var(--bg-site); cursor: pointer; font-size: 0.85rem; color: var(--text-main);
  transition: background 0.15s, border-color 0.15s;
}
.add-btn:hover { background: var(--bg-surface-hover); border-color: var(--text-main); }

/* Sidebar */
.publish-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.publish-panel h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
.publish-status { font-size: 0.88rem; color: var(--text-muted); margin: 0; }
.publish-actions { display: flex; flex-direction: column; gap: 0.6rem; }

.btn-primary, .btn-secondary {
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s, background 0.15s;
}

.btn-primary { background: var(--text-main); color: var(--bg-site); }
.btn-primary:hover:not(:disabled) { opacity: 0.9; }

.btn-secondary { background: var(--bg-site); color: var(--text-main); border: 1px solid var(--border-color); }
.btn-secondary:hover:not(:disabled) { background: var(--bg-surface-hover); }

.btn-primary:disabled, .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

.preview-link a { font-size: 0.85rem; color: var(--text-muted); text-decoration: underline; }
.preview-link a:hover { color: var(--text-main); }
</style>
