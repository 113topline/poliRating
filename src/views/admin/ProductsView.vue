<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReviewsStore } from '../../stores/reviews'
import { updateReview } from '../../firebase/firestore'
import { getCategoryLabel, CATEGORIES } from '../../constants/categories'
import IconPlus from '../../components/icons/IconPlus.vue'
import IconPin from '../../components/icons/IconPin.vue'

const store = useReviewsStore()

const filterCategory = ref('')
const filterStatus = ref('')
const searchText = ref('')

onMounted(() => store.fetchAllReviews())

const filtered = computed(() => {
  return store.reviews.filter(r => {
    if (filterCategory.value && r.category !== filterCategory.value) return false
    if (filterStatus.value === 'published' && !r.published) return false
    if (filterStatus.value === 'draft' && r.published) return false
    if (searchText.value && !r.title?.toLowerCase().includes(searchText.value.toLowerCase())) return false
    return true
  })
})

function formatDate(ts) {
  if (!ts) return '-'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('pt-BR')
}

async function togglePublished(review) {
  await updateReview(review.id, { published: !review.published })
  await store.fetchAllReviews()
}

async function togglePin(review) {
  await store.pinReview(review.id, !review.pinned)
}

async function remove(review) {
  if (!confirm(`Remover "${review.title}"?`)) return
  await store.removeReview(review.id)
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="font-title">Produtos / Reviews</h1>
      <router-link to="/admin/review/new" class="btn-primary font-title">
        <IconPlus />
        <span>Novo Review</span>
      </router-link>
    </div>

    <!-- Filters -->
    <div class="filters font-body">
      <input v-model="searchText" placeholder="Buscar por título..." class="filter-input font-body" />
      <select v-model="filterCategory" class="filter-select font-body">
        <option value="">Todas as categorias</option>
        <option v-for="c in CATEGORIES" :key="c.slug" :value="c.slug">{{ c.label }}</option>
      </select>
      <select v-model="filterStatus" class="filter-select font-body">
        <option value="">Todos os status</option>
        <option value="published">Publicados</option>
        <option value="draft">Rascunhos</option>
      </select>
    </div>

    <!-- Table -->
    <div v-if="store.loading" class="loading">Carregando...</div>
    <div v-else-if="filtered.length === 0" class="empty">Nenhum review encontrado.</div>
    <div v-else class="table-wrap">
      <table class="reviews-table">
        <thead>
          <tr>
            <th class="font-title">Título</th>
            <th class="font-title">Categoria</th>
            <th class="font-title">Status</th>
            <th class="font-title">Data</th>
            <th class="font-title">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id" :class="{ pinned: r.pinned }">
            <td class="col-title font-body">
              <span v-if="r.pinned" class="pin-badge" title="Fixado no topo">
                <IconPin />
              </span>
              {{ r.title }}
            </td>
            <td class="font-body">{{ getCategoryLabel(r.category) }}</td>
            <td>
              <span :class="['status-badge font-body', r.published ? 'published' : 'draft']">
                {{ r.published ? 'Publicado' : 'Rascunho' }}
              </span>
            </td>
            <td class="font-body">{{ formatDate(r.publishedAt) }}</td>
            <td class="col-actions">
              <router-link :to="{ name: 'review-edit', params: { id: r.id } }" class="action-btn font-body">Editar</router-link>
              <button
                @click="togglePin(r)"
                :class="['action-btn font-body', r.pinned ? 'active-pin' : '']"
                :title="r.pinned ? 'Desafixar do topo' : 'Fixar no topo'"
              >
                <IconPin />
                {{ r.pinned ? 'Desafixar' : 'Fixar' }}
              </button>
              <button @click="togglePublished(r)" class="action-btn font-body">
                {{ r.published ? 'Despublicar' : 'Publicar' }}
              </button>
              <button @click="remove(r)" class="action-btn danger font-body">Remover</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: var(--text-main);
  font-size: 2rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.2rem;
  background: var(--text-main);
  color: var(--bg-site);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: opacity 0.15s, transform 0.15s;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-input, .filter-select {
  padding: 0.55rem 0.85rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 0.9rem;
  transition: border-color 0.15s;
}

.filter-input:focus, .filter-select:focus {
  outline: none;
  border-color: var(--text-main);
}

.filter-input {
  flex: 1;
  min-width: 200px;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
}

.reviews-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.reviews-table th {
  text-align: left;
  padding: 0.85rem 1rem;
  background: var(--bg-surface-hover);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.reviews-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  color: var(--text-main);
}

.reviews-table tr:last-child td {
  border-bottom: none;
}

.reviews-table tr.pinned td:first-child {
  border-left: 3px solid var(--accent-green);
}

.col-title {
  font-weight: 500;
  max-width: 320px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Pin badge inline */
.pin-badge {
  display: inline-flex;
  align-items: center;
  color: var(--accent-green);
  flex-shrink: 0;
}

.status-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 600;
}

.status-badge.published {
  background: rgba(34, 197, 94, 0.12);
  color: var(--accent-green);
}

.status-badge.draft {
  background: rgba(234, 179, 8, 0.12);
  color: #eab308;
}

.col-actions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-site);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
  text-decoration: none;
  color: var(--text-main);
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}

.action-btn:hover {
  background: var(--bg-surface-hover);
  border-color: var(--text-muted);
}

.action-btn.active-pin {
  border-color: var(--accent-green);
  color: var(--accent-green);
  background: rgba(34, 197, 94, 0.08);
}

.action-btn.active-pin:hover {
  background: rgba(34, 197, 94, 0.15);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: var(--accent-red);
  color: var(--accent-red);
}

.loading, .empty {
  text-align: center;
  padding: 4rem;
  color: var(--text-muted);
}
</style>
