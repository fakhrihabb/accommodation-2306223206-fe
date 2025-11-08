<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Edit, Trash2, Wrench } from 'lucide-vue-next'
import propertyService, { type Property, type Room } from '../services/propertyService'
import { useToastNotification } from '../utils/toast'
import {
  getPropertyTypeName,
  formatCurrency,
  formatDateTime,
  formatDateForInput,
  getRoomAvailabilityName,
} from '../utils/helpers'

const route = useRoute()
const router = useRouter()
const toast = useToastNotification()

const property = ref<Property | null>(null)
const loading = ref(true)
const filterDateFrom = ref('')
const filterDateTo = ref('')
const showDeleteModal = ref(false)
const showMaintenanceModal = ref(false)
const selectedRoom = ref<Room | null>(null)
const maintenanceData = ref({
  maintenanceStart: '',
  maintenanceEnd: '',
})

const fetchPropertyDetail = async () => {
  try {
    loading.value = true
    const id = route.params.id as string
    const data = await propertyService.getPropertyDetail(id)
    property.value = data
  } catch (error) {
    console.error('Error fetching property:', error)
    toast.error('Gagal memuat detail properti')
  } finally {
    loading.value = false
  }
}

const applyFilter = async () => {
  if (!filterDateFrom.value || !filterDateTo.value) {
    toast.warning('Harap isi tanggal check-in dan check-out')
    return
  }

  if (new Date(filterDateFrom.value) >= new Date(filterDateTo.value)) {
    toast.error('Tanggal check-out harus lebih besar dari tanggal check-in')
    return
  }

  // Re-fetch property data with date filters
  await fetchPropertyDetail()
  toast.success('Filter diterapkan')
}

const goBack = () => {
  router.push('/property')
}

const goToUpdate = () => {
  router.push(`/property/update/${property.value?.propertyID}`)
}

const goToAddRoom = () => {
  router.push(`/property/updateroom/${property.value?.propertyID}`)
}

