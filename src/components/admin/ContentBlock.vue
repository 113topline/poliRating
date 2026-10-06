<script setup>
import { ref } from 'vue'

const props = defineProps({
  block: { type: Object, required: true },
  index: { type: Number, required: true },
  isFirst: { type: Boolean, default: false },
  isLast:  { type: Boolean, default: false },
})

const emit = defineEmits(['update', 'move-up', 'move-down', 'remove'])

// ── Helpers de campo simples (parágrafo / heading) ───────────────────────────
function updateField(field, value) {
  emit('update', { ...props.block, [field]: value })
}

// ── Gerenciamento de imagens do carrossel ────────────────────────────────────
// O bloco image tem: { id, type: 'image', caption, images: [{ url, file, previewUrl }] }

function imageList() {
  return props.block.images ?? []
}

// Adiciona slot vazio
function addImageSlot() {
  emit('update', {
    ...props.block,
    images: [...imageList(), { url: '', file: null, previewUrl: '' }],
  })
}

// Abre o file-input do slot i
const fileInputs = ref([])

function chooseFile(i) {
  fileInputs.value[i]?.click()
}

function handleFile(i, event) {
  const file = event.target.files?.[0]
  if (!file) return
  const previewUrl = URL.createObjectURL(file)
  const updated = imageList().map((img, idx) =>
    idx === i ? { ...img, file, previewUrl } : img
  )
  emit('update', { ...props.block, images: updated })
}

function updateCaption(caption) {
  emit('update', { ...props.block, caption })
}

function removeImage(i) {
  const updated = imageList().filter((_, idx) => idx !== i)
  emit('update', { ...props.block, images: updated })
}

function moveImageLeft(i) {
  if (i === 0) return
  const list = [...imageList()]
  ;[list[i - 1], list[i]] = [list[i], list[i - 1]]
  emit('update', { ...props.block, images: list })
}

function moveImageRight(i) {
  const list = imageList()
  if (i === list.length - 1) return
  const arr = [...list]
  ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
  emit('update', { ...props.block, images: arr })
}
</script>

<template>
  <article class="content-block">
    <!-- Toolbar comum -->
    <div class="block-toolbar">
      <span class="block-type font-title">
        {{ block.type === 'paragraph' ? '¶ Parágrafo' : block.type === 'heading' ? 'T Título' : '🖼 Carrossel de Imagens' }}
      </span>
      <div class="toolbar-actions">
        <button type="button" title="Mover para cima"  :disabled="isFirst" @click="emit('move-up', index)">↑</button>
        <button type="button" title="Mover para baixo" :disabled="isLast"  @click="emit('move-down', index)">↓</button>
        <button type="button" title="Apagar bloco" class="delete-btn" @click="emit('remove', index)">×</button>
      </div>
    </div>

    <!-- Parágrafo -->
    <textarea
      v-if="block.type === 'paragraph'"
      :value="block.content"
      class="block-textarea font-body"
      rows="5"
      placeholder="Escreva o parágrafo do review..."
      @input="updateField('content', $event.target.value)"
    />

    <!-- Heading -->
    <input
      v-else-if="block.type === 'heading'"
      :value="block.content"
      class="block-heading font-title"
      type="text"
      placeholder="Título da seção..."
      @input="updateField('content', $event.target.value)"
    />

    <!-- Carrossel de imagens -->
    <div v-else class="image-block">

      <input
        :value="block.caption || ''"
        type="text"
        class="caption-input font-title"
        placeholder="Legenda do carrossel (opcional)"
        @input="updateCaption($event.target.value)"
      />

      <!-- Lista de slots de imagem -->
      <div class="image-slots">
        <div
          v-for="(img, i) in imageList()"
          :key="i"
          class="image-slot"
        >
          <!-- File input oculto, referenciado pelo índice -->
          <input
            :ref="el => { if (el) fileInputs[i] = el }"
            type="file"
            accept="image/*"
            hidden
            @change="handleFile(i, $event)"
          />

          <!-- Prévia ou placeholder -->
          <div class="slot-preview" @click="chooseFile(i)">
            <img
              v-if="img.previewUrl || img.url"
              :src="img.previewUrl || img.url"
              alt="Prévia"
              class="slot-img"
            />
            <div v-else class="slot-placeholder font-body">
              Clique para selecionar imagem
            </div>
          </div>

          <!-- Ações do slot -->
          <div class="slot-footer">
            <div class="slot-actions">
              <button type="button" title="Mover para a esquerda" :disabled="i === 0" @click="moveImageLeft(i)">←</button>
              <button type="button" title="Mover para a direita"  :disabled="i === imageList().length - 1" @click="moveImageRight(i)">→</button>
              <button type="button" class="delete-btn" title="Remover esta imagem" @click="removeImage(i)">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Botão para adicionar nova imagem ao carrossel -->
      <button type="button" class="add-image-btn font-body" @click="addImageSlot">
        + Adicionar imagem
      </button>

      <p v-if="imageList().length === 0" class="empty-hint font-body">
        Nenhuma imagem adicionada ainda. Clique em "+ Adicionar imagem" para começar.
      </p>
    </div>
  </article>
