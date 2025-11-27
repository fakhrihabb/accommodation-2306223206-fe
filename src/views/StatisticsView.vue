<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, TrendingUp } from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import bookingService from '../services/bookingService'
import { useToastNotification } from '../utils/toast'
import { formatCurrency } from '../utils/helpers'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

interface PropertyIncome {
  propertyName: string
  monthlyRevenue: number
  totalIncome: number
  propertyID: string
}

const router = useRouter()
const toast = useToastNotification()

const loading = ref(false)
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Pendapatan Properti (Rp)',
      data: [] as number[],
      backgroundColor: 'rgba(0, 102, 204, 0.8)',
      borderColor: 'rgba(0, 102, 204, 1)',
      borderWidth: 1,
    },
  ],
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Statistik Pendapatan Properti per Bulan',
      font: {
        size: 18,
        weight: 'bold' as const,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: { dataset: { label?: string }; parsed: { y: number | null } }) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += formatCurrency(context.parsed.y)
          }
          return label
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: string | number) {
          return formatCurrency(Number(value))
        },
      },
    },
  },
}

const months = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
]

const years = ref<number[]>([])

const generateYears = () => {
  const currentYear = new Date().getFullYear()
  years.value = []
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    years.value.push(i)
  }
}

const fetchChartData = async () => {
  try {
    loading.value = true
    const response = await bookingService.getChartData(selectedMonth.value, selectedYear.value)

    console.log('=== Chart Data Debug ===')
    console.log('Full response:', JSON.parse(JSON.stringify(response)))
    console.log('Response type:', typeof response)
    console.log('Is array?', Array.isArray(response))
    console.log('Response keys:', response ? Object.keys(response) : 'null')
    console.log('Month:', selectedMonth.value, 'Year:', selectedYear.value)

    // The response could be an array directly or an object with properties
    // Handle both cases
    let properties: PropertyIncome[] = []
    if (Array.isArray(response)) {
      properties = response
      console.log('Using response as array directly')
    } else if (response && response.properties && Array.isArray(response.properties)) {
      properties = response.properties
      console.log('Using response.properties')
    } else if (response && typeof response === 'object') {
      // Check all keys in the response object
      console.log('Response structure not recognized. Trying to find data...')
      console.log('Available keys:', Object.keys(response))
      // Try to find any array property
      const arrayKey = Object.keys(response).find(key => Array.isArray(response[key]))
      if (arrayKey) {
        properties = response[arrayKey]
        console.log(`Found array in key: ${arrayKey}`)
      }
    } else {
      console.log('Response is null or not an object:', response)
    }

    console.log('Properties array:', JSON.parse(JSON.stringify(properties)))
    console.log('Properties length:', properties.length)

    // Sort by monthlyRevenue (highest first)
    const sortedData = properties.sort((a: PropertyIncome, b: PropertyIncome) => b.monthlyRevenue - a.monthlyRevenue)

    console.log('Sorted data:', JSON.parse(JSON.stringify(sortedData)))

    chartData.value.labels = sortedData.map((item: PropertyIncome) => item.propertyName)
    if (chartData.value.datasets[0]) {
      chartData.value.datasets[0].data = sortedData.map((item: PropertyIncome) => item.monthlyRevenue)
    }

    console.log('Chart labels:', JSON.parse(JSON.stringify(chartData.value.labels)))
    console.log('Chart data:', JSON.parse(JSON.stringify(chartData.value.datasets[0]?.data)))
    console.log('Chart datasets:', JSON.parse(JSON.stringify(chartData.value.datasets)))

    if (sortedData.length === 0) {
      toast.info('Tidak ada data untuk bulan dan tahun yang dipilih')
    }
  } catch (error) {
    console.error('Error fetching chart data:', error)
    toast.error('Gagal memuat data statistik')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/bookings')
}

watch([selectedMonth, selectedYear], () => {
  fetchChartData()
})

onMounted(() => {
  generateYears()
  fetchChartData()
})
</script>

<template>
  <div class="statistics-container">
    <div class="statistics-header">
      <button class="btn-back" @click="goBack">
        <ArrowLeft :size="20" />
        Kembali
      </button>
      <h1>
        <TrendingUp :size="32" class="header-icon" />
        Statistik Pendapatan
      </h1>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label class="filter-label">Bulan</label>
        <select v-model.number="selectedMonth" class="filter-select">
          <option v-for="month in months" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Tahun</label>
        <select v-model.number="selectedYear" class="filter-select">
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>

    <div class="chart-section">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Memuat data statistik...</p>
      </div>

      <div v-else-if="chartData.labels.length === 0" class="no-data">
        <TrendingUp :size="64" class="no-data-icon" />
        <p>Tidak ada data pendapatan untuk bulan dan tahun yang dipilih</p>
      </div>

      <div v-else class="chart-wrapper">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <div class="info-section">
      <div class="info-card">
        <h3>Informasi</h3>
        <ul>
          <li>Hanya booking dengan status <strong>Done (Selesai)</strong> yang dihitung</li>
          <li>Pendapatan diurutkan dari yang tertinggi ke terendah</li>
          <li>Data ditampilkan berdasarkan bulan dan tahun yang dipilih</li>
          <li>Hover pada bar untuk melihat detail pendapatan</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  background: var(--bg-dark);
}

.statistics-header {
  margin-bottom: 2rem;
}

.statistics-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  color: var(--primary-gold);
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

.filters-section {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  max-width: 250px;
}

.filter-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-dark);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-gold);
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.chart-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-gold);
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

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
  text-align: center;
}

.no-data-icon {
  color: #ccc;
}

.chart-wrapper {
  width: 100%;
  height: 500px;
}

.info-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.info-card h3 {
  font-size: 1.3rem;
  color: var(--primary-gold);
  margin-bottom: 1rem;
}

.info-card ul {
  list-style: none;
  padding: 0;
}

.info-card li {
  padding: 0.5rem 0;
  color: var(--text-primary);
  line-height: 1.6;
  position: relative;
  padding-left: 1.5rem;
}

.info-card li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-gold);
  font-weight: bold;
  font-size: 1.2rem;
}

.info-card strong {
  color: var(--primary-gold);
}

@media (max-width: 768px) {
  .statistics-container {
    padding: 1rem;
  }

  .statistics-header h1 {
    font-size: 1.5rem;
  }

  .filters-section {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-group {
    max-width: 100%;
  }

  .chart-section {
    padding: 1rem;
    min-height: 400px;
  }

  .chart-wrapper {
    height: 400px;
  }

  .info-section {
    padding: 1rem;
  }
}
</style>
