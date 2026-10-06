<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useReviewsStore } from '../stores/reviews'
import { getCategoryLabel, CATEGORIES } from '../constants/categories'
import ProductCard from '../components/ui/ProductCard.vue'

const route = useRoute()
const store = useReviewsStore()

const category = computed(() => route.params.slug)
const categoryExists = computed(() => CATEGORIES.some(item => item.slug === category.value))
const categoryLabel = computed(() => getCategoryLabel(category.value))

function loadReviews() {
  if (categoryExists.value) {
    store.fetchPublicReviews({ category: category.value, limitN: 50 })
  }
}

onMounted(loadReviews)
watch(category, loadReviews)
</script>

<template>
  <div class="category-page">
    <template v-if="categoryExists">
      <header class="page-heading">
        <p class="eyebrow font-title">Categoria</p>
        <h1 class="font-title">Reviews de {{ categoryLabel }}</h1>
        <p class="description">Todos os periféricos de {{ categoryLabel.toLowerCase() }} que já passaram por análise.</p>
      </header>

      <div v-if="store.loading" class="status">Carregando reviews...</div>
      <div v-else-if="store.error" class="status error">Não foi possível carregar os reviews: {{ store.error }}</div>
      <div v-else-if="store.reviews.length === 0" class="status">
        Ainda não há reviews publicados nesta categoria.
      </div>
      <div v-else class="cards-grid">
        <ProductCard v-for="review in store.reviews" :key="review.id" :review="review" />
      </div>
    </template>

    <div v-else class="not-found">
      <h1 class="font-title">Categoria não encontrada</h1>
      <p>A categoria solicitada não existe.</p>
      <router-link to="/" class="back-link">Voltar para a página inicial</router-link>
    </div>
  </div>
</template>

<style scoped>
.category-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
}

@media (max-width: 640px) {
  .category-page {
    padding: 1.75rem 1rem 4rem;
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.9rem;
  }
}

.page-heading {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2.5rem;
  padding-bottom: 1.75rem;
  transition: border-color 0.25s ease;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
  line-height: 1.2;
  color: var(--text-main);
}

.description {
  margin: 0.6rem 0 0;
  color: var(--text-muted);
  font-size: 1.05rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.75rem;
}

.status {
  padding: 4rem 1rem;
  color: var(--text-muted);
  text-align: center;
  font-size: 1rem;
}

.status.error {
  color: var(--accent-red);
}

.not-found {
  text-align: center;
  padding: 5rem 1rem;
}

.not-found h1 {
  margin-bottom: 0.5rem;
}

.not-found p {
  color: var(--text-muted);
}

.back-link {
  display: inline-block;
  margin-top: 1rem;
  color: var(--text-main);
  font-weight: 600;
  text-decoration: underline;
}
</style>
