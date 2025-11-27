<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Welcome to the accommodation booking system
        </p>
      </div>

      <!-- Login Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
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
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Username</label>
            <input
              id="username"
              v-model="username"
              name="username"
              type="text"
              autocomplete="username"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Username"
              :disabled="isLoading"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Logging in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>

        <!-- Register Link -->
        <div class="text-center">
          <router-link
            to="/register"
            class="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Don't have an account? Register here
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
import AUTH_CONFIG from '@/config/auth'

const route = useRoute()
const authStore = useAuthStore()

// Form state
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

/**
 * Handle login form submission
 *
 * Flow:
 * 1. Validate form fields
 * 2. Call backend /api/auth/login
 * 3. Store JWT token in cookie/localStorage
 * 4. Redirect back to originating service (or default page)
 */
async function handleLogin() {
  // Reset error
  errorMessage.value = ''

  // Validate fields
  if (!username.value || !password.value) {
    errorMessage.value = 'Please enter username and password'
    return
  }

  isLoading.value = true

  try {
    // Call login API
    const response = await login({
      username: username.value,
      password: password.value,
    })

    // Store token (production: cookie, development: localStorage)
    authStore.setToken(response.data.token)

    console.log('[Login] Login successful:', response.data)

    // Get redirect URL from query parameter
    const redirectUrl = (route.query.redirect as string) || window.location.origin

    console.log('[Login] Redirecting to:', redirectUrl)

    // Redirect back to originating service
    // In production (cookie mode): Cookie is already set, just redirect
    // In development (localStorage mode): Token is in localStorage, redirect will work
    window.location.href = redirectUrl
  } catch (error: any) {
    console.error('[Login] Login failed:', error)
    errorMessage.value = error.message || 'Login failed. Please try again.'
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
