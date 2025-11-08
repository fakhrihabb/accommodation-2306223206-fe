<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Calendar, DollarSign, User, AlertCircle } from 'lucide-vue-next'
import bookingService, { type UpdateBookingData, type Booking } from '../services/bookingService'
import propertyService from '../services/propertyService'
import { useToastNotification } from '../utils/toast'
import { formatCurrency } from '../utils/helpers'

const router = useRouter()
const route = useRoute()
const toast = useToastNotification()

const loading = ref(false)
const fetchLoading = ref(true)

const bookingId = route.params.id as string

// Original booking data
const originalBooking = ref<Booking | null>(null)

// Form data - cascading selection
const properties = ref<any[]>([])
const selectedPropertyId = ref('')
const selectedRoomTypeId = ref('')
const selectedRoomId = ref('')

const roomTypes = ref<any[]>([])
const availableRooms = ref<any[]>([])

// Form data
const formData = ref<UpdateBookingData>({
  bookingID: bookingId,
  propertyID: '',
  roomTypeID: '',
  roomID: '',
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
  if (selectedRoomId.value) {
    const room = availableRooms.value.find((r) => r.roomID === selectedRoomId.value)
    return room?.price || 0
  }
  return 0
})

const breakfastCost = computed(() => {
  return formData.value.isBreakfast ? 50000 * totalDays.value : 0
})

const newTotalPrice = computed(() => {
  return pricePerNight.value * totalDays.value + breakfastCost.value
})

const originalTotalPrice = computed(() => {
  return originalBooking.value?.totalPrice || 0
})

const priceDifference = computed(() => {
  return newTotalPrice.value - originalTotalPrice.value
})

const willRequireExtraPay = computed(() => {
  return priceDifference.value > 0
})

const willRequireRefund = computed(() => {
  return priceDifference.value < 0
})

const maxCapacity = computed(() => {
  if (selectedRoomId.value) {
    const room = availableRooms.value.find((r) => r.roomID === selectedRoomId.value)
    return room?.capacity || 1
  }
  return 1
})

const canUpdate = computed(() => {
  // Can only update if extraPay = 0 and refund = 0
  return originalBooking.value?.extraPay === 0 && originalBooking.value?.refund === 0
})

// Fetch booking data
const fetchBookingData = async () => {
  try {
    fetchLoading.value = true
    const data = await bookingService.getUpdateBookingForm(bookingId)
    originalBooking.value = data

    // Check if can update
    if (!canUpdate.value) {
      toast.error('Booking dengan extraPay atau refund tidak dapat diupdate')
      router.push(`/bookings/${bookingId}`)
      return
    }

    // Fetch properties for dropdown
    const propertiesData = await propertyService.getAllProperties()
    properties.value = propertiesData.filter((p) => p.activeStatus === 1)

    // Pre-fill form data
    formData.value = {
      bookingID: data.bookingID,
      propertyID: data.propertyID || '',
      roomTypeID: data.roomTypeID || '',
      roomID: data.roomID || '',
      checkinDate: data.checkinDate,
      checkoutDate: data.checkoutDate,
      customerID: data.customerID,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      isBreakfast: data.isBreakfast,
      capacity: data.capacity,
    }

    // Set selected IDs
    selectedPropertyId.value = data.propertyID || ''
    selectedRoomTypeId.value = data.roomTypeID || ''
    selectedRoomId.value = data.roomID || ''

    // Load property detail to get room types
    if (selectedPropertyId.value) {
      await loadPropertyDetail(selectedPropertyId.value)
    }
  } catch (error) {
    console.error('Error fetching booking data:', error)
    toast.error('Gagal memuat data booking')
    router.push('/bookings')
  } finally {
    fetchLoading.value = false
  }
}

const loadPropertyDetail = async (propertyId: string) => {
  try {
    const detail = await propertyService.getPropertyDetail(propertyId)
    roomTypes.value = detail.listRoomType || []

    // If roomTypeId is set, load rooms
    if (selectedRoomTypeId.value) {
      const roomType = roomTypes.value.find((rt) => rt.roomTypeID === selectedRoomTypeId.value)
      if (roomType) {
        availableRooms.value = (roomType.listRoom || [])
          .filter((room: any) => room.availabilityStatus === 1 && room.activeRoom === 1)
          .map((room: any) => ({
            ...room,
            price: roomType.price,
            capacity: roomType.capacity,
          }))
      }
    }
  } catch (error) {
    console.error('Error loading property detail:', error)
    toast.error('Gagal memuat detail properti')
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

  formData.value.propertyID = propertyId
  await loadPropertyDetail(propertyId)
  selectedRoomTypeId.value = ''
  selectedRoomId.value = ''
})

