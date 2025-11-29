<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <h2 class="auth-title">Buat Akun Baru</h2>
        <p class="auth-subtitle">Daftar untuk mulai memesan akomodasi</p>
      </div>

      <!-- Register Form -->
      <form class="auth-form" @submit.prevent="handleRegister">
        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          <p>{{ errorMessage }}</p>
        </div>

        <!-- Form Fields -->
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            class="form-input"
            placeholder="Masukkan username"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="name">Nama Lengkap</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="form-input"
            placeholder="Masukkan nama lengkap"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            class="form-input"
            placeholder="Masukkan email"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            minlength="6"
            class="form-input"
            placeholder="Masukkan password (min. 6 karakter)"
            :disabled="isLoading"
          />
          <span class="form-hint">Minimal 6 karakter</span>
        </div>

        <div class="form-group">
          <label>Jenis Kelamin</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                v-model="formData.gender"
                type="radio"
                :value="true"
                :disabled="isLoading"
              />
              <span>Laki-laki</span>
            </label>
            <label class="radio-option">
              <input
                v-model="formData.gender"
                type="radio"
                :value="false"
                :disabled="isLoading"
              />
              <span>Perempuan</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="role">Daftar Sebagai</label>
          <select
            id="role"
            v-model="formData.role"
            class="form-select"
            :disabled="isLoading"
          >
            <option value="CUSTOMER">Pelanggan</option>
            <option value="ACCOMMODATION_OWNER">Pemilik Akomodasi</option>
            <option value="FLIGHT_AIRLINE">Maskapai Penerbangan</option>
            <option value="RENTAL_VENDOR">Penyedia Rental Kendaraan</option>
            <option value="INSURANCE_PROVIDER">Penyedia Asuransi</option>
            <option value="TOUR_PACKAGE_VENDOR">Penyedia Paket Wisata</option>
            <option value="SUPERADMIN">Super Admin</option>
          </select>
        </div>

        <!-- Role-specific fields -->
        <transition name="fade">
          <!-- ACCOMMODATION_OWNER specific fields -->
          <div v-if="formData.role === 'ACCOMMODATION_OWNER'" class="role-specific-fields">
            <h3 class="role-section-title">Informasi Pemilik Akomodasi</h3>
            <div class="form-group">
              <label for="companyName">Nama Perusahaan</label>
              <input
                id="companyName"
                v-model="formData.companyName"
                type="text"
                class="form-input"
                placeholder="Masukkan nama perusahaan akomodasi"
                :disabled="isLoading"
              />
            </div>
            <div class="form-group">
              <label for="businessLicense">Nomor Izin Usaha</label>
              <input
                id="businessLicense"
                v-model="formData.businessLicense"
                type="text"
                class="form-input"
                placeholder="Masukkan nomor izin usaha"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- FLIGHT_AIRLINE specific fields -->
          <div v-else-if="formData.role === 'FLIGHT_AIRLINE'" class="role-specific-fields">
            <h3 class="role-section-title">Informasi Maskapai</h3>
            <div class="form-group">
              <label for="airlineName">Nama Maskapai</label>
              <input
                id="airlineName"
                v-model="formData.airlineName"
                type="text"
                class="form-input"
                placeholder="Masukkan nama maskapai"
                :disabled="isLoading"
              />
            </div>
            <div class="form-group">
              <label for="airlineCode">Kode Maskapai (IATA)</label>
              <input
                id="airlineCode"
                v-model="formData.airlineCode"
                type="text"
                maxlength="2"
                class="form-input"
                placeholder="Contoh: GA, QZ"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- RENTAL_VENDOR specific fields -->
          <div v-else-if="formData.role === 'RENTAL_VENDOR'" class="role-specific-fields">
            <h3 class="role-section-title">Informasi Penyedia Rental</h3>
            <div class="form-group">
              <label for="rentalCompanyName">Nama Perusahaan Rental</label>
              <input
                id="rentalCompanyName"
                v-model="formData.rentalCompanyName"
                type="text"
                class="form-input"
                placeholder="Masukkan nama perusahaan rental"
                :disabled="isLoading"
              />
            </div>
            <div class="form-group">
              <label for="vehicleTypes">Jenis Kendaraan</label>
              <input
                id="vehicleTypes"
                v-model="formData.vehicleTypes"
                type="text"
                class="form-input"
                placeholder="Contoh: Mobil, Motor, Bus"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- INSURANCE_PROVIDER specific fields -->
          <div v-else-if="formData.role === 'INSURANCE_PROVIDER'" class="role-specific-fields">
            <h3 class="role-section-title">Informasi Penyedia Asuransi</h3>
            <div class="form-group">
              <label for="insuranceCompanyName">Nama Perusahaan Asuransi</label>
              <input
                id="insuranceCompanyName"
                v-model="formData.insuranceCompanyName"
                type="text"
                class="form-input"
                placeholder="Masukkan nama perusahaan asuransi"
                :disabled="isLoading"
              />
            </div>
            <div class="form-group">
              <label for="licenseNumber">Nomor Lisensi OJK</label>
              <input
                id="licenseNumber"
                v-model="formData.licenseNumber"
                type="text"
                class="form-input"
                placeholder="Masukkan nomor lisensi OJK"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- TOUR_PACKAGE_VENDOR specific fields -->
          <div v-else-if="formData.role === 'TOUR_PACKAGE_VENDOR'" class="role-specific-fields">
            <h3 class="role-section-title">Informasi Penyedia Paket Wisata</h3>
            <div class="form-group">
              <label for="tourCompanyName">Nama Perusahaan Tour</label>
              <input
                id="tourCompanyName"
                v-model="formData.tourCompanyName"
                type="text"
                class="form-input"
                placeholder="Masukkan nama perusahaan tour"
                :disabled="isLoading"
              />
            </div>
            <div class="form-group">
              <label for="tourLicense">Nomor Izin Usaha Pariwisata</label>
              <input
                id="tourLicense"
                v-model="formData.tourLicense"
                type="text"
                class="form-input"
                placeholder="Masukkan nomor izin usaha pariwisata"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- SUPERADMIN specific fields -->
          <div v-else-if="formData.role === 'SUPERADMIN'" class="role-specific-fields">
            <h3 class="role-section-title">Verifikasi Admin</h3>
            <div class="form-group">
              <label for="adminKey">Kunci Admin</label>
              <input
                id="adminKey"
                v-model="formData.adminKey"
                type="password"
                class="form-input"
                placeholder="Masukkan kunci admin rahasia"
                :disabled="isLoading"
              />
              <span class="form-hint">Diperlukan kunci khusus untuk membuat akun admin</span>
            </div>
          </div>
        </transition>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="submit-button"
        >
          <span v-if="isLoading">Membuat akun...</span>
          <span v-else>Buat Akun</span>
        </button>

        <!-- Login Link -->
        <div class="auth-footer">
          <router-link to="/login" class="auth-link">
            Sudah punya akun? Masuk di sini
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { register } from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const formData = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
  gender: true,
  role: 'CUSTOMER',
  // Role-specific fields
  companyName: '',
  businessLicense: '',
  airlineName: '',
  airlineCode: '',
  rentalCompanyName: '',
  vehicleTypes: '',
  insuranceCompanyName: '',
  licenseNumber: '',
  tourCompanyName: '',
  tourLicense: '',
  adminKey: '',
})

