<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

const showModuleModal = ref(false)

const modules = [
  { name: 'Accommodation', icon: '🏨' },
  { name: 'Insurance', icon: '🛡️' },
  { name: 'Flight', icon: '✈️' },
  { name: 'Vehicle Rental', icon: '🚗' },
  { name: 'Tour Package', icon: '🎒' },
  { name: 'Support', icon: '💬' },
  { name: 'Loyalty', icon: '⭐' },
  { name: 'Top-Up', icon: '💰' },
  { name: 'Bill', icon: '📄' }
]

const toggleModuleModal = () => {
  console.log('Toggle clicked, current value:', showModuleModal.value)
  showModuleModal.value = !showModuleModal.value
  console.log('New value:', showModuleModal.value)
}

const closeModal = () => {
  showModuleModal.value = false
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <RouterLink to="/" class="navbar-logo">
        <span class="logo-icon">✈️</span>
        <span class="logo-text">TravelAPAP</span>
      </RouterLink>

      <div class="navbar-links">
        <RouterLink to="/property" class="nav-link">Properti</RouterLink>
        <RouterLink to="/bookings" class="nav-link">Pemesanan</RouterLink>
        <RouterLink to="/statistics" class="nav-link">Statistik</RouterLink>
        <button @click="toggleModuleModal" class="ganti-modul-btn">Ganti Modul</button>
      </div>
    </div>
  </nav>

  <!-- Module Selection Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showModuleModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Pilih Modul</h2>
            <button @click="closeModal" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="module-grid">
              <div v-for="module in modules" :key="module.name" class="module-card">
                <span class="module-icon">{{ module.icon }}</span>
                <span class="module-name">{{ module.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.navbar {
  background: var(--gradient-primary);
  padding: 1rem 0;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.navbar-logo:hover {
  transform: scale(1.05);
  background: none;
}

.logo-icon {
  font-size: 1.8rem;
}

.logo-text {
  letter-spacing: 0.5px;
}

.navbar-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 0;
  background: none;
}

.nav-link:hover {
  background: none;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.8);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.router-link-active {
  color: rgba(255, 255, 255, 1);
}

.nav-link.router-link-active::after {
  width: 100%;
}

.ganti-modul-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.ganti-modul-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}


@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .navbar-links {
    gap: 1rem;
    width: 100%;
    justify-content: center;
  }

  .navbar-logo {
    flex: 1;
    justify-content: flex-start;
  }

  .nav-link {
    font-size: 0.9rem;
  }

  .ganti-modul-btn {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }

  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .ganti-modul-btn {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }
}
</style>

<style>
/* Modal Styles - Unscoped for Teleport */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999 !important;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #1e1e1e;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid #3a3a3a;
}

/* Transition styles */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(30px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #3a3a3a;
}

.modal-header h2 {
  color: #e0e0e0;
  font-size: 1.75rem;
  margin: 0;
  background: linear-gradient(135deg, #d4a574 0%, #c9a961 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #a0a0a0;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(212, 165, 116, 0.1);
  color: #d4a574;
  transform: rotate(90deg);
}

.modal-body {
  padding: 0.5rem 0;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.module-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  background: rgba(212, 165, 116, 0.05);
  border: 2px solid #3a3a3a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-card:hover {
  background: rgba(212, 165, 116, 0.15);
  border-color: #d4a574;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(212, 165, 116, 0.2);
}

.module-icon {
  font-size: 2.5rem;
  transition: transform 0.3s ease;
}

.module-card:hover .module-icon {
  transform: scale(1.2);
}

.module-name {
  color: #e0e0e0;
  font-weight: 600;
  font-size: 0.95rem;
  text-align: center;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>
