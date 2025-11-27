<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next'
import propertyService, { type Property, type AddRoomTypeData } from '../services/propertyService'
import { useToastNotification } from '../utils/toast'
import { roomTypeOptions } from '../utils/helpers'

const router = useRouter()
const route = useRoute()
const toast = useToastNotification()

const loading = ref(false)
const fetchLoading = ref(true)

const propertyId = route.params.id as string
const property = ref<Property | null>(null)

const formData = ref<AddRoomTypeData>({
  propertyID: propertyId,
  listRoomType: [
    {
      name: '',
      description: '',
      price: 0,
      capacity: 0,
      facility: '',
      floor: 0,
      unitCount: 1,
      listRoom: [],
    },
  ],
})

const roomTypeOptionsForType = computed(() => {
  // Backend returns 'propertyType' field, not 'type'
  const type = property.value?.propertyType || property.value?.type
  if (!type) return []
  const propertyType = Number(type)
  return roomTypeOptions[propertyType as keyof typeof roomTypeOptions] || []
})

const fetchPropertyData = async () => {
  try {
    fetchLoading.value = true
    const data = await propertyService.getAddRoomTypeForm(propertyId)
    property.value = data
    // Backend already validates property activeStatus - no need to check here
  } catch (error: any) {
    console.error('Error fetching property data:', error)
    // Show backend error message if available
    const message = error.response?.data?.message || 'Gagal memuat data properti'
    toast.error(message)
    router.push('/property')
  } finally {
    fetchLoading.value = false
  }
}

const addRoomType = () => {
  formData.value.listRoomType.push({
    name: '',
    description: '',
    price: 0,
    capacity: 0,
    facility: '',
    floor: 0,
    unitCount: 1,
    listRoom: [],
  })
}

const removeRoomType = (index: number) => {
  if (formData.value.listRoomType.length > 1) {
    formData.value.listRoomType.splice(index, 1)
  } else {
    toast.warning('Minimal harus ada 1 tipe kamar')
  }
}

const updateRoomList = (roomTypeIndex: number) => {
  const roomType = formData.value.listRoomType[roomTypeIndex]
  if (!roomType) return

  const unitCount = roomType.unitCount
  const floor = roomType.floor

  // Generate room list based on unit count
  roomType.listRoom = []
  for (let i = 1; i <= unitCount; i++) {
    const roomNumber = `${floor}${String(i).padStart(2, '0')}`
    roomType.listRoom.push({
      name: roomNumber,
      availabilityStatus: 1,
    })
  }
}

const validateForm = () => {
  // Check room types
  if (formData.value.listRoomType.length === 0) {
    toast.error('Minimal harus ada 1 tipe kamar')
    return false
  }

  // Check each room type
  for (const roomType of formData.value.listRoomType) {
    if (
      !roomType.name ||
      !roomType.description ||
      roomType.price <= 0 ||
      roomType.capacity <= 0 ||
      !roomType.facility ||
      roomType.floor <= 0 ||
      roomType.unitCount <= 0
    ) {
      toast.error('Semua field tipe kamar harus diisi dengan benar')
      return false
    }
  }

  // Check for duplicate property-roomType-floor combination with existing room types
  const existingCombinations = new Set(
    property.value?.listRoomType?.map((rt) => `${rt.name}-${rt.floor}`) || []
  )

  const newCombinations = new Set()
  for (const roomType of formData.value.listRoomType) {
    const key = `${roomType.name}-${roomType.floor}`

    // Check against existing room types
    if (existingCombinations.has(key)) {
      toast.error(`Duplikasi dengan tipe kamar yang sudah ada: "${roomType.name}" di lantai ${roomType.floor}`)
      return false
    }

    // Check against new room types being added
    if (newCombinations.has(key)) {
      toast.error(`Duplikasi tipe kamar baru: "${roomType.name}" di lantai ${roomType.floor}`)
      return false
    }

    newCombinations.add(key)
  }

  return true
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    loading.value = true

    // Update room lists for all room types
    formData.value.listRoomType.forEach((_, index) => {
      updateRoomList(index)
    })

    await propertyService.addRoomType(formData.value)
    toast.success('Tipe kamar berhasil ditambahkan')
    router.push(`/property/${propertyId}`)
  } catch (error: any) {
    console.error('Error adding room type:', error)
    const message = error.response?.data?.message || 'Gagal menambahkan tipe kamar'
    toast.error(message)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push(`/property/${propertyId}`)
}

