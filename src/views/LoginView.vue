<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <h2 class="auth-title">Masuk ke Akun Anda</h2>
        <p class="auth-subtitle">Selamat datang di sistem pemesanan akomodasi</p>
      </div>

      <!-- Login Form -->
      <form class="auth-form" @submit.prevent="handleLogin">
        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          <p>{{ errorMessage }}</p>
        </div>

        <!-- Form Fields -->
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            name="username"
            type="text"
            autocomplete="username"
            required
            class="form-input"
            placeholder="Masukkan username"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="form-input"
            placeholder="Masukkan password"
            :disabled="isLoading"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="submit-button"
        >
          <span v-if="isLoading">Memproses...</span>
          <span v-else>Masuk</span>
        </button>

        <!-- Register Link -->
        <div class="auth-footer">
          <router-link to="/register" class="auth-link">
            Belum punya akun? Daftar di sini
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { login } from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// Form state
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''

  if (!username.value || !password.value) {
    errorMessage.value = 'Mohon masukkan username dan password'
    return
  }

  isLoading.value = true

  try {
    const response = await login({
      username: username.value,
      password: password.value,
    })

    authStore.setToken(response.data.token)

    if (import.meta.env.DEV) {
      console.log('[Login] Login successful:', response.data)
    }

    const redirectUrl = (route.query.redirect as string) || window.location.origin

    if (import.meta.env.DEV) {
      console.log('[Login] Redirecting to:', redirectUrl)
    }

    window.location.href = redirectUrl
  } catch (error: any) {
    console.error('[Login] Login failed:', error)
    errorMessage.value = error.response?.data?.message || 'Login gagal. Silakan coba lagi.'
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--bg-dark);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #d4a574 0%, #c9a961 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-message {
  padding: 1rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  color: #ff6b6b;
  font-size: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  padding: 0.75rem 1rem;
  background: var(--bg-dark);
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-gold);
  background: rgba(212, 165, 116, 0.05);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.submit-button {
  padding: 0.85rem 1.5rem;
  background: linear-gradient(135deg, #d4a574 0%, #c9a961 100%);
  border: none;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #c9a961 0%, #d4a574 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(212, 165, 116, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.auth-footer {
  text-align: center;
  margin-top: 0.5rem;
}

.auth-link {
  color: var(--primary-gold);
  text-decoration: none;
  font-size: 0.9rem;
  transition: opacity 0.3s ease;
}

.auth-link:hover {
  opacity: 0.7;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }

  .auth-title {
    font-size: 1.5rem;
  }

  .auth-subtitle {
    font-size: 0.85rem;
  }
}
</style>
