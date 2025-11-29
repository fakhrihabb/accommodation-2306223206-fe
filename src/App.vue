<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import AppNavbar from './components/AppNavbar.vue'

const route = useRoute()

// Hide navbar on authentication pages
const showNavbar = computed(() => {
  const authPages = ['/login', '/register']
  return !authPages.includes(route.path)
})
</script>

<template>
  <AppNavbar v-if="showNavbar" />
  <RouterView />
</template>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
