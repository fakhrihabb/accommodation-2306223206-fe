<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import propertyService, { type UpdatePropertyData, type Property } from '../services/propertyService'
import provinceService, { type Province } from '../services/provinceService'
import { useToastNotification } from '../utils/toast'
import { getPropertyTypeName } from '../utils/helpers'

const router = useRouter()
const route = useRoute()
const toast = useToastNotification()

const loading = ref(false)
const fetchLoading = ref(true)
const provinces = ref<Province[]>([])

const propertyId = route.params.id as string

const formData = ref<UpdatePropertyData>({
  propertyID: propertyId,
  propertyName: '',
  address: '',
  description: '',
  listRoomType: [],
})

// Original property data for display-only fields
const originalProperty = ref<Property | null>(null)

// Computed property for province name
const provinceName = computed(() => {
  if (!originalProperty.value?.province) return ''
  const province = provinces.value.find((p) => Number(p.kode) === originalProperty.value?.province)
  return province?.nama || `Kode: ${originalProperty.value.province}`
})

const fetchProvinces = async () => {
  try {
    provinces.value = await provinceService.getProvinces()
  } catch (error) {
    console.error('Error fetching provinces:', error)
    // Don't show error toast, just log it
  }
}

const fetchPropertyData = async () => {
  try {
    fetchLoading.value = true
    const data = await propertyService.getPropertyDetail(propertyId)
    originalProperty.value = data

    // Populate form with existing data - ensure all fields are properly mapped
    formData.value = {
      propertyID: data.propertyID,
      propertyName: data.propertyName,
      address: data.address,
      description: data.description,
      listRoomType:
        data.listRoomType?.map((roomType) => ({
          roomTypeID: roomType.roomTypeID,
          name: roomType.name,
          capacity: roomType.capacity || 0,
          price: roomType.price || 0,
          description: roomType.description || '',
          facility: roomType.facility || '',
          floor: roomType.floor || 0,
        })) || [],
    }
    
    console.log('Fetched property data:', data)
    console.log('Form data populated:', formData.value)
  } catch (error) {
    console.error('Error fetching property data:', error)
    toast.error('Gagal memuat data properti')
    router.push('/property')
  } finally {
    fetchLoading.value = false
  }
}

const validateForm = () => {
  // Check basic fields
  if (!formData.value.propertyName || !formData.value.address || !formData.value.description) {
    toast.error('Nama, alamat, dan deskripsi properti harus diisi')
    return false
  }

  // Check room types
  for (const roomType of formData.value.listRoomType) {
    if (
      !roomType.name ||
      !roomType.description ||
      roomType.price <= 0 ||
      roomType.capacity <= 0 ||
      !roomType.facility
    ) {
      toast.error('Semua field tipe kamar harus diisi dengan benar')
      return false
    }
  }

  return true
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    await propertyService.updateProperty(formData.value)
    toast.success('Properti berhasil diupdate')
    router.push(`/property/${propertyId}`)
  } catch (error) {
    console.error('Error updating property:', error)
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal mengupdate properti'
    toast.error(message)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push(`/property/${propertyId}`)
}

onMounted(() => {
  fetchProvinces()
  fetchPropertyData()
})
</script>

<template>
  <div class="update-container">
    <div class="update-header">
      <button class="btn-back" @click="goBack">
        <ArrowLeft :size="20" />
        Kembali
      </button>
      <h1>Update Properti</h1>
    </div>

    <div v-if="fetchLoading" class="loading">
      <div class="spinner"></div>
      <p>Memuat data properti...</p>
    </div>

    <form v-else @submit.prevent="submitForm" class="update-form">
      <!-- Read-Only Property Information -->
      <div class="form-section readonly-section">
        <h2>Informasi Properti (Tidak dapat diubah)</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">ID Properti</label>
            <input :value="originalProperty?.propertyID" type="text" class="form-input readonly" readonly />
          </div>

          <div class="form-group">
            <label class="form-label">Tipe</label>
            <input
              :value="getPropertyTypeName(originalProperty?.type || 0)"
              type="text"
              class="form-input readonly"
              readonly
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Provinsi</label>
            <input :value="provinceName" type="text" class="form-input readonly" readonly />
          </div>

          <div class="form-group">
            <label class="form-label">Status</label>
            <input
              :value="originalProperty?.activeStatus === 1 ? 'Aktif' : 'Tidak Aktif'"
              type="text"
              class="form-input readonly"
              readonly
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Pemilik</label>
            <input :value="originalProperty?.ownerName" type="text" class="form-input readonly" readonly />
          </div>

          <div class="form-group">
            <label class="form-label">ID Pemilik</label>
            <input :value="originalProperty?.ownerID" type="text" class="form-input readonly" readonly />
          </div>
        </div>
      </div>

      <!-- Editable Property Information -->
      <div class="form-section">
        <h2>Informasi Properti (Dapat diubah)</h2>

        <div class="form-group">
          <label class="form-label">Nama Properti *</label>
          <input v-model="formData.propertyName" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Alamat *</label>
          <textarea v-model="formData.address" class="form-textarea" rows="3" required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi *</label>
          <textarea v-model="formData.description" class="form-textarea" rows="3" required></textarea>
        </div>
      </div>

      <!-- Room Types -->
      <div class="form-section">
        <h2>Tipe Kamar</h2>

        <div v-for="roomType in formData.listRoomType" :key="roomType.roomTypeID" class="room-type-form">
          <div class="room-type-header">
            <h3>{{ roomType.name }} - Lantai {{ roomType.floor }}</h3>
            <span class="room-type-id">ID: {{ roomType.roomTypeID }}</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama Tipe Kamar</label>
              <input :value="roomType.name" type="text" class="form-input readonly" readonly />
            </div>

            <div class="form-group">
              <label class="form-label">Lantai</label>
              <input :value="roomType.floor" type="number" class="form-input readonly" readonly />
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

          <div class="form-group">
            <label class="form-label">Fasilitas *</label>
            <input v-model="roomType.facility" type="text" class="form-input" placeholder="AC, WiFi, TV" required />
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
          {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.update-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.update-header {
  margin-bottom: 2rem;
}

.update-header h1 {
  font-size: 2rem;
  color: var(--neutral-dark);
  margin-top: 1rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #f8f9fa;
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

.update-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h2 {
  font-size: 1.5rem;
  color: var(--primary-blue);
  margin-bottom: 1.5rem;
}

.readonly-section {
  background: var(--gradient-light);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
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
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.form-input.readonly {
  background: #f8f9fa;
  color: var(--text-secondary);
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.room-type-form {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid var(--primary-tosca);
}

.room-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.room-type-header h3 {
  font-size: 1.2rem;
  color: var(--neutral-dark);
}

.room-type-id {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: monospace;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
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
  .update-container {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
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
