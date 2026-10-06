<script setup>
import { CATEGORIES } from '../../constants/categories'

defineProps({
  modelValue: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue'])

function select(slug) {
  emit('update:modelValue', slug)
}
</script>

<template>
  <div class="category-filter" aria-label="Filtrar por categoria">
    <button
      type="button"
      class="filter-chip font-title"
      :class="{ selected: !modelValue }"
      @click="select(null)"
    >
      Todos
    </button>
    <button
      v-for="category in CATEGORIES"
      :key="category.slug"
      type="button"
      class="filter-chip font-title"
      :class="{ selected: modelValue === category.slug }"
      @click="select(category.slug)"
    >
      {{ category.label }}
    </button>
  </div>
</template>

<style scoped>
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-chip {
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-muted);
  padding: 0.45rem 0.95rem;
  border-radius: 99px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.filter-chip:hover {
  border-color: var(--text-muted);
  color: var(--text-main);
  background: var(--bg-surface-hover);
}

.filter-chip.selected {
  background: var(--text-main);
  border-color: var(--text-main);
  color: var(--bg-site);
  font-weight: 600;
}
</style>
