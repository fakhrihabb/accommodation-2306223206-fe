<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Building, User, LogOut, Grid3x3 } from 'lucide-vue-next'

const router = useRouter()
const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleProfile = () => {
  closeDropdown()
  // TODO: Navigate to profile page when implemented
  console.log('Navigate to profile')
}

const handleChangeModule = () => {
  closeDropdown()
  // TODO: Navigate to module selector when implemented
  console.log('Change module')
}

const handleLogout = () => {
  closeDropdown()
  // TODO: Implement logout when auth is ready
  console.log('Logout')
  router.push('/')
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <RouterLink to="/" class="navbar-logo">
        <Building class="logo-icon" :size="28" />
        <div class="logo-text-container">
          <span class="logo-text">Akomodasi</span>
          <span class="logo-subtitle">TravelAPAP</span>
        </div>
      </RouterLink>

      <div class="navbar-right">
        <div class="navbar-links">
          <RouterLink to="/property" class="nav-link">Properti</RouterLink>
          <RouterLink to="/bookings" class="nav-link">Pemesanan</RouterLink>
          <RouterLink to="/statistics" class="nav-link">Statistik</RouterLink>
        </div>

        <div class="profile-dropdown" @click="toggleDropdown">
          <button class="profile-button">
            <User :size="20" />
          </button>

          <div v-if="isDropdownOpen" class="dropdown-menu">
            <button @click="handleProfile" class="dropdown-item">
              <User :size="18" />
              <span>Profil</span>
            </button>
            <button @click="handleChangeModule" class="dropdown-item">
              <Grid3x3 :size="18" />
              <span>Ganti Modul</span>
            </button>
            <div class="dropdown-divider"></div>
            <button @click="handleLogout" class="dropdown-item danger">
              <LogOut :size="18" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: var(--bg-dark);
  padding: 1rem 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
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
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-primary);
  transition: opacity 0.3s ease;
}

.navbar-logo:hover {
  opacity: 0.7;
  background: none;
}

.logo-icon {
  color: var(--primary-gold);
}

.logo-text-container {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: bold;
  letter-spacing: 0.5px;
  line-height: 1.2;
  background: linear-gradient(135deg, #d4a574 0%, #c9a961 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  font-size: 0.7rem;
  opacity: 0.7;
  font-weight: 400;
  letter-spacing: 0.3px;
  color: var(--text-secondary);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.navbar-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: var(--text-primary);
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
  color: var(--primary-gold);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #d4a574 0%, #c9a961 100%);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.router-link-active {
  color: var(--primary-gold);
}

.nav-link.router-link-active::after {
  width: 100%;
}

.profile-dropdown {
  position: relative;
}

.profile-button {
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(201, 169, 97, 0.1) 100%);
  border: 1.5px solid rgba(212, 165, 116, 0.3);
  color: var(--primary-gold);
  padding: 0.6rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.profile-button:hover {
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.15) 0%, rgba(201, 169, 97, 0.15) 100%);
  border-color: rgba(212, 165, 116, 0.4);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  min-width: 200px;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(212, 165, 116, 0.1);
}

.dropdown-item.danger {
  color: #ff6b6b;
}

.dropdown-item.danger:hover {
  background: rgba(255, 107, 107, 0.1);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
  }

  .navbar-right {
    gap: 1rem;
  }

  .navbar-links {
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.9rem;
  }

  .logo-text {
    font-size: 1.1rem;
  }

  .logo-subtitle {
    font-size: 0.65rem;
  }
}
</style>
