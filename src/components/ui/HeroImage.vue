<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src:    { type: String, required: true },
  alt:    { type: String, default: '' },
  height: { type: String, default: '440px' },
})

// Tracks whether the current src has already been loaded by the browser (cache hit).
const loaded = ref(false)

// We use an off-screen Image object to detect a cache hit before the visible
// <img> mounts. If the browser already has the bytes it completes synchronously
// (complete === true), so we can skip the fade-in.
function probe(src) {
  if (!src) return
  const img = new Image()
  img.onload = () => { loaded.value = true }
  // A cached image fires `complete` synchronously before onload; check it first.
  img.src = src
  if (img.complete) loaded.value = true
}

watch(() => props.src, (next) => {
  loaded.value = false
  probe(next)
}, { immediate: true })
</script>

<template>
  <div class="hero-wrap" :style="{ height }">
    <!--
      fetchpriority="high" tells the browser this is the LCP element and to
      queue it before other images. The `loaded` class swaps in the image once
      the browser has the bytes, avoiding the flash of the --bg-surface colour.
    -->
    <img
      :src="src"
      :alt="alt"
      class="hero-img"
      :class="{ 'is-loaded': loaded }"
      fetchpriority="high"
      decoding="async"
      @load="loaded = true"
    />
    <div class="hero-overlay">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.hero-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  /* Neutral dark background that matches both themes — no white flash. */
  background: #0e0e10;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.35s ease;
}

/* Once bytes are in the browser cache the probe fires synchronously, so the
   image renders at full opacity with no animation frame lost. */
.hero-img.is-loaded {
  opacity: 1;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,.2) 0%, rgba(0,0,0,.75) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-align: center;
  padding: 2rem;
}
</style>
