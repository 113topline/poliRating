<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useReviewsStore } from '../stores/reviews'
import { getCategoryLabel } from '../constants/categories'
import { SPECS_SCHEMA } from '../constants/specsSchema'
import IconCheck from '../components/icons/IconCheck.vue'
import IconX from '../components/icons/IconX.vue'
import ImageCarousel from '../components/ui/ImageCarousel.vue'

const route = useRoute()
const store = useReviewsStore()
const scrollY = ref(0)

function handleScroll() {
  scrollY.value = window.scrollY
}

onMounted(() => {
  store.fetchReview(route.params.id)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', handleScroll))

const heroFilter = computed(() => {
  const progress = Math.max(0, Math.min(1, (scrollY.value - 40) / 240))
  const blur = (progress * 14).toFixed(1)
  const scale = (1.06 + progress * 0.18).toFixed(3)
  return { filter: `blur(${blur}px)`, WebkitFilter: `blur(${blur}px)`, transform: `scale(${scale})` }
})

const heroFadeStyle = computed(() => {
  const progress = Math.max(0, Math.min(1, (scrollY.value - 40) / 240))
  const fadeSize = (48 + progress * 200).toFixed(1)
  return { '--hero-fade-size': `${fadeSize}px` }
})

const review = computed(() => store.currentReview)
const schema = computed(() => SPECS_SCHEMA[review.value?.category] || [])
const specs = computed(() => review.value?.specs || {})

const formattedDate = computed(() => {
  const timestamp = review.value?.publishedAt || review.value?.createdAt
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
})

function disabledKey(key) {
  return `__disabled_${key}`
}

function isDisabled(key) {
  return !!specs.value[disabledKey(key)]
}

function hasValue(key) {
  const value = specs.value[key]
  return value !== undefined && value !== '' && value !== null
}

function isVisibleField(field) {
  return !isDisabled(field.key) && (field.type === 'boolean' || hasValue(field.key))
}

function visibleChildren(field) {
  return field.children.filter(child => !isDisabled(child.key) && (child.type === 'boolean' || hasValue(child.key)))
}

function formatValue(field, value) {
  return field.unit && value !== '' ? `${value} ${field.unit}` : value
}

function isKnownKey(key) {
  return key.startsWith('__disabled_') || schema.value.some(field =>
    field.key === key || field.children?.some(child => child.key === key)
  )
}

const hasSpecs = computed(() => review.value && review.value.category !== 'other' && schema.value.some(field => {
  if (isDisabled(field.key)) return false
  return field.type === 'group' || field.type === 'boolean_group'
    ? visibleChildren(field).length > 0
    : isVisibleField(field)
}))
</script>

<template>
  <div v-if="store.loading" class="page-status font-body">Carregando review...</div>
  <div v-else-if="!review" class="page-status font-body">
    <h1 class="font-title">Review não encontrado</h1>
    <p>Este review não existe ou foi removido.</p>
    <router-link to="/" class="back-home font-body">Voltar para a página inicial</router-link>
  </div>

  <article v-else class="review-page">
    <div v-if="review.heroImage" class="hero-sticky-container">
      <img :src="review.heroImage" :alt="review.title" class="hero-image" :style="heroFilter" />
      <div class="hero-gradient-overlay"></div>
      <div class="hero-bottom-fade" :style="heroFadeStyle"></div>
    </div>

    <div class="review-container" :class="{ 'has-hero': !!review.heroImage }">
      <header class="review-header">
        <router-link :to="{ name: 'category', params: { slug: review.category } }" class="category-link font-title">{{
          getCategoryLabel(review.category) }}</router-link>
        <h1 class="review-title font-title">{{ review.title }}</h1>
        <div class="review-meta font-body">
          <span v-if="review.author">Por {{ review.author }}</span>
          <span v-if="review.author && formattedDate" class="meta-divider">·</span>
          <time v-if="formattedDate">{{ formattedDate }}</time>
        </div>
        <div v-if="review.tags?.length" class="tags">
          <span v-for="tag in review.tags" :key="tag" class="tag font-body">{{ tag }}</span>
        </div>
      </header>

      <section class="review-content font-body">
        <template v-for="(block, index) in review.blocks" :key="index">
          <p v-if="block.type === 'paragraph'" class="paragraph">{{ block.content }}</p>
          <h2 v-else-if="block.type === 'heading'" class="content-heading font-title">{{ block.content }}</h2>
          <ImageCarousel v-else-if="block.type === 'image'"
            :images="Array.isArray(block.images) && block.images.length ? block.images : block.url ? [{ url: block.url }] : []"
            :caption="block.caption || block.images?.find(img => img.caption)?.caption || ''" />
        </template>
      </section>

      <section v-if="hasSpecs" class="specs-section">
        <h2 class="specs-main-title font-title">Especificações Técnicas</h2>
        <div class="table-wrap">
          <table class="specs-table">
            <tbody>
              <template v-for="field in schema" :key="field.key">
                <template
                  v-if="(field.type === 'group' || field.type === 'boolean_group') && !isDisabled(field.key) && visibleChildren(field).length">
                  <tr class="group-row" style="display:inline; ">
                    <th colspan="2" class="group-header font-title">
                      <span>{{ field.label }}</span>
                      <span v-if="field.type === 'boolean_group'"
                        :class="specs[field.key] ? 'green-accent' : 'red-accent'">
                        <IconCheck v-if="specs[field.key]" />
                        <IconX v-else />
                      </span>
                    </th>
                  </tr>
                  <tr v-for="child in visibleChildren(field)" :key="child.key" class="child-row">
                    <th scope="row" class="child-label font-title">{{ child.label }}</th>
                    <td class="font-body">
                      <span v-if="child.type === 'boolean'"
                        :class="specs[child.key] ? 'val-icon green-accent' : 'val-icon red-accent'">
                        <IconCheck v-if="specs[child.key]" />
                        <IconX v-else />
                      </span>
                      <template v-else>{{ formatValue(child, specs[child.key]) }}</template>
                    </td>
                  </tr>
                </template>

                <tr v-else-if="field.type !== 'group' && field.type !== 'boolean_group' && isVisibleField(field)">
                  <th scope="row" class="spec-label font-title">{{ field.label }}</th>
                  <td class="font-body">
                    <span v-if="field.type === 'boolean'"
                      :class="specs[field.key] ? 'val-icon green-accent' : 'val-icon red-accent'">
                      <IconCheck v-if="specs[field.key]" />
                      <IconX v-else />
                    </span>
                    <template v-else>{{ formatValue(field, specs[field.key]) }}</template>
                  </td>
                </tr>
              </template>

              <template v-for="(val, key) in specs" :key="key">
                <tr v-if="!isKnownKey(key) && val !== '' && val !== null">
                  <th scope="row" class="spec-label font-title">{{ key }}</th>
                  <td class="font-body">
                    <span v-if="typeof val === 'boolean'"
                      :class="val ? 'val-icon green-accent' : 'val-icon red-accent'">
                      <IconCheck v-if="val" />
                      <IconX v-else />
                    </span>
                    <template v-else>{{ val }}</template>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </article>
</template>

<style scoped>
.page-status {
  max-width: 780px;
  margin: 0 auto;
  padding: 6rem 1.5rem;
  text-align: center;
  color: var(--text-muted);
}

.page-status h1 {
  color: var(--text-main);
  margin: 0 0 0.5rem;
}

.back-home {
  display: inline-block;
  margin-top: 1rem;
  color: var(--text-main);
  font-weight: 600;
  text-decoration: underline;
}

.review-page {
  position: relative;
  width: 100%;
}

.hero-sticky-container {
  position: sticky;
  top: 0;
  width: 100%;
  height: 60vh;
  z-index: 1;
  overflow: hidden;
  background: var(--bg-surface);
  
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  will-change: filter, transform;
  transform-origin: center center;
  transition: filter 0.05s linear, transform 0.05s linear;
}

.hero-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.hero-bottom-fade {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: var(--hero-fade-size);
  background: linear-gradient(to bottom, transparent 0%, var(--bg-site) 100%);
  pointer-events: none;
}

.review-container {
  position: relative;
  z-index: 2;
  max-width: 1020px;
  margin: 0 auto;
  padding: 3rem 2rem 6rem;
  background-color: var(--bg-site);
  border-radius: 20px 20px 0 0;
  transition: background-color 0.25s ease;
}

.review-container.has-hero {
  margin-top: -120px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15);
}

.review-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 2rem;
  margin-bottom: 2.5rem;
}

