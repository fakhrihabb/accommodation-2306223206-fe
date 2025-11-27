<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, Calendar, TrendingUp } from 'lucide-vue-next'
import propertyService from '../services/propertyService'
import bookingService from '../services/bookingService'
import { useToastNotification } from '../utils/toast'

const router = useRouter()
const toast = useToastNotification()

const stats = ref({
  totalProperties: 0,
  totalBookings: 0,
})

const loading = ref(true)

const fetchStats = async () => {
  try {
    loading.value = true
    const [properties, bookings] = await Promise.all([
      propertyService.getAllProperties(),
      bookingService.getAllBookings(),
    ])
    stats.value.totalProperties = properties.length
    stats.value.totalBookings = bookings.length
  } catch (error) {
    console.error('Error fetching stats:', error)
    toast.error('Gagal memuat data statistik')
  } finally {
    loading.value = false
  }
}

const goToProperties = () => {
  router.push('/property')
}

const goToBookings = () => {
  router.push('/bookings')
}

const goToStatistics = () => {
  router.push('/statistics')
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">Modul Akomodasi</h1>
            <p class="hero-subtitle">
              Kelola properti dan pemesanan akomodasi Anda dengan mudah melalui sistem manajemen
              terpadu TravelAPAP
            </p>

            <!-- Metric Cards in Hero -->
            <div class="hero-metrics">
              <div class="metric-tag">
                <Building2 :size="16" />
                <span>{{ stats.totalProperties }} Properti</span>
              </div>
              <div class="metric-tag">
                <Calendar :size="16" />
                <span>{{ stats.totalBookings }} Pemesanan</span>
              </div>
            </div>
          </div>

          <div class="hero-image">
            <img
              src="/images/hotel_lobby.png"
              alt="Hotel Lobby"
              class="hero-img"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="features-container">
        <h2 class="section-title">Fitur Utama</h2>
        <p class="section-subtitle">
          Kemudahan dalam mengelola properti dan pemesanan akomodasi
        </p>

        <div class="features-grid">
          <div class="feature-card" @click="goToProperties">
            <div class="feature-icon-wrapper">
              <Building2 class="feature-icon" :size="32" />
            </div>
            <h3 class="feature-title">Kelola Properti</h3>
            <p class="feature-description">
              Tambah, edit, dan kelola semua properti akomodasi dengan sistem yang terintegrasi
            </p>
          </div>

          <div class="feature-card" @click="goToBookings">
            <div class="feature-icon-wrapper">
              <Calendar class="feature-icon" :size="32" />
            </div>
            <h3 class="feature-title">Kelola Pemesanan</h3>
            <p class="feature-description">
              Pantau dan proses semua pemesanan dari tamu secara efisien dan real-time
            </p>
          </div>

          <div class="feature-card" @click="goToStatistics">
            <div class="feature-icon-wrapper">
              <TrendingUp class="feature-icon" :size="32" />
            </div>
            <h3 class="feature-title">Analitik & Laporan</h3>
            <p class="feature-description">
              Dapatkan insight mendalam tentang performa akomodasi melalui statistik detail
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: calc(100vh - 80px);
  background: var(--bg-dark);
}

/* Hero Section */
.hero-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.05) 0%, rgba(201, 169, 97, 0.05) 100%);
}

.hero-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #d4a574 0%, #c9a961 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  margin: 0;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

.hero-metrics {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.metric-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-card);
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 165, 116, 0.3);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--primary-gold);
  transition: all 0.3s ease;
}

.metric-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
  border-color: var(--primary-gold);
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-img {
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(212, 165, 116, 0.2);
  border: 2px solid rgba(212, 165, 116, 0.2);
  object-fit: cover;
}

/* Features Section */
.features-section {
  padding: 4rem 0 5rem 0;
  background: var(--bg-dark-secondary);
}

.features-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--bg-card);
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(212, 165, 116, 0.2);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(212, 165, 116, 0.3);
  border-color: var(--primary-gold);
}

.feature-icon-wrapper {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(201, 169, 97, 0.1) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.feature-icon {
  color: var(--primary-gold);
}

.feature-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.feature-description {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .hero-image {
    order: -1;
  }

  .hero-img {
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 0;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.05rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .hero-img {
    max-width: 300px;
  }

  .hero-metrics {
    justify-content: center;
  }

  .metric-tag {
    font-size: 0.9rem;
  }
}
</style>