const openDeleteModal = () => {
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const confirmDelete = async () => {
  try {
    await propertyService.deleteProperty(property.value?.propertyID as string)
    toast.success('Properti berhasil dihapus')
    router.push('/property')
  } catch (error) {
    console.error('Error deleting property:', error)
    toast.error('Gagal menghapus properti')
  }
  closeDeleteModal()
}

const openMaintenanceModal = (room: Room) => {
  selectedRoom.value = room
  maintenanceData.value = {
    maintenanceStart: '',
    maintenanceEnd: '',
  }
  showMaintenanceModal.value = true
}

const closeMaintenanceModal = () => {
  showMaintenanceModal.value = false
  selectedRoom.value = null
}

const submitMaintenance = async () => {
  if (!maintenanceData.value.maintenanceStart || !maintenanceData.value.maintenanceEnd) {
    toast.warning('Harap isi tanggal mulai dan selesai perbaikan')
    return
  }

  if (
    new Date(maintenanceData.value.maintenanceStart) >= new Date(maintenanceData.value.maintenanceEnd)
  ) {
    toast.error('Tanggal selesai harus lebih besar dari tanggal mulai')
    return
  }

  try {
    await propertyService.createMaintenance({
      roomID: selectedRoom.value?.roomID as string,
      propertyID: property.value?.propertyID as string,
      maintenanceStart: maintenanceData.value.maintenanceStart,
      maintenanceEnd: maintenanceData.value.maintenanceEnd,
    })
    toast.success('Jadwal perbaikan berhasil ditambahkan')
    closeMaintenanceModal()
    await fetchPropertyDetail()
  } catch (error) {
    console.error('Error creating maintenance:', error)
    toast.error('Gagal menambahkan jadwal perbaikan')
  }
}

const bookRoom = (roomId: string) => {
  const checkIn = filterDateFrom.value || formatDateForInput(new Date().toISOString())
  const checkOut =
    filterDateTo.value ||
    formatDateForInput(new Date(Date.now() + 86400000).toISOString())

  router.push({
    name: 'booking-create-room',
    params: { roomId },
    query: { checkIn, checkOut },
  })
}

onMounted(() => {
  fetchPropertyDetail()
})
</script>

<template>
  <div class="detail-container">
    <div v-if="loading" class="loading">Memuat data...</div>

    <div v-else-if="property" class="detail-content">
      <div class="detail-header">
        <button class="btn-back" @click="goBack">
          <ArrowLeft :size="20" />
          Kembali
        </button>
        <h1>Detail Properti {{ property.propertyID }}</h1>
        <div class="action-buttons" v-if="property.activeStatus === 1">
          <button class="btn-add" @click="goToAddRoom">
            <Plus :size="20" />
            Tambah Kamar
          </button>
          <button class="btn-update" @click="goToUpdate">
            <Edit :size="20" />
            Update Properti
          </button>
          <button class="btn-delete" @click="openDeleteModal">
            <Trash2 :size="20" />
            Hapus Properti
          </button>
        </div>
      </div>

      <div class="property-info">
        <div class="info-card">
          <h2>{{ property.propertyName }}</h2>
          <p class="property-type">{{ getPropertyTypeName(property.type) }}</p>
          <div class="info-row">
            <span class="label">Pendapatan:</span>
            <span class="value">{{ formatCurrency(property.income) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Total Kamar:</span>
            <span class="value">{{ property.totalRoom }}</span>
          </div>
          <div class="info-row">
            <span class="label">Alamat:</span>
            <span class="value">{{ property.address }}</span>
          </div>
          <div class="info-row">
            <span class="label">Deskripsi:</span>
            <span class="value">{{ property.description }}</span>
          </div>
          <div class="info-row">
            <span class="label">Nama Pemilik:</span>
            <span class="value">{{ property.ownerName }}</span>
          </div>
          <div class="info-row">
            <span class="label">ID Pemilik:</span>
            <span class="value">{{ property.ownerID }}</span>
          </div>
          <div class="info-row">
            <span class="label">Dibuat:</span>
            <span class="value">{{ formatDateTime(property.createdDate) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Terakhir Diubah:</span>
            <span class="value">{{ formatDateTime(property.updatedDate) }}</span>
          </div>
        </div>
      </div>

      <div class="filter-section">
        <h3>Filter Ketersediaan Kamar</h3>
        <div class="date-filters">
          <div class="date-input-group">
            <label>Check-in</label>
            <input v-model="filterDateFrom" type="date" class="date-input" />
          </div>
          <div class="date-input-group">
            <label>Check-out</label>
            <input v-model="filterDateTo" type="date" class="date-input" />
          </div>
          <button class="btn-filter" @click="applyFilter">Apply Filter</button>
        </div>
      </div>

      <div class="room-types-section">
        <h3>Tipe Kamar</h3>
        <div
          v-for="roomType in property.listRoomType"
          :key="roomType.roomTypeID"
          class="room-type-card"
        >
          <div class="room-type-header">
            <h4>{{ roomType.name }}</h4>
            <p class="room-type-price">{{ formatCurrency(roomType.price) }}/malam</p>
          </div>
          <div class="room-type-info">
            <p><strong>Deskripsi:</strong> {{ roomType.description }}</p>
            <p><strong>Kapasitas:</strong> {{ roomType.capacity }} orang</p>
            <p><strong>Fasilitas:</strong> {{ roomType.facility }}</p>
            <p><strong>Lantai:</strong> {{ roomType.floor }}</p>
          </div>

          <div class="rooms-table">
            <table>
              <thead>
                <tr>
                  <th>Nama Kamar</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in roomType.listRoom" :key="room.roomID">
                  <td>{{ room.name }}</td>
                  <td>
                    <span
                      class="status-badge"
                      :class="
                        room.availabilityStatus === 1 ? 'status-available' : 'status-unavailable'
                      "
                    >
                      {{ getRoomAvailabilityName(room.availabilityStatus) }}
                    </span>
                  </td>
                  <td class="action-cell">
                    <button
                      v-if="room.availabilityStatus === 1"
                      class="btn-book"
                      @click="bookRoom(room.roomID)"
                    >
                      Book
                    </button>
                    <button
                      v-if="room.availabilityStatus === 1"
                      class="btn-maintenance"
                      @click="openMaintenanceModal(room)"
                    >
                      <Wrench :size="16" />
                      Maintenance
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal" @click.stop>
        <h3>Hapus Properti?</h3>
        <p>Tindakan ini tidak dapat dibatalkan.</p>
        <div class="modal-actions">
          <button class="btn-confirm" @click="confirmDelete">Ya</button>
          <button class="btn-cancel" @click="closeDeleteModal">Tidak</button>
        </div>
      </div>
    </div>

    <!-- Maintenance Modal -->
    <div v-if="showMaintenanceModal" class="modal-overlay" @click="closeMaintenanceModal">
      <div class="modal" @click.stop>
        <h3>Jadwal Perbaikan</h3>
        <p>Kamar: {{ selectedRoom?.name }}</p>
        <div class="form-group">
          <label>Tanggal Mulai</label>
          <input
            v-model="maintenanceData.maintenanceStart"
            type="datetime-local"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>Tanggal Selesai</label>
          <input
            v-model="maintenanceData.maintenanceEnd"
            type="datetime-local"
            class="form-input"
          />
        </div>
        <div class="modal-actions">
          <button class="btn-confirm" @click="submitMaintenance">Simpan</button>
          <button class="btn-cancel" @click="closeMaintenanceModal">Batal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.detail-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-header {
  margin-bottom: 2rem;
}

.detail-header h1 {
  font-size: 2rem;
  color: var(--neutral-dark);
  margin: 1rem 0;
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

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn-add,
.btn-update,
.btn-delete {
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

.btn-add {
  background: var(--primary-blue);
  color: white;
}

.btn-update {
  background: #ffc107;
  color: #000;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-add:hover,
.btn-update:hover,
.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.property-info {
  margin-bottom: 2rem;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-card h2 {
  font-size: 1.8rem;
  color: var(--primary-blue);
  margin-bottom: 0.5rem;
}

.property-type {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 150px;
}

.info-row .value {
  color: var(--text-primary);
  flex: 1;
}

.filter-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-section h3 {
  margin-bottom: 1rem;
  color: var(--neutral-dark);
}

.date-filters {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-input-group label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.date-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.btn-filter {
  padding: 0.75rem 2rem;
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-filter:hover {
  background: #005299;
  transform: translateY(-2px);
}

.room-types-section h3 {
  font-size: 1.5rem;
  color: var(--neutral-dark);
  margin-bottom: 1.5rem;
}

.room-type-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.room-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.room-type-header h4 {
  font-size: 1.3rem;
  color: var(--primary-blue);
}

.room-type-price {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-tosca);
}

.room-type-info {
  margin-bottom: 1.5rem;
}

.room-type-info p {
  margin: 0.5rem 0;
  color: var(--text-primary);
}

.rooms-table {
  overflow-x: auto;
}

.rooms-table table {
  width: 100%;
  border-collapse: collapse;
}

.rooms-table thead {
  background: #f8f9fa;
}

.rooms-table th,
.rooms-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.rooms-table td {
  color: #2c3e50;
}

.rooms-table th {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
}

.action-cell {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-available {
  background-color: #d4edda;
  color: #155724;
}

.status-unavailable {
  background-color: #f8d7da;
  color: #721c24;
}

.btn-book,
.btn-maintenance {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-book {
  background: var(--primary-blue);
  color: white;
}

.btn-maintenance {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #ffc107;
  color: #000;
}

.btn-book:hover,
.btn-maintenance:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

.modal h3 {
  margin-bottom: 1rem;
  color: var(--neutral-dark);
}

.modal p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-confirm,
.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-confirm {
  background: #28a745;
  color: white;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-confirm:hover,
.btn-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .detail-container {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-add,
  .btn-update,
  .btn-delete {
    width: 100%;
    justify-content: center;
  }

  .date-filters {
    flex-direction: column;
  }

  .date-input-group {
    width: 100%;
  }

  .btn-filter {
    width: 100%;
  }
}
</style>
