<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search } from 'lucide-vue-next'
import bookingService, { type Booking } from '../services/bookingService'
import { useToastNotification } from '../utils/toast'
import { getBookingStatusName, formatDate, formatCurrency } from '../utils/helpers'

const router = useRouter()
const toast = useToastNotification()

const bookings = ref<Booking[]>([])
const loading = ref(true)
const searchQuery = ref('')
const filterStatus = ref<number | ''>('')

const fetchBookings = async () => {
  try {
    loading.value = true
    const data = await bookingService.getAllBookings()

    // Auto-update booking statuses based on check-in date
    const today = new Date()
    today.setHours(14, 0, 0, 0) // Check-in time is 14:00

    for (const booking of data) {
      const checkinDate = new Date(booking.checkinDate)
      if (checkinDate <= today) {
        // Status 1 (Payment Confirmed) or 3 (Request Refund) becomes 4 (Done)
        if (booking.status === 1 || booking.status === 3) {
          // This should be handled by backend, but we'll display updated
          // In real app, call an API to update status
        }
        // Status 0 (Waiting) becomes 2 (Cancelled)
        if (booking.status === 0) {
          // This should be handled by backend
        }
      }
    }

    bookings.value = data.sort((a, b) => a.bookingID.localeCompare(b.bookingID))
  } catch (error) {
    console.error('Error fetching bookings:', error)
    toast.error('Gagal memuat data pemesanan')
  } finally {
    loading.value = false
  }
}

const filteredBookings = computed(() => {
  return bookings.value.filter((booking) => {
    const matchesSearch =
      (booking.propertyName?.toLowerCase() || '').includes(searchQuery.value.toLowerCase()) ||
      (booking.roomName?.toLowerCase() || '').includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value === '' || booking.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

const goToDetail = (id: string) => {
  router.push(`/bookings/${id}`)
}

const goToCreate = () => {
  router.push('/bookings/create')
}

const goToStatistics = () => {
  router.push('/statistics')
}

const getStatusClass = (status: number) => {
  const classes = {
    0: 'status-waiting',
    1: 'status-confirmed',
    2: 'status-cancelled',
    3: 'status-refund',
    4: 'status-done',
  }
  return classes[status as keyof typeof classes] || ''
}

onMounted(() => {
  fetchBookings()
})
</script>

<template>
  <div class="bookings-container">
    <div class="bookings-header">
      <h1>Daftar Pemesanan</h1>
      <div class="header-actions">
        <button class="btn-statistics" @click="goToStatistics">
          Lihat Statistik
        </button>
        <button class="btn-primary" @click="goToCreate">
          <Plus :size="20" />
          Tambah Pemesanan
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="search-box">
        <Search :size="20" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari properti atau kamar..."
          class="search-input"
        />
      </div>

      <select v-model="filterStatus" class="filter-select">
        <option value="">Semua Status</option>
        <option :value="0">Menunggu Pembayaran</option>
        <option :value="1">Pembayaran Dikonfirmasi</option>
        <option :value="2">Dibatalkan</option>
        <option :value="3">Permintaan Refund</option>
        <option :value="4">Selesai</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Memuat data...</div>

    <div v-else-if="filteredBookings.length === 0" class="no-data">
      Tidak ada pemesanan yang ditemukan
    </div>

    <div v-else class="table-container">
      <table class="bookings-table">
        <thead>
          <tr>
            <th>ID Booking</th>
            <th>Nama Properti</th>
            <th>Nama Kamar</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Total Harga</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in filteredBookings" :key="booking.bookingID">
            <td>{{ booking.bookingID }}</td>
            <td>{{ booking.propertyName || '-' }}</td>
            <td>{{ booking.roomName || '-' }}</td>
            <td>{{ formatDate(booking.checkinDate) }}</td>
            <td>{{ formatDate(booking.checkoutDate) }}</td>
            <td>{{ formatCurrency(booking.totalPrice) }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(booking.status)">
                {{ getBookingStatusName(booking.status) }}
              </span>
            </td>
            <td>
              <button class="btn-detail" @click="goToDetail(booking.bookingID)">
                Detail
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.bookings-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.bookings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.bookings-header h1 {
  font-size: 2rem;
  color: var(--neutral-dark);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary,
.btn-statistics {
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
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

.btn-statistics {
  background: var(--primary-tosca);
  color: white;
}

.btn-primary:hover,
.btn-statistics:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.loading,
.no-data {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
}

.bookings-table thead {
  background: var(--gradient-primary);
  color: white;
}

.bookings-table th,
.bookings-table td {
  padding: 1rem;
  text-align: left;
}

.bookings-table td {
  color: #2c3e50;
}

.bookings-table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.bookings-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.bookings-table tbody tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-waiting {
  background-color: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.status-refund {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-done {
  background-color: #d4edda;
  color: #155724;
}

.btn-detail {
  padding: 0.5rem 1.5rem;
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-detail:hover {
  background: #005299;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
}

@media (max-width: 768px) {
  .bookings-container {
    padding: 1rem;
  }

  .bookings-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-statistics {
    width: 100%;
    justify-content: center;
  }

  .filters {
    flex-direction: column;
  }

  .table-container {
    overflow-x: auto;
  }

  .bookings-table {
    min-width: 900px;
  }
}
</style>