.category-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: color 0.15s;
}

.category-link:hover {
  color: var(--text-main);
}

.review-title {
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin: 0.6rem 0 1rem;
  color: var(--text-main);
}

.review-meta {
  color: var(--text-muted);
  font-size: 0.92rem;
}

.meta-divider {
  margin: 0 0.5rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.tag {
  padding: 0.3rem 0.75rem;
  border-radius: 99px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 0.8rem;
  font-weight: 500;
}

.review-content {
  font-size: 1.1rem;
  color: var(--text-main);
  line-height: 1.8;
}

.paragraph {
  white-space: pre-line;
  margin: 0 0 1.6rem;
}

.content-heading {
  color: var(--text-main);
  font-size: 1.75rem;
  line-height: 1.25;
  margin: 2.75rem 0 1.25rem;
}

.specs-section {
  margin-top: 3.5rem;
  padding-top: 2.5rem;
  border-top: 1px solid var(--border-color);
}

.specs-main-title {
  font-size: 1.75rem;
  margin: 0 0 1.5rem;
  color: var(--text-main);
}

.table-wrap {
  overflow-x: auto;
  border-radius: 10px;
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: var(--spec-bg);
  border-radius: 10px;
  overflow: hidden;
}

.specs-table th,
.specs-table td {
  padding: 0.85rem 1.1rem;
  text-align: left;
  border: none;
  border-bottom: 1px solid var(--spec-border);
}

.specs-table tr:last-child th,
.specs-table tr:last-child td {
  border-bottom: none;
}

.specs-table th.spec-label,
.specs-table th.child-label {
  width: 38%;
  color: var(--spec-title);
  font-weight: 600;
}

.specs-table th.group-header {
  width: 100%;
}

.group-row th.group-header {
  color: var(--spec-title);
  font-size: 1.05rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

[data-theme="dark"] .group-row th.group-header {
  background-color: rgba(255, 255, 255, 0.04);
}

.child-label {
  padding-left: 2rem !important;
}

.green-accent {
  color: var(--accent-green);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.red-accent {
  color: var(--accent-red);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.val-icon svg,
.green-accent svg,
.red-accent svg {
  width: 17px;
  height: 17px;
}

/* ── Mobile ──────────────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .review-container {
    padding: 2rem 1rem 4rem;
    border-radius: 12px 12px 0 0;
  }

  /* Carousel: break out of the 1rem side padding to bleed edge-to-edge */
  :deep(.carousel),
  :deep(.carousel-caption) {
    margin-left: -1rem;
    margin-right: -1rem;
  }

  /* Spec table: same bleed treatment */
  .specs-section {
    margin-left: -1rem;
    margin-right: -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .table-wrap {
    border-radius: 0;
    margin-left: -1rem;
    margin-right: -1rem;
  }

  .specs-table {
    border-radius: 0;
  }

  .specs-main-title {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .review-header {
    padding-bottom: 1.5rem;
    margin-bottom: 1.75rem;
  }

  .review-title {
    font-size: clamp(1.8rem, 7vw, 2.4rem);
  }
}
</style>
