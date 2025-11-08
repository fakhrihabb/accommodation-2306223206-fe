import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    // Property routes
    {
      path: '/property',
      name: 'property',
      component: () => import('../views/PropertyView.vue'),
    },
    {
      path: '/property/create',
      name: 'property-create',
      component: () => import('../views/PropertyCreateView.vue'),
    },
    {
      path: '/property/:id',
      name: 'property-detail',
      component: () => import('../views/PropertyDetailView.vue'),
    },
    {
      path: '/property/update/:id',
      name: 'property-update',
      component: () => import('../views/PropertyUpdateView.vue'),
    },
    {
      path: '/property/updateroom/:id',
      name: 'property-add-room',
      component: () => import('../views/PropertyAddRoomView.vue'),
    },
    // Booking routes
    {
      path: '/bookings',
      name: 'bookings',
      component: () => import('../views/BookingsView.vue'),
    },
    {
      path: '/bookings/create',
      name: 'booking-create',
      component: () => import('../views/BookingCreateView.vue'),
    },
    {
      path: '/bookings/create/:roomId',
      name: 'booking-create-room',
      component: () => import('../views/BookingCreateView.vue'),
    },
    {
      path: '/bookings/:id',
      name: 'booking-detail',
      component: () => import('../views/BookingDetailView.vue'),
    },
    {
      path: '/bookings/update/:id',
      name: 'booking-update',
      component: () => import('../views/BookingUpdateView.vue'),
    },
    // Statistics routes
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/StatisticsView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