// Watch for room type selection
watch(selectedRoomTypeId, (roomTypeId) => {
  if (!roomTypeId) {
    availableRooms.value = []
    selectedRoomId.value = ''
    return
  }

  formData.value.roomTypeID = roomTypeId

  const roomType = roomTypes.value.find((rt) => rt.roomTypeID === roomTypeId)
  if (roomType) {
    availableRooms.value = (roomType.listRoom || [])
      .filter((room: any) => room.availabilityStatus === 1 && room.activeRoom === 1)
      .map((room: any) => ({
        ...room,
        price: roomType.price,
        capacity: roomType.capacity,
      }))
    selectedRoomId.value = ''
  }
})

// Watch for room selection
watch(selectedRoomId, (roomId) => {
  if (roomId) {
    formData.value.roomID = roomId
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
  if (!formData.value.roomID || !formData.value.propertyID || !formData.value.roomTypeID) {
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
    await bookingService.updateBooking(formData.value)
    toast.success('Booking berhasil diupdate')
    router.push(`/bookings/${bookingId}`)
  } catch (error: any) {
    console.error('Error updating booking:', error)
    const message = error.response?.data?.message || 'Gagal mengupdate booking'
    toast.error(message)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push(`/bookings/${bookingId}`)
}

onMounted(() => {
  fetchBookingData()
})
</script>

<template>
  <div class="update-container">
    <div class="update-header">
      <button class="btn-back" @click="goBack">
        <ArrowLeft :size="20" />
        Kembali
      </button>
      <h1>Update Booking</h1>
    </div>

    <div v-if="fetchLoading" class="loading">
      <div class="spinner"></div>
      <p>Memuat data booking...</p>
    </div>

    <form v-else @submit.prevent="submitForm" class="update-form">
      <!-- Original Booking Info -->
      <div class="form-section info-section">
        <h2>Informasi Booking Saat Ini</h2>
        <div class="booking-info">
          <div class="info-item">
            <span class="label">ID Booking:</span>
            <span class="value">{{ originalBooking?.bookingID }}</span>
          </div>
          <div class="info-item">
            <span class="label">Harga Total Awal:</span>
            <span class="value">{{ formatCurrency(originalTotalPrice) }}</span>
          </div>
        </div>
      </div>

      <!-- Room Selection -->
      <div class="form-section">
        <h2>Pilih Kamar Baru</h2>

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
            <span>Harga Original:</span>
            <strong>{{ formatCurrency(originalTotalPrice) }}</strong>
          </div>
          <div class="price-row">
            <span>Harga per malam (baru):</span>
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
            <span>Harga Total Baru:</span>
            <strong class="total-amount">{{ formatCurrency(newTotalPrice) }}</strong>
          </div>

          <!-- Price Difference Warning -->
          <div v-if="priceDifference !== 0" class="price-warning">
            <AlertCircle :size="20" />
            <div class="warning-content">
              <strong v-if="willRequireExtraPay">Perubahan Harga: +{{ formatCurrency(Math.abs(priceDifference)) }}</strong>
              <strong v-else>Perubahan Harga: -{{ formatCurrency(Math.abs(priceDifference)) }}</strong>
              <p v-if="willRequireExtraPay">
                Status akan berubah ke <strong>Unpaid (0)</strong>. Pembayaran tambahan diperlukan.
              </p>
              <p v-else>Status akan berubah ke <strong>Refund (3)</strong>. Refund akan diproses.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="goBack">Batal</button>
        <button type="submit" class="btn-submit" :disabled="loading || newTotalPrice === 0">
          {{ loading ? 'Menyimpan...' : 'Update Booking' }}
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-section {
  background: var(--gradient-light);
  padding: 1.5rem;
  border-radius: 8px;
}

.booking-info {
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
}

.price-row.total {
  border: 2px solid var(--primary-blue);
  padding: 1rem;
  font-size: 1.1rem;
}

.total-amount {
  color: var(--primary-blue);
  font-size: 1.3rem;
}

.price-warning {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  margin-top: 1rem;
}

.warning-content {
  flex: 1;
}

.warning-content strong {
  color: #856404;
  display: block;
  margin-bottom: 0.5rem;
}

.warning-content p {
  color: #856404;
  font-size: 0.9rem;
  margin: 0;
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

  .form-row,
  .booking-info {
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