</template>

<style scoped>
.content-block {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-surface);
}

/* ── Toolbar ────────────────────────────────────────────────────────────────── */
.block-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.75rem;
  background: var(--bg-site);
  border-bottom: 1px solid var(--border-color);
}

.block-type {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.toolbar-actions {
  display: flex;
  gap: 0.3rem;
}

.toolbar-actions button {
  width: 28px;
  height: 26px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-surface);
  cursor: pointer;
  color: var(--text-main);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.toolbar-actions button:hover:not(:disabled) {
  background: var(--bg-surface-hover);
}

.toolbar-actions button:disabled {
  color: var(--text-subtle);
  cursor: not-allowed;
  opacity: 0.4;
}

.toolbar-actions .delete-btn {
  color: var(--accent-red);
  font-size: 1.1rem;
}

/* ── Texto / Heading ─────────────────────────────────────────────────────────── */
.block-textarea, .block-heading {
  width: 100%;
  border: 0;
  outline: 0;
  resize: vertical;
  display: block;
  font: inherit;
  background: var(--bg-surface);
  color: var(--text-main);
}

.block-textarea {
  padding: 0.85rem;
  line-height: 1.6;
  min-height: 110px;
}

.block-heading {
  padding: 0.85rem;
  font-size: 1.25rem;
  font-weight: 700;
}

/* ── Bloco de imagens ────────────────────────────────────────────────────────── */
.image-block {
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.image-slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.image-slot {
  border: 1px solid var(--border-color);
  border-radius: 7px;
  overflow: hidden;
  background: var(--bg-site);
  display: flex;
  flex-direction: column;
}

/* Área de prévia clicável */
.slot-preview {
  height: 150px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-site);
  transition: background 0.15s;
}

.slot-preview:hover {
  background: var(--bg-surface-hover);
}

.slot-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.slot-placeholder {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
  padding: 0.5rem;
}

/* Rodapé do slot: legenda + botões */
.slot-footer {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.caption-input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  font-size: 0.8rem;
  padding: 0.35rem 0.55rem;
  background: var(--bg-surface);
  color: var(--text-main);
  outline: none;
  box-sizing: border-box;
}

.caption-input:focus {
  border-color: var(--text-main);
}

.slot-actions {
  display: flex;
  gap: 0.3rem;
}

.slot-actions button {
  flex: 1;
  height: 24px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-surface);
  color: var(--text-main);
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.slot-actions button:hover:not(:disabled) {
  background: var(--bg-surface-hover);
}

.slot-actions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.slot-actions .delete-btn {
  color: var(--accent-red);
  font-size: 1rem;
}

/* Botão + Adicionar imagem */
.add-image-btn {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  border: 1px dashed var(--border-color);
  border-radius: 7px;
  background: var(--bg-site);
  color: var(--text-main);
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.add-image-btn:hover {
  background: var(--bg-surface-hover);
  border-color: var(--text-main);
}

.empty-hint {
  font-size: 0.82rem;
  color: var(--text-subtle);
  margin: 0;
}
</style>
