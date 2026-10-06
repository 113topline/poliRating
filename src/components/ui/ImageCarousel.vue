<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // Array de { url: string, caption?: string }
  images: { type: Array, required: true },
  caption: { type: String, default: '' },
})

const current = ref(0)

const total = computed(() => props.images.length)

function prev() {
  current.value = (current.value - 1 + total.value) % total.value
}

function next() {
  current.value = (current.value + 1) % total.value
}

function goTo(i) {
  current.value = i
}

// ── Teclado ──────────────────────────────────────────────────────────────────
function onKey(e) {
  if (e.key === 'ArrowLeft')  prev()
  if (e.key === 'ArrowRight') next()
}

// ── Swipe touch ───────────────────────────────────────────────────────────────
let touchStartX = 0

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) < 40) return   // movimento muito pequeno, ignora
  if (dx < 0) next()
  else         prev()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <figure
    v-if="images.length"
    class="carousel"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- Faixa de imagens -->
    <div class="carousel-track" :style="{ transform: `translateX(-${current * 100}%)` }">
      <div
        v-for="(img, i) in images"
        :key="i"
        class="carousel-slide"
      >
        <img :src="img.url" :alt="caption || `Imagem ${i + 1}`" class="carousel-img" />
      </div>
    </div>

    <!-- Seta esquerda -->
    <button
      v-if="total > 1"
      type="button"
      class="carousel-arrow arrow-prev"
      aria-label="Imagem anterior"
      @click="prev"
    >
      ‹
    </button>

    <!-- Seta direita -->
    <button
      v-if="total > 1"
      type="button"
      class="carousel-arrow arrow-next"
      aria-label="Próxima imagem"
      @click="next"
    >
      ›
    </button>


    <!-- Dots -->
    <div v-if="total > 1" class="carousel-dots" role="tablist">
      <button
        v-for="(_, i) in images"
        :key="i"
        type="button"
        role="tab"
        :aria-selected="i === current"
        :aria-label="`Ir para imagem ${i + 1}`"
        class="dot"
        :class="{ active: i === current }"
        @click="goTo(i)"
      />
    </div>

  </figure>
      
    <figcaption v-if="caption" class="carousel-caption font-title">
      {{ caption }}
    </figcaption>
</template>

<style scoped>
.carousel {
  position: relative;
  margin: 0;
  overflow: hidden;
  border-radius: 12px 12px 0px 0px;
  border: 1px solid var(--border-color);
  background: var(--bg-site);
}

/* Faixa deslizante */
.carousel-track {
  display: flex;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
}

.carousel-img {
  display: block;
  width: 100%;
  max-height: 600px;
  object-fit: contain;
  background: var(--bg-site);
}

/* Setas */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: background 0.18s, opacity 0.18s;
  /* Empurra a seta para baixo do figcaption (que fica fora dos dots) */
  margin-top: -12px;
}

.carousel-arrow:hover {
  background: rgba(0, 0, 0, 0.7);
}

.arrow-prev { left: 12px; }
.arrow-next { right: 12px; }

/* Dots */
.carousel-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: background 0.18s, transform 0.18s;
}

.dot.active {
  background: #fff;
  transform: scale(1.3);
}

/* Legenda */
.carousel-caption {
  display: block;
  padding: 0.6rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
  border-radius: 0px 0px 12px 12px;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
}

/* ── Mobile: bleed edge-to-edge, square corners ─────────────────────────────── */
@media (max-width: 640px) {
  .carousel {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .carousel-caption {
    border-radius: 0;
    border-left: none;
    border-right: none;
    margin-bottom: 1.25rem;
  }
}
</style>
