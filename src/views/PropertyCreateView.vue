<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next'
import propertyService from '../services/propertyService'
import provinceService, { type Province } from '../services/provinceService'
import { useToastNotification } from '../utils/toast'
import { roomTypeOptions } from '../utils/helpers'

const router = useRouter()
const toast = useToastNotification()

const loading = ref(false)
const provinces = ref<Province[]>([])

const formData = ref({
  propertyName: '',
  type: '' as number | '',
  province: '' as number | '',
  address: '',
  description: '',
  ownerID: '',
  ownerName: '',
  listRoomType: [
    {
      name: '',
      description: '',
      price: 0,
      capacity: 0,
      facility: '',
      floor: 0,
      unitCount: 1,
      listRoom: [] as { name: string; availabilityStatus: number }[],
    },
  ],
})

const roomTypeOptionsForType = computed(() => {
  if (!formData.value.type) return []
  return roomTypeOptions[formData.value.type as keyof typeof roomTypeOptions] || []
})

const fetchProvinces = async () => {
  try {
    provinces.value = await provinceService.getProvinces()
  } catch (error) {
    console.error('Error fetching provinces:', error)
    toast.error('Gagal memuat data provinsi')
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
  // Check basic fields
  if (
    !formData.value.propertyName ||
    !formData.value.type ||
    !formData.value.province ||
    !formData.value.address ||
    !formData.value.description ||
    !formData.value.ownerID ||
    !formData.value.ownerName
  ) {
    toast.error('Semua field properti harus diisi')
    return false
  }

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

  // Check for duplicate property-roomType-floor combination
  const combinations = new Set()
  for (const roomType of formData.value.listRoomType) {
    const key = `${roomType.name}-${roomType.floor}`
    if (combinations.has(key)) {
      toast.error(`Duplikasi tipe kamar "${roomType.name}" di lantai ${roomType.floor}`)
      return false
    }
    combinations.add(key)
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

    const payload = {
      ...formData.value,
      type: formData.value.type as number,
      province: formData.value.province as number,
    }

    await propertyService.createProperty(payload)
    toast.success('Properti berhasil ditambahkan')
    router.push('/property')
  } catch (error: any) {
    console.error('Error creating property:', error)
    const message = error.response?.data?.message || 'Gagal menambahkan properti'
    toast.error(message)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/property')
}

onMounted(() => {
  fetchProvinces()
})
</script>

<template>
  <div class="create-container">
    <div class="create-header">
      <button class="btn-back" @click="goBack">
        <ArrowLeft :size="20" />
        Kembali
      </button>
      <h1>Tambah Properti Baru</h1>
    </div>

    <form @submit.prevent="submitForm" class="create-form">
      <!-- Property Information -->
      <div class="form-section">
        <h2>Informasi Properti</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nama Properti *</label>
            <input v-model="formData.propertyName" type="text" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Tipe *</label>
            <select v-model.number="formData.type" class="form-select" required>
              <option value="">Pilih Tipe</option>
              <option :value="1">Hotel</option>
              <option :value="2">Villa</option>
              <option :value="3">Apartemen</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Provinsi *</label>
          <select v-model.number="formData.province" class="form-select" required>
            <option value="">Pilih Provinsi</option>
            <option v-for="province in provinces" :key="province.kode" :value="Number(province.kode)">
              {{ province.nama }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Alamat *</label>
          <textarea v-model="formData.address" class="form-textarea" rows="3" required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi *</label>
          <textarea v-model="formData.description" class="form-textarea" rows="3" required></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">ID Pemilik (UUID) *</label>
            <input v-model="formData.ownerID" type="text" class="form-input" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
          </div>

          <div class="form-group">
            <label class="form-label">Nama Pemilik *</label>
            <input v-model="formData.ownerName" type="text" class="form-input" required />
          </div>
        </div>
      </div>

      <!-- Room Types -->
      <div class="form-section">
        <div class="section-header">
          <h2>Tipe Kamar</h2>
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
            <button type="button" class="btn-remove" @click="removeRoomType(index)" v-if="formData.listRoomType.length > 1">
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
              <input v-model="roomType.facility" type="text" class="form-input" placeholder="AC, WiFi, TV" required />
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
</template>

<style scoped>
.create-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  background: var(--bg-dark);
}

.create-header {
  margin-bottom: 2rem;
}

.create-header h1 {
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
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: rgba(212, 165, 116, 0.1);
  border-color: var(--primary-gold);
}

.create-form {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--border-color);
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h2 {
  font-size: 1.5rem;
  color: var(--primary-gold);
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-add-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-dark-gold);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-type:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(212, 165, 116, 0.4);
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
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-dark);
  color: var(--text-primary);
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
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
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
  .create-container {
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
