import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getReviews,
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  uploadImage,
  getSiteSettings,
  updateSiteSettings,
  uploadHeroImage,
  togglePinReview,
  extractImageUrls,
  deleteImageByUrl,
} from '../firebase/firestore'

export const useReviewsStore = defineStore('reviews', () => {
  const reviews = ref([])
  const currentReview = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const siteSettings = ref({})
  const settingsLoading = ref(false)

  async function fetchPublicReviews(options) {
    loading.value = true
    error.value = null
    try {
      reviews.value = await getReviews(options)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchAllReviews() {
    loading.value = true
    error.value = null
    try {
      reviews.value = await getAllReviews()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchReview(id) {
    loading.value = true
    error.value = null
    try {
      currentReview.value = await getReview(id)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function saveReview(data, heroImageFile = null) {
    let heroImage = data.heroImage || ''
    if (heroImageFile) {
      const path = `reviews/hero-${Date.now()}-${heroImageFile.name}`
      heroImage = await uploadImage(heroImageFile, path)
    }

    const payload = { ...data, heroImage }

    if (data.id) {
      const existingReview = await getReview(data.id)
      if (existingReview) {
        const oldUrls = extractImageUrls(existingReview)
        const newUrls = extractImageUrls(payload)
        const unusedUrls = oldUrls.filter(u => !newUrls.includes(u))
        await Promise.all(unusedUrls.map(u => deleteImageByUrl(u)))
      }
      const { id, ...rest } = payload
      await updateReview(id, rest)
      return id
    } else {
      const docRef = await createReview(payload)
      return docRef.id
    }
  }

  async function removeReview(id) {
    await deleteReview(id)
    reviews.value = reviews.value.filter(r => r.id !== id)
  }

  async function fetchSiteSettings() {
    settingsLoading.value = true
    try {
      siteSettings.value = await getSiteSettings()
    } catch (e) {
      // silently fail — settings are optional
    } finally {
      settingsLoading.value = false
    }
  }

  async function saveSiteSettings(data, heroFile = null) {
    settingsLoading.value = true
    try {
      const oldHeroImage = siteSettings.value.heroImage || ''
      let heroImage = data.heroImage ?? siteSettings.value.heroImage ?? ''
      if (heroFile) {
        heroImage = await uploadHeroImage(heroFile)
        if (oldHeroImage && oldHeroImage !== heroImage) {
          await deleteImageByUrl(oldHeroImage)
        }
      }
      const payload = { ...data, heroImage }
      await updateSiteSettings(payload)
      siteSettings.value = { ...siteSettings.value, ...payload }
    } finally {
      settingsLoading.value = false
    }
  }

  async function pinReview(id, pinned) {
    await togglePinReview(id, pinned)
    const r = reviews.value.find(r => r.id === id)
    if (r) r.pinned = pinned
  }

  return {
    reviews,
    currentReview,
    loading,
    error,
    siteSettings,
    settingsLoading,
    fetchPublicReviews,
    fetchAllReviews,
    fetchReview,
    saveReview,
    removeReview,
    fetchSiteSettings,
    saveSiteSettings,
    pinReview,
  }
})
