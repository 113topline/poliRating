<script setup>
import { computed } from 'vue'
import { getCategoryLabel } from '../../constants/categories'
import IconCamera from '../icons/IconCamera.vue'

const props = defineProps({
  review: { type: Object, required: true },
})

const date = computed(() => {
  const ts = props.review.publishedAt
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('pt-BR')
})
</script>

<template>
  <router-link :to="{ name: 'review', params: { id: review.id } }" class="card">
    <div class="card-img-wrap">
      <img
        v-if="review.heroImage"
        :src="review.heroImage"
        :alt="review.title"
        class="card-img"
      />
      <div v-else class="card-img-placeholder">
        <IconCamera />
      </div>
    </div>

    <div class="card-body">
      <span class="card-category font-title">{{ getCategoryLabel(review.category) }}</span>
      <h3 class="card-title font-title">{{ review.title }}</h3>
      <p class="card-meta">
        <span v-if="review.author">{{ review.author }}</span>
        <span v-if="review.author && date"> · </span>
        <span>{{ date }}</span>
      </p>
    </div>
  </router-link>
</template>

<style scoped>
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease, background-color 0.25s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
  border-color: var(--text-muted);
}

.card-img-wrap {
  height: 190px;
  overflow: hidden;
  background: var(--bg-surface-hover);
  position: relative;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.card:hover .card-img {
  transform: scale(1.03);
}

.card-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-subtle);
}

.card-body {
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.card-category {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}
</style>
