<script setup lang="ts">
import { ref } from 'vue'
import { Home, Calendar, Building2, Clipboard, TrendingUp } from 'lucide-vue-next'

// Mock data - replace with real API calls
const stats = ref({
  totalProperties: 45,
  totalBookings: 328,
})
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <h1 class="dashboard-title">Selamat Datang di TravelAPAP</h1>
      <p class="dashboard-subtitle">Platform Manajemen Akomodasi Terpadu</p>

      <div class="stats-section">
        <div class="stat-card">
          <Home class="stat-icon" :size="40" />
          <div class="stat-value">{{ stats.totalProperties }}</div>
          <div class="stat-label">Total Properti</div>
        </div>

        <div class="stat-card">
          <Calendar class="stat-icon" :size="40" />
          <div class="stat-value">{{ stats.totalBookings }}</div>
          <div class="stat-label">Total Pemesanan</div>
        </div>
      </div>

      <div class="dashboard-features">
        <h2>Fitur Utama</h2>
        <div class="features-grid">
          <div class="feature-item">
            <Building2 class="feature-icon" :size="48" />
            <h3>Kelola Properti</h3>
            <p>Tambah, edit, dan kelola semua properti akomodasi Anda dengan mudah</p>
          </div>
          <div class="feature-item">
            <Clipboard class="feature-icon" :size="48" />
            <h3>Kelola Pemesanan</h3>
            <p>Pantau dan proses semua pemesanan dari tamu dengan efisien</p>
          </div>
          <div class="feature-item">
            <TrendingUp class="feature-icon" :size="48" />
            <h3>Analitik & Laporan</h3>
            <p>Lihat statistik mendalam tentang performa akomodasi Anda</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 3rem 2rem;
  background: var(--gradient-light);
}

.dashboard-content {
  text-align: center;
  max-width: 900px;
  width: 100%;
}

.dashboard-title {
  font-size: 3rem;
  font-weight: bold;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
  justify-content: center;
}

.stat-card {
  background: white;
  border-left: 5px solid var(--primary-tosca);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 102, 204, 0.2);
}

.stat-icon {
  color: var(--primary-tosca);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-blue);
  margin: 0.5rem 0;
}

.stat-label {
  font-size: 0.95rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dashboard-features {
  margin-top: 3rem;
  padding-top: 3rem;
  border-top: 2px solid rgba(0, 102, 204, 0.1);
}

.dashboard-features h2 {
  font-size: 2rem;
  color: var(--neutral-dark);
  margin-bottom: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-item {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(32, 178, 170, 0.1);
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(32, 178, 170, 0.2);
}

.feature-icon {
  color: var(--primary-blue);
  display: block;
  margin: 0 auto 1rem auto;
}

.feature-item h3 {
  font-size: 1.3rem;
  color: var(--neutral-dark);
  margin-bottom: 0.5rem;
}

.feature-item p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 2rem 1rem;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .dashboard-subtitle {
    font-size: 1rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .stat-value {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
