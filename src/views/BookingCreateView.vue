<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Calendar, DollarSign, User } from 'lucide-vue-next'
import bookingService, { type CreateBookingData } from '../services/bookingService'
import propertyService from '../services/propertyService'
import { useToastNotification } from '../utils/toast'
import { formatCurrency } from '../utils/helpers'

const router = useRouter()
const route = useRoute()
const toast = useToastNotification()

const loading = ref(false)
const fetchLoading = ref(true)

// Check if roomId is provided in route params
const roomId = route.params.roomId as string | undefined
const withRoom = !!roomId

// For mode with room
const roomData = ref<any>(null)

// For mode without room
const properties = ref<any[]>([])
const selectedPropertyId = ref('')
const selectedRoomTypeId = ref('')
const selectedRoomId = ref('')

const roomTypes = ref<any[]>([])
const availableRooms = ref<any[]>([])

// Form data
const formData = ref<CreateBookingData>({
  roomID: '',
  roomName: '',
  checkinDate: '',
  checkoutDate: '',
  customerID: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  isBreakfast: false,
  capacity: 1,
})

const totalDays = computed(() => {
  if (!formData.value.checkinDate || !formData.value.checkoutDate) return 0
  const checkin = new Date(formData.value.checkinDate)
  const checkout = new Date(formData.value.checkoutDate)
  const diff = checkout.getTime() - checkin.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const pricePerNight = computed(() => {
  if (withRoom && roomData.value) {
    return roomData.value.price || 0
  }

  if (selectedRoomId.value) {
    const room = availableRooms.value.find((r) => r.roomID === selectedRoomId.value)
    return room?.price || 0
  }

  return 0
})

const breakfastCost = computed(() => {
  return formData.value.isBreakfast ? 50000 * totalDays.value : 0
})

const totalPrice = computed(() => {
  return pricePerNight.value * totalDays.value + breakfastCost.value
})

const maxCapacity = computed(() => {
  if (withRoom && roomData.value) {
    return roomData.value.capacity || 1
  }

  if (selectedRoomId.value) {
    const room = availableRooms.value.find((r) => r.roomID === selectedRoomId.value)
    return room?.capacity || 1
  }

  return 1
})

// Fetch data for mode with room
const fetchRoomData = async () => {
  try {
    fetchLoading.value = true
    const data = await bookingService.getCreateBookingForm(roomId)
    roomData.value = data

    // Pre-fill room data
    formData.value.roomID = data.roomID
    formData.value.roomName = data.roomName

    // Pre-fill dates from query params if provided
    const checkinParam = route.query.checkin as string
    const checkoutParam = route.query.checkout as string
    if (checkinParam) formData.value.checkinDate = checkinParam
    if (checkoutParam) formData.value.checkoutDate = checkoutParam
  } catch (error) {
    console.error('Error fetching room data:', error)
    toast.error('Gagal memuat data kamar')
    router.push('/bookings')
  } finally {
    fetchLoading.value = false
  }
}

// Fetch data for mode without room
const fetchProperties = async () => {
  try {
    fetchLoading.value = true
    const data = await propertyService.getAllProperties()
    properties.value = data.filter((p) => p.activeStatus === 1)
  } catch (error) {
    console.error('Error fetching properties:', error)
    toast.error('Gagal memuat data properti')
  } finally {
    fetchLoading.value = false
  }
}

// Watch for property selection
watch(selectedPropertyId, async (propertyId) => {
  if (!propertyId) {
    roomTypes.value = []
    availableRooms.value = []
    selectedRoomTypeId.value = ''
    selectedRoomId.value = ''
    return
  }

  try {
    const property = properties.value.find((p) => p.propertyID === propertyId)
    if (property) {
      const detail = await propertyService.getPropertyDetail(propertyId)
      console.log('Property detail fetched:', detail)
      console.log('Room types:', detail.listRoomType)
      roomTypes.value = detail.listRoomType || []
      selectedRoomTypeId.value = ''
      selectedRoomId.value = ''
      availableRooms.value = []
    }
  } catch (error) {
    console.error('Error fetching property detail:', error)
    toast.error('Gagal memuat tipe kamar')
  }
})

// Watch for room type selection
watch(selectedRoomTypeId, (roomTypeId) => {
  if (!roomTypeId) {
    availableRooms.value = []
    selectedRoomId.value = ''
    return
  }

  const roomType = roomTypes.value.find((rt) => rt.roomTypeID === roomTypeId)
  if (roomType) {
    // Filter available rooms (status 1 = available, activeRoom 1 = active or undefined)
    // Note: activeRoom might not exist in the response, so we check if it's undefined or 1
    availableRooms.value = (roomType.listRoom || [])
      .filter((room: any) => {
        const isAvailable = room.availabilityStatus === 1
        const isActive = room.activeRoom === undefined || room.activeRoom === 1
        console.log('Room filter:', {
          roomName: room.name,
          availabilityStatus: room.availabilityStatus,
          activeRoom: room.activeRoom,
          isAvailable,
          isActive,
          passes: isAvailable && isActive
        })
        return isAvailable && isActive
      })
      .map((room: any) => ({
        ...room,
        price: roomType.price,
        capacity: roomType.capacity,
      }))
    console.log('Available rooms after filter:', availableRooms.value)
    selectedRoomId.value = ''
  }
})

// Watch for room selection
watch(selectedRoomId, (roomId) => {
  if (roomId) {
    const room = availableRooms.value.find((r) => r.roomID === roomId)
    if (room) {
      formData.value.roomID = room.roomID
      formData.value.roomName = room.name
    }
  }
})

const validateForm = () => {
  // Check customer info
  if (
    !formData.value.customerID ||
    !formData.value.customerName ||
    !formData.value.customerEmail ||
    !formData.value.customerPhone
  ) {
    toast.error('Semua informasi customer harus diisi')
    return false
  }

  // Check room selection
  if (!formData.value.roomID) {
    toast.error('Pilih kamar terlebih dahulu')
    return false
  }

  // Check dates
  if (!formData.value.checkinDate || !formData.value.checkoutDate) {
    toast.error('Tanggal check-in dan check-out harus diisi')
    return false
  }

  const checkin = new Date(formData.value.checkinDate)
  const checkout = new Date(formData.value.checkoutDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check-in must be >= today
  if (checkin < today) {
    toast.error('Tanggal check-in tidak boleh di masa lalu')
    return false
  }

  // Check-out must be > check-in
  if (checkout <= checkin) {
    toast.error('Tanggal check-out harus setelah check-in')
    return false
  }

  // Minimum 1 day
  if (totalDays.value < 1) {
    toast.error('Booking minimal 1 hari')
    return false
  }

  // Check capacity
  if (formData.value.capacity < 1 || formData.value.capacity > maxCapacity.value) {
    toast.error(`Kapasitas harus antara 1 dan ${maxCapacity.value}`)
    return false
  }

  return true
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    await bookingService.createBooking(formData.value)
    toast.success('Booking berhasil dibuat')
    router.push('/bookings')
  } catch (error: any) {
    console.error('Error creating booking:', error)
    const message = error.response?.data?.message || 'Gagal membuat booking'
    toast.error(message)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/bookings')
}

onMounted(() => {
  if (withRoom) {
    fetchRoomData()
  } else {
    fetchProperties()
  }
})
</script>

<template>
  <div class="create-container">
    <div class="create-header">
      <button class="btn-back" @click="goBack">
        <ArrowLeft :size="20" />
        Kembali
      </button>
      <h1>Buat Booking Baru</h1>
    </div>

    <div v-if="fetchLoading" class="loading">
      <div class="spinner"></div>
      <p>Memuat data...</p>
    </div>

    <form v-else @submit.prevent="submitForm" class="create-form">
      <!-- Room Selection (Mode without room) -->
      <div v-if="!withRoom" class="form-section">
        <h2>Pilih Kamar</h2>

        <div class="form-group">
          <label class="form-label">Properti *</label>
          <select v-model="selectedPropertyId" class="form-select" required>
            <option value="">Pilih Properti</option>
            <option v-for="property in properties" :key="property.propertyID" :value="property.propertyID">
              {{ property.propertyName }}
            </option>
          </select>
        </div>

        <div v-if="selectedPropertyId" class="form-group">
          <label class="form-label">Tipe Kamar *</label>
          <select v-model="selectedRoomTypeId" class="form-select" required>
            <option value="">Pilih Tipe Kamar</option>
            <option v-for="roomType in roomTypes" :key="roomType.roomTypeID" :value="roomType.roomTypeID">
              {{ roomType.name }} - {{ formatCurrency(roomType.price) }}/malam
            </option>
          </select>
        </div>

        <div v-if="selectedRoomTypeId" class="form-group">
          <label class="form-label">Kamar *</label>
          <select v-model="selectedRoomId" class="form-select" required>
            <option value="">Pilih Kamar</option>
            <option v-for="room in availableRooms" :key="room.roomID" :value="room.roomID">
              {{ room.name }}
            </option>
          </select>
          <p v-if="availableRooms.length === 0 && selectedRoomTypeId" class="helper-text">
            Tidak ada kamar tersedia untuk tipe ini
          </p>
        </div>
      </div>

      <!-- Room Info (Mode with room) -->
      <div v-else class="form-section info-section">
        <h2>Informasi Kamar</h2>
        <div class="room-info">
          <div class="info-item">
            <span class="label">Properti:</span>
            <span class="value">{{ roomData?.propertyName }}</span>
          </div>
          <div class="info-item">
            <span class="label">Kamar:</span>
            <span class="value">{{ roomData?.roomName }}</span>
          </div>
          <div class="info-item">
            <span class="label">Harga:</span>
            <span class="value">{{ formatCurrency(roomData?.price || 0) }}/malam</span>
          </div>
          <div class="info-item">
            <span class="label">Kapasitas Maks:</span>
            <span class="value">{{ roomData?.capacity }} orang</span>
          </div>
        </div>
      </div>

      <!-- Booking Details -->
      <div class="form-section">
        <h2>Detail Booking</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <Calendar :size="18" class="icon" />
              Tanggal Check-in *
            </label>
            <input v-model="formData.checkinDate" type="date" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">
              <Calendar :size="18" class="icon" />
              Tanggal Check-out *
            </label>
            <input v-model="formData.checkoutDate" type="date" class="form-input" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Kapasitas *</label>
            <input
              v-model.number="formData.capacity"
              type="number"
              class="form-input"
              :min="1"
              :max="maxCapacity"
              required
            />
            <p class="helper-text">Maksimal: {{ maxCapacity }} orang</p>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="formData.isBreakfast" type="checkbox" class="form-checkbox" />
              <span>Tambah Sarapan (Rp 50.000/hari)</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Customer Information -->
      <div class="form-section">
        <h2>Informasi Customer</h2>

        <div class="form-group">
          <label class="form-label">
            <User :size="18" class="icon" />
            ID Customer (UUID) *
          </label>
          <input
            v-model="formData.customerID"
            type="text"
            class="form-input"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nama Customer *</label>
            <input v-model="formData.customerName" type="text" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Email *</label>
            <input v-model="formData.customerEmail" type="email" class="form-input" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">No. Telepon *</label>
          <input v-model="formData.customerPhone" type="tel" class="form-input" required />
        </div>
      </div>

      <!-- Price Summary -->
      <div class="form-section price-section">
        <h2>
          <DollarSign :size="24" class="icon" />
          Ringkasan Harga
        </h2>

        <div class="price-details">
          <div class="price-row">
            <span>Harga per malam:</span>
            <strong>{{ formatCurrency(pricePerNight) }}</strong>
          </div>
          <div class="price-row">
            <span>Total malam:</span>
            <strong>{{ totalDays }} hari</strong>
          </div>
          <div class="price-row">
            <span>Subtotal kamar:</span>
            <strong>{{ formatCurrency(pricePerNight * totalDays) }}</strong>
          </div>
          <div v-if="formData.isBreakfast" class="price-row">
            <span>Sarapan:</span>
            <strong>{{ formatCurrency(breakfastCost) }}</strong>
          </div>
          <div class="price-row total">
            <span>Total Harga:</span>
            <strong class="total-amount">{{ formatCurrency(totalPrice) }}</strong>
          </div>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="goBack">Batal</button>
        <button type="submit" class="btn-submit" :disabled="loading || totalPrice === 0">
          {{ loading ? 'Menyimpan...' : 'Buat Booking' }}
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
}

.create-header {
  margin-bottom: 2rem;
}

.create-header h1 {
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

.create-form {
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-section {
  background: var(--gradient-light);
  padding: 1.5rem;
  border-radius: 8px;
}

.room-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.info-item .value {
  color: var(--text-primary);
  font-size: 1.05rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.icon {
  color: var(--primary-tosca);
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #212529;
}

.checkbox-label:hover {
  background: #e9ecef;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.helper-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.price-section {
  background: var(--gradient-light);
  padding: 1.5rem;
  border-radius: 8px;
}

.price-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  color: #212529;
}

.price-row.total {
  border: 2px solid var(--primary-blue);
  padding: 1rem;
  font-size: 1.1rem;
  color: #212529;
}

.total-amount {
  color: var(--primary-blue);
  font-size: 1.3rem;
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

  .form-row,
  .room-info {
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
