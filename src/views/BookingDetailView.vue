<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Calendar, Home, DollarSign, User, Edit, X, CheckCircle, RefreshCw } from 'lucide-vue-next'
import bookingService, { type Booking } from '../services/bookingService'
import { useToastNotification } from '../utils/toast'
import { formatCurrency, formatDate, getBookingStatusName } from '../utils/helpers'

const router = useRouter()
const route = useRoute()
const toast = useToastNotification()

const booking = ref<Booking | null>(null)
const loading = ref(true)

// Modal states
const showPayModal = ref(false)
const showCancelModal = ref(false)
const showRefundModal = ref(false)
const actionLoading = ref(false)

const bookingId = route.params.id as string

const fetchBookingDetail = async () => {
  try {
    loading.value = true
    booking.value = await bookingService.getBookingDetail(bookingId)
  } catch (error) {
    console.error('Error fetching booking detail:', error)
    toast.error('Gagal memuat detail booking')
    router.push('/bookings')
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status: number) => {
  const statusClasses: { [key: number]: string } = {
    0: 'status-unpaid',
    1: 'status-paid',
    2: 'status-cancelled',
    3: 'status-refund',
    4: 'status-done',
  }
  return statusClasses[status] || 'status-unpaid'
}

const canPay = computed(() => {
  return booking.value?.status === 0
})

const canUpdate = computed(() => {
  return booking.value?.status === 0 || booking.value?.status === 1
})

const canCancel = computed(() => {
  return booking.value?.status === 0 || booking.value?.status === 1 || booking.value?.status === 3
})

const canRefund = computed(() => {
  return booking.value?.status === 3
})

const hasExtraPay = computed(() => {
  return booking.value?.extraPay && booking.value.extraPay > 0
})

// Pay booking
const openPayModal = () => {
  showPayModal.value = true
}

const closePayModal = () => {
  showPayModal.value = false
}

const confirmPay = async () => {
  if (!booking.value) return

  try {
    actionLoading.value = true
    await bookingService.payBooking({
      bookingID: booking.value.bookingID,
      propertyID: booking.value.propertyID,
    })
    toast.success('Pembayaran berhasil dilakukan')
    closePayModal()
    await fetchBookingDetail()
  } catch (error: any) {
    console.error('Error paying booking:', error)
    const message = error.response?.data?.message || 'Gagal melakukan pembayaran'
    toast.error(message)
  } finally {
    actionLoading.value = false
  }
}

// Cancel booking
const openCancelModal = () => {
  showCancelModal.value = true
}

const closeCancelModal = () => {
  showCancelModal.value = false
}

const confirmCancel = async () => {
  if (!booking.value) return

  try {
    actionLoading.value = true
    await bookingService.cancelBooking({
      bookingID: booking.value.bookingID,
      propertyID: booking.value.propertyID,
    })
    toast.success('Booking berhasil dibatalkan')
    closeCancelModal()
    await fetchBookingDetail()
  } catch (error: any) {
    console.error('Error cancelling booking:', error)
    const message = error.response?.data?.message || 'Gagal membatalkan booking'
    toast.error(message)
  } finally {
    actionLoading.value = false
  }
}

// Refund booking
const openRefundModal = () => {
  showRefundModal.value = true
}

const closeRefundModal = () => {
  showRefundModal.value = false
}

const confirmRefund = async () => {
  if (!booking.value) return

  try {
    actionLoading.value = true
    await bookingService.refundBooking({
      bookingID: booking.value.bookingID,
      propertyID: booking.value.propertyID,
    })
    toast.success('Refund berhasil diproses')
    closeRefundModal()
    await fetchBookingDetail()
  } catch (error: any) {
    console.error('Error refunding booking:', error)
    const message = error.response?.data?.message || 'Gagal memproses refund'
    toast.error(message)
  } finally {
    actionLoading.value = false
  }
}

const goToUpdate = () => {
  router.push(`/bookings/update/${bookingId}`)
}

const goBack = () => {
  router.push('/bookings')
}

onMounted(() => {
  fetchBookingDetail()
})
</script>

<template>
  <div class="detail-container">
    <div class="detail-header">
      <button class="btn-back" @click="goBack">
        <ArrowLeft :size="20" />
        Kembali
      </button>
      <h1>Detail Booking</h1>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Memuat detail booking...</p>
    </div>

    <div v-else-if="booking" class="detail-content">
      <!-- Booking Info Card -->
      <div class="info-card">
        <div class="card-header">
          <h2>Informasi Booking</h2>
          <span class="status-badge" :class="getStatusClass(booking.status)">
            {{ getBookingStatusName(booking.status) }}
          </span>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>ID Booking</label>
            <p>{{ booking.bookingID }}</p>
          </div>

          <div class="info-item">
            <label>Tanggal Booking</label>
            <p>{{ formatDate(booking.bookingDate) }}</p>
          </div>

          <div class="info-item">
            <label>
              <Home :size="18" class="icon" />
              Properti
            </label>
            <p>{{ booking.propertyName }}</p>
          </div>

          <div class="info-item">
            <label>
              <Home :size="18" class="icon" />
              Kamar
            </label>
            <p>{{ booking.roomName }}</p>
          </div>

          <div class="info-item">
            <label>
              <Calendar :size="18" class="icon" />
              Check-in
            </label>
            <p>{{ formatDate(booking.checkinDate) }}</p>
          </div>

          <div class="info-item">
            <label>
              <Calendar :size="18" class="icon" />
              Check-out
            </label>
            <p>{{ formatDate(booking.checkoutDate) }}</p>
          </div>

          <div class="info-item">
            <label>Total Hari</label>
            <p>{{ booking.totalDay }} hari</p>
          </div>

          <div class="info-item">
            <label>Kapasitas</label>
            <p>{{ booking.capacity }} orang</p>
          </div>

          <div class="info-item">
            <label>Sarapan</label>
            <p>{{ booking.breakfast ? 'Ya' : 'Tidak' }}</p>
          </div>

          <div class="info-item">
            <label>
              <User :size="18" class="icon" />
              Nama Customer
            </label>
            <p>{{ booking.customerName }}</p>
          </div>

          <div class="info-item">
            <label>Email Customer</label>
            <p>{{ booking.customerEmail }}</p>
          </div>

          <div class="info-item">
            <label>No. Telepon</label>
            <p>{{ booking.customerPhone }}</p>
          </div>
        </div>
      </div>

      <!-- Payment Info Card -->
      <div class="info-card payment-card">
        <h2>Informasi Pembayaran</h2>

        <div class="payment-details">
          <div class="payment-row">
            <span>Harga Total:</span>
            <strong>{{ formatCurrency(booking.totalPrice) }}</strong>
          </div>

          <div v-if="booking.extraPay > 0" class="payment-row extra">
            <span>Pembayaran Tambahan:</span>
            <strong class="extra-amount">{{ formatCurrency(booking.extraPay) }}</strong>
          </div>

          <div v-if="booking.refund > 0" class="payment-row refund">
            <span>Refund:</span>
            <strong class="refund-amount">{{ formatCurrency(booking.refund) }}</strong>
          </div>

          <div class="payment-row total">
            <span>Total Akhir:</span>
            <strong class="total-amount">
              {{ formatCurrency(booking.totalPrice + (booking.extraPay || 0) - (booking.refund || 0)) }}
            </strong>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <!-- Status 0: Unpaid -->
        <template v-if="booking.status === 0">
          <button v-if="!hasExtraPay" class="btn-action btn-update" @click="goToUpdate">
            <Edit :size="20" />
            Update
          </button>
          <button class="btn-action btn-pay" @click="openPayModal">
            <DollarSign :size="20" />
            {{ hasExtraPay ? 'Bayar Tambahan' : 'Bayar' }}
          </button>
          <button class="btn-action btn-cancel" @click="openCancelModal">
            <X :size="20" />
            Batalkan
          </button>
        </template>

        <!-- Status 1: Paid -->
        <template v-if="booking.status === 1">
          <button class="btn-action btn-update" @click="goToUpdate">
            <Edit :size="20" />
            Update
          </button>
          <button class="btn-action btn-cancel" @click="openCancelModal">
            <X :size="20" />
            Batalkan
          </button>
        </template>

        <!-- Status 3: Refund -->
        <template v-if="booking.status === 3">
          <button class="btn-action btn-refund" @click="openRefundModal">
            <RefreshCw :size="20" />
            Proses Refund
          </button>
          <button class="btn-action btn-cancel" @click="openCancelModal">
            <X :size="20" />
            Batalkan
          </button>
        </template>

        <button class="btn-action btn-back-alt" @click="goBack">
          <ArrowLeft :size="20" />
          Kembali ke Daftar
        </button>
      </div>
    </div>

    <!-- Pay Modal -->
    <div v-if="showPayModal" class="modal-overlay" @click="closePayModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Konfirmasi Pembayaran</h3>
        </div>
        <div class="modal-body">
          <p v-if="hasExtraPay">
            Anda akan membayar <strong>{{ formatCurrency(booking?.extraPay || 0) }}</strong> sebagai pembayaran
            tambahan.
          </p>
          <p v-else>
            Anda akan membayar <strong>{{ formatCurrency(booking?.totalPrice || 0) }}</strong> untuk booking ini.
          </p>
          <p>Apakah Anda yakin ingin melanjutkan pembayaran?</p>
        </div>
        <div class="modal-actions">
          <button class="btn-modal btn-secondary" @click="closePayModal" :disabled="actionLoading">Batal</button>
          <button class="btn-modal btn-primary" @click="confirmPay" :disabled="actionLoading">
            {{ actionLoading ? 'Memproses...' : 'Ya, Bayar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Cancel Modal -->
    <div v-if="showCancelModal" class="modal-overlay" @click="closeCancelModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Konfirmasi Pembatalan</h3>
        </div>
        <div class="modal-body">
          <p>Anda akan membatalkan booking dengan ID <strong>{{ booking?.bookingID }}</strong>.</p>
          <p>Apakah Anda yakin ingin membatalkan booking ini?</p>
        </div>
        <div class="modal-actions">
          <button class="btn-modal btn-secondary" @click="closeCancelModal" :disabled="actionLoading">Tidak</button>
          <button class="btn-modal btn-danger" @click="confirmCancel" :disabled="actionLoading">
            {{ actionLoading ? 'Memproses...' : 'Ya, Batalkan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Refund Modal -->
    <div v-if="showRefundModal" class="modal-overlay" @click="closeRefundModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Konfirmasi Refund</h3>
        </div>
        <div class="modal-body">
          <p>Anda akan memproses refund sebesar <strong>{{ formatCurrency(booking?.refund || 0) }}</strong>.</p>
          <p>Apakah Anda yakin ingin memproses refund ini?</p>
        </div>
        <div class="modal-actions">
          <button class="btn-modal btn-secondary" @click="closeRefundModal" :disabled="actionLoading">Batal</button>
          <button class="btn-modal btn-primary" @click="confirmRefund" :disabled="actionLoading">
            {{ actionLoading ? 'Memproses...' : 'Ya, Proses Refund' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.detail-header {
  margin-bottom: 2rem;
}

.detail-header h1 {
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

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.card-header h2 {
  font-size: 1.5rem;
  color: var(--primary-blue);
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-unpaid {
  background-color: #fff3cd;
  color: #856404;
}

.status-paid {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.status-refund {
  background-color: #d4edda;
  color: #155724;
}

.status-done {
  background-color: #d4edda;
  color: #155724;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-item .icon {
  color: var(--primary-tosca);
}

.info-item p {
  font-size: 1rem;
  color: var(--text-primary);
}

.payment-card {
  background: var(--gradient-light);
}

.payment-card h2 {
  font-size: 1.3rem;
  color: var(--primary-blue);
  margin-bottom: 1.5rem;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
}

.payment-row span {
  color: #2c3e50;
}

.payment-row strong {
  color: #1a1a1a;
}

.payment-row.extra {
  border-left: 4px solid #ffc107;
}

.payment-row.refund {
  border-left: 4px solid #28a745;
}

.payment-row.total {
  border-left: 4px solid var(--primary-blue);
  font-size: 1.1rem;
  padding: 1rem;
}

.extra-amount {
  color: #ffc107;
}

.refund-amount {
  color: #28a745;
}

.total-amount {
  color: var(--primary-blue);
  font-size: 1.3rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 150px;
  justify-content: center;
}

.btn-pay {
  background: #28a745;
  color: white;
}

.btn-pay:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-update {
  background: var(--primary-blue);
  color: white;
}

.btn-update:hover {
  background: #005299;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.btn-cancel {
  background: #dc3545;
  color: white;
}

.btn-cancel:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-refund {
  background: var(--primary-tosca);
  color: white;
}

.btn-refund:hover {
  background: #1a9a93;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(32, 178, 170, 0.3);
}

.btn-back-alt {
  background: #6c757d;
  color: white;
}

.btn-back-alt:hover {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.5rem;
  color: var(--neutral-dark);
}

.modal-body {
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.modal-body p {
  margin-bottom: 0.5rem;
}

.modal-body strong {
  color: var(--primary-blue);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-modal {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

@media (max-width: 768px) {
  .detail-container {
    padding: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}
</style>
