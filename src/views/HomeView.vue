<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReviewsStore } from '../stores/reviews'
import HeroImage from '../components/ui/HeroImage.vue'
import ProductCard from '../components/ui/ProductCard.vue'
import CategoryFilter from '../components/ui/CategoryFilter.vue'

const store = useReviewsStore()
const selectedCategory = ref(null)

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1600&q=80'
const RECENT_LIMIT = 6

onMounted(async () => {
  await Promise.all([
    store.fetchPublicReviews({ limitN: 50 }),
    store.fetchSiteSettings(),
  ])
})

const heroSrc = computed(() => store.siteSettings.heroImage || FALLBACK_HERO)

const pinnedReviews = computed(() =>
  store.reviews.filter(r => r.pinned)
)

const recentReviews = computed(() => store.reviews.slice(0, RECENT_LIMIT))

const filteredReviews = computed(() => {
  if (!selectedCategory.value) return store.reviews
  return store.reviews.filter(r => r.category === selectedCategory.value)
})
</script>

<template>
  <div class="home-page">
    <!-- Hero banner -->
    <HeroImage :src="heroSrc" alt="poliRating" height="420px">
      <h1 class="hero-title">poliRating</h1>
      <p class="hero-subtitle">Reviews honestos de periféricos</p>
    </HeroImage>

    <div class="page-content">
      <!-- Pinned reviews -->
      <section v-if="pinnedReviews.length > 0" class="section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="pin-icon" aria-hidden="true">📌</span>
            Destaques
          </h2>
        </div>
        <div class="cards-grid">
          <ProductCard v-for="r in pinnedReviews" :key="r.id" :review="r" />
        </div>
      </section>

      <!-- Recent reviews -->
      <section class="section">
        <h2 class="section-title">Reviews Recentes</h2>
        <div v-if="store.loading" class="status-msg">Carregando reviews...</div>
        <div v-else-if="store.error" class="status-msg error-msg">Não foi possível carregar os reviews: {{ store.error }}</div>
        <div v-else-if="recentReviews.length === 0" class="status-msg">Nenhum review publicado ainda.</div>
        <div v-else class="cards-grid">
          <ProductCard v-for="r in recentReviews" :key="r.id" :review="r" />
        </div>
      </section>

      <!-- Category filter + all reviews -->
      <section class="section">
        <h2 class="section-title">Explorar por Categoria</h2>
        <CategoryFilter v-model="selectedCategory" />
        <div v-if="store.loading" class="status-msg">Carregando reviews...</div>
        <div v-else-if="store.error" class="status-msg error-msg">Não foi possível carregar os reviews: {{ store.error }}</div>
        <div v-else-if="filteredReviews.length === 0" class="status-msg">Nenhum review nesta categoria ainda.</div>
        <div v-else class="cards-grid" style="margin-top: 1.75rem">
          <ProductCard v-for="r in filteredReviews" :key="r.id" :review="r" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hero-title {
  font-family: var(--font-title);
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 700;
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.03em;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.hero-subtitle {
  font-family: var(--font-body);
  font-size: 1.1rem;
  margin: 0.6rem 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

/* Desktop: centred, max-width container */
.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
}

.section {
  margin-bottom: 3.5rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-family: var(--font-title);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.pin-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.status-msg {
  color: var(--text-muted);
  padding: 3rem 0;
  text-align: center;
  font-size: 0.95rem;
}

.error-msg {
  color: var(--accent-red);
}

/* ── Mobile ─────────────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  /* Shrink hero on phones */
  :deep(.hero-wrap) {
    height: 260px !important;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  /* Full-width content, only horizontal text padding */
  .page-content {
    padding: 1.75rem 1rem 4rem;
  }

  .section {
    margin-bottom: 2.5rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  /* 2-column grid on mid-phones, 1-column on very small */
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.9rem;
  }
}

@media (max-width: 400px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
