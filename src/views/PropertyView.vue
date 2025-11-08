<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search } from 'lucide-vue-next'
import propertyService, { type Property } from '../services/propertyService'
import { useToastNotification } from '../utils/toast'
import { getPropertyTypeName, getPropertyStatusName } from '../utils/helpers'

const router = useRouter()
const toast = useToastNotification()

const properties = ref<Property[]>([])
const loading = ref(true)
const searchQuery = ref('')
const filterType = ref<number | ''>('')
const filterStatus = ref<number | ''>('')

const fetchProperties = async () => {
  try {
    loading.value = true
    const data = await propertyService.getAllProperties()
    properties.value = data.sort((a, b) =>
      new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
    )
  } catch (error) {
    console.error('Error fetching properties:', error)
    toast.error('Gagal memuat data properti')
  } finally {
    loading.value = false
  }
}

const filteredProperties = computed(() => {
  return properties.value.filter((property) => {
    const matchesSearch = property.propertyName
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())
    const matchesType = filterType.value === '' || property.type === filterType.value
    const matchesStatus = filterStatus.value === '' || property.activeStatus === filterStatus.value
    return matchesSearch && matchesType && matchesStatus
  })
})

const goToDetail = (id: string) => {
  router.push(`/property/${id}`)
}

const goToCreate = () => {
  router.push('/property/create')
}

const getStatusClass = (status: number) => {
  return status === 1 ? 'status-active' : 'status-inactive'
}

onMounted(() => {
  fetchProperties()
})
</script>

<template>
  <div class="property-container">
    <div class="property-header">
      <h1>Daftar Properti</h1>
      <button class="btn-primary" @click="goToCreate">
        <Plus :size="20" />
        Tambah Properti
      </button>
    </div>

    <div class="filters">
      <div class="search-box">
        <Search :size="20" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari properti..."
          class="search-input"
        />
      </div>

      <select v-model="filterType" class="filter-select">
        <option value="">Semua Tipe</option>
        <option :value="1">Hotel</option>
        <option :value="2">Villa</option>
        <option :value="3">Apartemen</option>
      </select>

      <select v-model="filterStatus" class="filter-select">
        <option value="">Semua Status</option>
        <option :value="1">Aktif</option>
        <option :value="0">Tidak Aktif</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Memuat data...</div>

    <div v-else-if="filteredProperties.length === 0" class="no-data">
      Tidak ada properti yang ditemukan
    </div>

    <div v-else class="table-container">
      <table class="property-table">
        <thead>
          <tr>
            <th>ID Properti</th>
            <th>Nama Properti</th>
            <th>Tipe</th>
            <th>Status</th>
            <th>Total Kamar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="property in filteredProperties" :key="property.propertyID">
            <td>{{ property.propertyID }}</td>
            <td>{{ property.propertyName }}</td>
            <td>{{ getPropertyTypeName(property.type) }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(property.activeStatus)">
                {{ getPropertyStatusName(property.activeStatus) }}
              </span>
            </td>
            <td>{{ property.totalRoom }}</td>
            <td>
              <button class="btn-detail" @click="goToDetail(property.propertyID)">
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
.property-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.property-header h1 {
  font-size: 2rem;
  color: var(--neutral-dark);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
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

.property-table {
  width: 100%;
  border-collapse: collapse;
}

.property-table thead {
  background: var(--gradient-primary);
  color: white;
}

.property-table th,
.property-table td {
  padding: 1rem;
  text-align: left;
}

.property-table td {
  color: #2c3e50;
}

.property-table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.property-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.property-table tbody tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-active {
  background-color: #d4edda;
  color: #155724;
}

.status-inactive {
  background-color: #f8d7da;
  color: #721c24;
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
  .property-container {
    padding: 1rem;
  }

  .property-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filters {
    flex-direction: column;
  }

  .table-container {
    overflow-x: auto;
  }

  .property-table {
    min-width: 800px;
  }
}
</style>
