import { db, storage } from './config'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

const REVIEWS = 'reviews'
const SETTINGS = 'settings'
const SITE_DOC = 'site'

// -- Image Compression & Storage Helpers --------------------------------------

/**
 * Compresses an image file before upload.
 * Max resolution: 1080x1440 while maintaining aspect ratio.
 */
export async function compressImage(file, maxWidth = 1440, maxHeight = 1080, quality = 0.95) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file
  }
  if (file.type === 'image/svg+xml') {
    return file
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        let width = img.width
        let height = img.height

        const isLandscape = width >= height
        const targetMaxWidth = isLandscape ? Math.max(maxWidth, maxHeight) : Math.min(maxWidth, maxHeight)
        const targetMaxHeight = isLandscape ? Math.min(maxWidth, maxHeight) : Math.max(maxWidth, maxHeight)

        const widthScale = width / targetMaxWidth
        const heightScale = height / targetMaxHeight
        const scale = Math.max(widthScale, heightScale)

        if (scale > 1) {
          width = Math.round(width / scale)
          height = Math.round(height / scale)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        const mimeType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg'

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            const extension = mimeType === 'image/webp' ? '.webp' : '.jpg'
            const sanitizedBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_')
            const newName = sanitizedBaseName + extension
            const compressedFile = new File([blob], newName, {
              type: mimeType,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          },
          mimeType,
          quality
        )
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
}

/**
 * Extracts all Firebase Storage image URLs from a review document object.
 */
export function extractImageUrls(data) {
  const urls = []
  if (!data) return urls

  if (data.heroImage && typeof data.heroImage === 'string') {
    urls.push(data.heroImage)
  }

  if (Array.isArray(data.blocks)) {
    for (const block of data.blocks) {
      if (block.type === 'image') {
        if (block.url && typeof block.url === 'string') {
          urls.push(block.url)
        }
        if (Array.isArray(block.images)) {
          for (const img of block.images) {
            if (img && img.url && typeof img.url === 'string') {
              urls.push(img.url)
            }
          }
        }
      }
    }
  }

  return urls
}

/**
 * Deletes an image from Firebase Storage using its download URL.
 */
export async function deleteImageByUrl(url) {
  if (!url || typeof url !== 'string') return
  if (!url.includes('firebasestorage.googleapis.com') && !url.includes('storage.googleapis.com')) return
  try {
    const ref = storageRef(storage, url)
    await deleteObject(ref)
  } catch (err) {
    console.warn('Could not delete image from Storage:', url, err?.message || err)
  }
}

// -- Reviews ------------------------------------------------------------------

export async function getReviews({ category = null, onlyPublished = true, limitN = 20 } = {}) {
  const constraints = []
  if (onlyPublished) constraints.push(where('published', '==', true))
  if (category) constraints.push(where('category', '==', category))
  // Nota: sem orderBy no Firestore para evitar exigência de índice composto;
  // a ordenação é feita client-side por publishedAt desc.
  if (!category && limitN) constraints.push(limit(limitN * 3)) // margem para cobrir docs sem publishedAt

  const q = query(collection(db, REVIEWS), ...constraints)
  const snap = await getDocs(q)
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Pinados sempre por primeiro; dentro de cada grupo, ordena por publishedAt desc
  docs.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    const tsA = a.publishedAt?.toMillis?.() ?? a.publishedAt ?? 0
    const tsB = b.publishedAt?.toMillis?.() ?? b.publishedAt ?? 0
    return tsB - tsA
  })

  return limitN ? docs.slice(0, limitN) : docs
}

export async function getAllReviews() {
  const q = query(collection(db, REVIEWS), orderBy('publishedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getReview(id) {
  const snap = await getDoc(doc(db, REVIEWS, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function createReview(data) {
  // publishedAt só recebe timestamp se o review já nasce publicado;
  // caso contrário fica null para não interferir na ordenação
  return addDoc(collection(db, REVIEWS), {
    ...data,
    publishedAt: data.published ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
  })
}

export async function updateReview(id, data) {
  const updatePayload = {
    ...data,
    updatedAt: serverTimestamp(),
  }
  // Se está sendo publicado agora, grava o timestamp de publicação
  // (não sobrescreve se já existe, para preservar a data original)
  if (data.published) {
    const snap = await getDoc(doc(db, REVIEWS, id))
    if (snap.exists() && !snap.data().publishedAt) {
      updatePayload.publishedAt = serverTimestamp()
    }
  }
  return updateDoc(doc(db, REVIEWS, id), updatePayload)
}

export async function deleteReview(id) {
  try {
    const snap = await getDoc(doc(db, REVIEWS, id))
    if (snap.exists()) {
      const urls = extractImageUrls(snap.data())
      await Promise.all(urls.map(url => deleteImageByUrl(url)))
    }
  } catch (err) {
    console.warn('Could not clean up images before deleting review:', err)
  }
  return deleteDoc(doc(db, REVIEWS, id))
}

// -- Storage ------------------------------------------------------------------

export async function uploadImage(file, path) {
  const compressedFile = await compressImage(file, 1440, 1080, 0.95)
  const ref = storageRef(storage, path)
  await uploadBytes(ref, compressedFile)
  return getDownloadURL(ref)
}

export async function deleteImage(path) {
  const ref = storageRef(storage, path)
  return deleteObject(ref)
}

// -- Site Settings ------------------------------------------------------------

const SETTINGS_DOC_ID = '_site_settings'

export async function getSiteSettings() {
  try {
    const snap = await getDoc(doc(db, REVIEWS, SETTINGS_DOC_ID))
    if (snap.exists()) return snap.data()
  } catch (err) {
    console.warn('Could not fetch settings from reviews collection:', err)
  }

  // Fallback para caminho antigo 'settings/site' caso ainda exista
  try {
    const snap = await getDoc(doc(db, SETTINGS, SITE_DOC))
    if (snap.exists()) return snap.data()
  } catch (err) {
    // Silencioso se não houver permissão no caminho antigo
  }
  return {}
}

export async function updateSiteSettings(data) {
  // Salva na coleção 'reviews' para respeitar as regras de segurança do Firestore
  return setDoc(doc(db, REVIEWS, SETTINGS_DOC_ID), data, { merge: true })
}

export async function uploadHeroImage(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `reviews/hero-site-${Date.now()}-${safeName}`
  return uploadImage(file, path)
}

// -- Pin / Unpin Review -------------------------------------------------------

export async function togglePinReview(id, pinned) {
  return updateDoc(doc(db, REVIEWS, id), { pinned })
}
