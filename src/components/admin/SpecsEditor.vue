<script setup>
import { computed } from 'vue'
import { getCategoryLabel } from '../../constants/categories'
import { SPECS_SCHEMA } from '../../constants/specsSchema'

const props = defineProps({
  category: { type: String, default: '' },
  specs: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:specs'])
const schema = computed(() => SPECS_SCHEMA[props.category] || [])

function updateValue(key, value) {
  emit('update:specs', { ...props.specs, [key]: value })
}

function getValue(key, defaultValue = '') {
  return props.specs[key] !== undefined ? props.specs[key] : defaultValue
}

function disabledKey(key) {
  return `__disabled_${key}`
}

function isDisabled(key) {
  return !!getValue(disabledKey(key), false)
}

function updateDisabled(key, value) {
  updateValue(disabledKey(key), value)
}
</script>

<template>
  <div class="specs-editor">
    <div class="specs-heading">
      <label class="section-label font-title">Tabela de Especificações <span v-if="category && category !== 'other'" class="required">*</span></label>
      <p class="description font-body">
        {{ category ? `Especificações obrigatórias para ${getCategoryLabel(category)}.` : 'Selecione uma categoria para preencher as especificações.' }}
      </p>
    </div>

    <div v-if="!category" class="empty-state font-body">Selecione a categoria do produto acima para carregar a tabela de especificações.</div>
    <div v-else-if="category === 'other'" class="other-category-notice font-body">A categoria <strong>Outros</strong> não necessita de tabela de especificações ou comparador.</div>

    <div v-else class="specs-form">
      <div v-for="field in schema" :key="field.key" class="field-item">
        <template v-if="field.type === 'group' || field.type === 'boolean_group'">
          <fieldset class="group-fieldset">
            <legend class="group-legend font-title">
              <label v-if="field.type === 'boolean_group'" class="checkbox-label header-checkbox">
                <input type="checkbox" :checked="!!getValue(field.key, false)" @change="updateValue(field.key, $event.target.checked)" />
                <span>{{ field.label }}</span>
              </label>
              <span v-else>{{ field.label }}</span>
            </legend>
            <label class="disable-label font-body">
              <input type="checkbox" :checked="isDisabled(field.key)" @change="updateDisabled(field.key, $event.target.checked)" />
              Ocultar categoria
            </label>
            <div class="group-children" :class="{ 'is-disabled': field.type === 'boolean_group' && !getValue(field.key, false) }">
              <div v-for="child in field.children" :key="child.key" class="child-item">
                <div class="field-header">
                  <label v-if="child.type === 'boolean'" class="checkbox-label font-body">
                    <input type="checkbox" :disabled="field.type === 'boolean_group' && !getValue(field.key, false)" :checked="!!getValue(child.key, false)" @change="updateValue(child.key, $event.target.checked)" />
                    <span>{{ child.label }}</span>
                  </label>
                  <label v-else :for="child.key" class="field-label font-title">{{ child.label }}</label>
                  <label class="disable-label font-body">
                    <input type="checkbox" :checked="isDisabled(child.key)" @change="updateDisabled(child.key, $event.target.checked)" />
                    Ocultar
                  </label>
                </div>
                <select v-if="child.type === 'select'" :id="child.key" class="select-input font-body" :disabled="field.type === 'boolean_group' && !getValue(field.key, false)" :value="getValue(child.key)" @change="updateValue(child.key, $event.target.value)">
                  <option value="">Selecione...</option>
                  <option v-for="opt in child.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <input v-else-if="child.type !== 'boolean'" :id="child.key" type="text" class="text-input font-body" :disabled="field.type === 'boolean_group' && !getValue(field.key, false)" :value="getValue(child.key)" @input="updateValue(child.key, $event.target.value)" />
              </div>
            </div>
          </fieldset>
        </template>

        <template v-else>
          <div class="field-header">
            <label v-if="field.type === 'boolean'" class="checkbox-label font-body">
              <input type="checkbox" :checked="!!getValue(field.key, false)" @change="updateValue(field.key, $event.target.checked)" />
              <span>{{ field.label }}</span>
            </label>
            <label v-else :for="field.key" class="field-label font-title">{{ field.label }}</label>
            <label class="disable-label font-body">
              <input type="checkbox" :checked="isDisabled(field.key)" @change="updateDisabled(field.key, $event.target.checked)" />
              Ocultar
            </label>
          </div>
          <input v-if="field.type === 'text'" :id="field.key" type="text" class="text-input font-body" :placeholder="`Informe ${field.label.toLowerCase()}`" :value="getValue(field.key)" @input="updateValue(field.key, $event.target.value)" />
          <select v-else-if="field.type === 'select'" :id="field.key" class="select-input font-body" :value="getValue(field.key)" @change="updateValue(field.key, $event.target.value)">
            <option value="">Selecione...</option>
            <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.specs-editor { display: flex; flex-direction: column; gap: 1rem; }
.specs-heading { margin-bottom: 0.5rem; }
.section-label { display: block; font-size: 0.95rem; font-weight: 700; color: var(--text-main); }
.required { color: var(--accent-red); }
.description { margin: 0.2rem 0 0; font-size: 0.85rem; color: var(--text-muted); }
.empty-state, .other-category-notice { padding: 1.25rem; background: var(--bg-site); border: 1px dashed var(--border-color); border-radius: 8px; color: var(--text-muted); font-size: 0.9rem; text-align: center; }
.specs-form { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.2rem; }
.field-item { display: flex; flex-direction: column; gap: 0.35rem; }
.field-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; min-height: 1.4rem; }
.field-label { font-size: 0.83rem; font-weight: 600; color: var(--text-muted); }
.text-input, .select-input { width: 100%; padding: 0.55rem 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.9rem; background: var(--bg-site); color: var(--text-main); box-sizing: border-box; }
.text-input:focus, .select-input:focus { outline: none; border-color: var(--text-main); }
.checkbox-label, .disable-label { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; color: var(--text-main); font-weight: 500; }
.disable-label { color: var(--text-muted); font-size: 0.78rem; font-weight: 400; white-space: nowrap; }
.checkbox-label input[type="checkbox"], .disable-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--text-main); cursor: pointer; }
.group-fieldset { grid-column: 1 / -1; border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem 1.25rem; margin: 0; background: var(--bg-site); }
.group-legend { padding: 0 0.5rem; font-weight: 700; font-size: 0.9rem; color: var(--text-main); }
.header-checkbox { font-weight: 700; }
.group-children { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; margin-top: 0.5rem; transition: opacity 0.2s ease; }
.group-children.is-disabled { opacity: 0.4; pointer-events: none; filter: grayscale(0.5); }
.child-item { display: flex; flex-direction: column; gap: 0.35rem; }
</style>