const isLoading = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  errorMessage.value = ''

  if (!formData.username || !formData.name || !formData.email || !formData.password) {
    errorMessage.value = 'Mohon lengkapi semua field'
    return
  }

  if (formData.password.length < 6) {
    errorMessage.value = 'Password harus minimal 6 karakter'
    return
  }

  isLoading.value = true

  try {
    const response = await register(formData)
    authStore.setToken(response.data.token)

    if (import.meta.env.DEV) {
      console.log('[Register] Registration successful:', response.data)
    }

    const redirectUrl = (route.query.redirect as string) || window.location.origin

    if (import.meta.env.DEV) {
      console.log('[Register] Redirecting to:', redirectUrl)
    }

    window.location.href = redirectUrl
  } catch (error: any) {
    console.error('[Register] Registration failed:', error)
    errorMessage.value = error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.'
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
  max-width: 480px;
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
  gap: 1.25rem;
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

.form-input,
.form-select {
  padding: 0.75rem 1rem;
  background: var(--bg-dark);
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-gold);
  background: rgba(212, 165, 116, 0.05);
}

.form-input:disabled,
.form-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.form-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.radio-group {
  display: flex;
  gap: 1.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.radio-option input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-gold);
  cursor: pointer;
}

.radio-option input[type="radio"]:disabled {
  cursor: not-allowed;
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

  .auth-form {
    gap: 1rem;
  }
}

.role-specific-fields {
  padding: 1.5rem;
  background: rgba(212, 165, 116, 0.05);
  border: 1px solid rgba(212, 165, 116, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.role-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-gold);
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(212, 165, 116, 0.2);
}

/* Fade transition for role-specific fields */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
