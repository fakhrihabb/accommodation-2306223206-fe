<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Plane } from 'lucide-vue-next'
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <RouterLink to="/" class="navbar-logo">
        <Plane class="logo-icon" :size="32" />
        <span class="logo-text">TravelAPAP</span>
      </RouterLink>

      <div class="navbar-links">
        <RouterLink to="/property" class="nav-link">Properti</RouterLink>
        <RouterLink to="/bookings" class="nav-link">Pemesanan</RouterLink>
        <RouterLink to="/statistics" class="nav-link">Statistik</RouterLink>
      </div>
    </div>
  </nav>
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
  color: white;
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
}
</style>
