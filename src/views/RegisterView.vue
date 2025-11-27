<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Register to start booking accommodations
        </p>
      </div>

      <!-- Register Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <!-- Error Message -->
        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ errorMessage }}
              </h3>
            </div>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :disabled="isLoading"
            />
          </div>

          <!-- Full Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :disabled="isLoading"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :disabled="isLoading"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              minlength="6"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :disabled="isLoading"
            />
            <p class="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
          </div>

          <!-- Gender -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input
                  v-model="formData.gender"
                  type="radio"
                  :value="true"
                  class="form-radio h-4 w-4 text-indigo-600"
                  :disabled="isLoading"
                />
                <span class="ml-2">Male</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  v-model="formData.gender"
                  type="radio"
                  :value="false"
                  class="form-radio h-4 w-4 text-indigo-600"
                  :disabled="isLoading"
                />
                <span class="ml-2">Female</span>
              </label>
            </div>
          </div>

          <!-- Role -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">
              Register as
            </label>
            <select
              id="role"
              v-model="formData.role"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :disabled="isLoading"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="ACCOMMODATION_OWNER">Accommodation Owner</option>
            </select>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Creating account...</span>
            <span v-else>Create account</span>
          </button>
        </div>

        <!-- Login Link -->
        <div class="text-center">
          <router-link
            to="/login"
            class="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Already have an account? Sign in
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

// Form state
const formData = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
  gender: true, // Default to male
  role: 'CUSTOMER', // Default to customer
})

const isLoading = ref(false)
const errorMessage = ref('')

/**
 * Handle registration form submission
 *
 * Flow:
 * 1. Validate form fields
 * 2. Call backend /api/auth/register
 * 3. Store JWT token in cookie/localStorage
 * 4. Redirect back to originating service (or default page)
 */
async function handleRegister() {
  // Reset error
  errorMessage.value = ''

  // Validate fields
  if (!formData.username || !formData.name || !formData.email || !formData.password) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  if (formData.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }

  isLoading.value = true

  try {
    // Call register API
    const response = await register(formData)

    // Store token (production: cookie, development: localStorage)
    authStore.setToken(response.data.token)

    console.log('[Register] Registration successful:', response.data)

    // Get redirect URL from query parameter
    const redirectUrl = (route.query.redirect as string) || window.location.origin

    console.log('[Register] Redirecting to:', redirectUrl)

    // Redirect back to originating service
    window.location.href = redirectUrl
  } catch (error: any) {
    console.error('[Register] Registration failed:', error)
    errorMessage.value = error.message || 'Registration failed. Please try again.'
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