onMounted(() => {
  fetchPropertyData()
})
</script>

<template>
  <div class="addroom-container">
    <div class="addroom-header">
      <button class="btn-back" @click="goBack">
        <ArrowLeft :size="20" />
        Kembali
      </button>
      <h1>Tambah Tipe Kamar</h1>
    </div>

    <div v-if="fetchLoading" class="loading">
      <div class="spinner"></div>
      <p>Memuat data properti...</p>
    </div>

    <div v-else>
      <!-- Property Info -->
      <div class="info-card">
        <h2>Properti: {{ property?.propertyName }}</h2>
        <div class="property-info">
          <span><strong>ID:</strong> {{ property?.propertyID }}</span>
          <span><strong>Tipe:</strong> {{ property?.type === 1 ? 'Hotel' : property?.type === 2 ? 'Villa' : 'Apartemen' }}</span>
          <span><strong>Total Kamar Saat Ini:</strong> {{ property?.totalRoom }}</span>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="addroom-form">
        <!-- Room Types -->
        <div class="form-section">
          <div class="section-header">
            <h2>Tambah Tipe Kamar Baru</h2>
            <button type="button" class="btn-add-type" @click="addRoomType">
              <Plus :size="20" />
              Tambah Tipe
            </button>
          </div>

          <div
            v-for="(roomType, index) in formData.listRoomType"
            :key="index"
            class="room-type-form"
          >
            <div class="room-type-header">
              <h3>Tipe Kamar {{ index + 1 }}</h3>
              <button
                type="button"
                class="btn-remove"
                @click="removeRoomType(index)"
                v-if="formData.listRoomType.length > 1"
              >
                <Trash2 :size="18" />
                Hapus
              </button>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nama Tipe Kamar *</label>
                <select v-model="roomType.name" class="form-select" required>
                  <option value="">Pilih Tipe Kamar</option>
                  <option v-for="option in roomTypeOptionsForType" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Fasilitas *</label>
                <input
                  v-model="roomType.facility"
                  type="text"
                  class="form-input"
                  placeholder="AC, WiFi, TV"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Kapasitas *</label>
                <input v-model.number="roomType.capacity" type="number" class="form-input" min="1" required />
              </div>

              <div class="form-group">
                <label class="form-label">Harga (per malam) *</label>
                <input v-model.number="roomType.price" type="number" class="form-input" min="0" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Lantai *</label>
                <input v-model.number="roomType.floor" type="number" class="form-input" min="1" required />
              </div>

              <div class="form-group">
                <label class="form-label">Jumlah Unit *</label>
                <input v-model.number="roomType.unitCount" type="number" class="form-input" min="1" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Deskripsi *</label>
              <textarea v-model="roomType.description" class="form-textarea" rows="2" required></textarea>
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="goBack">Batal</button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.addroom-container {
  background: var(--bg-dark);
  min-height: calc(100vh - 80px);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.addroom-header {
  margin-bottom: 2rem;
}

.addroom-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-top: 1rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: rgba(212, 165, 116, 0.1);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-secondary);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.info-card {
  background: var(--gradient-light);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.info-card h2 {
  font-size: 1.5rem;
  color: var(--primary-gold);
  margin-bottom: 1rem;
}

.property-info {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.property-info span {
  color: var(--text-primary);
  font-size: 0.95rem;
}

.addroom-form {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.form-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: var(--primary-gold);
}

.btn-add-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-tosca);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-type:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(32, 178, 170, 0.3);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-dark);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-gold);
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.room-type-form {
  background: rgba(212, 165, 116, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.room-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.room-type-header h3 {
  font-size: 1.2rem;
  color: var(--text-primary);
}

.btn-remove {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  background: #c82333;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-submit {
  background: var(--gradient-primary);
  color: white;
}

.btn-cancel:hover,
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .addroom-container {
  background: var(--bg-dark);
  min-height: calc(100vh - 80px);
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .btn-add-type {
    width: 100%;
    justify-content: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>
