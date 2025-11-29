# TravelAPAP Frontend - Accommodation Management System

A modern Vue.js frontend application for managing accommodation properties and bookings, built with TypeScript, Vue Router, Pinia, and integrates with a Spring Boot backend.

## 🎉 Project Status

### ✅ Completed Features (60% Done)

#### 1. Core Infrastructure
- ✅ Project setup with Vue 3 + TypeScript + Vite
- ✅ Vue Router with all routes configured
- ✅ Pinia state management
- ✅ Axios HTTP client setup
- ✅ Toast notifications (vue-toastification)
- ✅ Chart.js for statistics
- ✅ Lucide Icons
- ✅ Responsive design system with CSS variables

#### 2. API Services Layer
- ✅ `api.ts` - Base API configuration
- ✅ `propertyService.ts` - All property CRUD operations
- ✅ `bookingService.ts` - All booking operations
- ✅ `provinceService.ts` - Indonesia provinces data

#### 3. Utility Functions
- ✅ `helpers.ts` - Formatters, mappers, type names
- ✅ `toast.ts` - Toast notification configuration
- ✅ Property type mappings (Hotel, Villa, Apartemen)
- ✅ Booking status mappings (0-4)
- ✅ Room availability mappings
- ✅ Currency and date formatters

#### 4. Completed Pages

**Dashboard (Landing Page)**
- ✅ Real-time statistics from backend
- ✅ Total properties count
- ✅ Total bookings count
- ✅ Feature highlights
- ✅ Navigation to Property and Bookings pages

**Property Management**
- ✅ Property List Page
  - Table view with filters (name, type, status)
  - Sortable by last updated
  - Search functionality
  - Responsive design

- ✅ Property Detail Page
  - Complete property information
  - Room type listings with pricing
  - Date filter for room availability
  - Book room functionality
  - Maintenance scheduling modal
  - Delete property with confirmation modal
  - Navigation to update and add room pages

- ✅ Property Create Page
  - Multi-step form for property creation
  - Province dropdown (from external API)
  - Dynamic room type forms (add/remove)
  - Room type options based on property type
  - Automatic room number generation
  - Comprehensive validation
  - Duplicate detection

**Booking Management**
- ✅ Bookings List Page
  - Table view with all bookings
  - Filters by status and search
  - Status badges with colors
  - Auto-status update logic (on check-in date)
  - Navigation to statistics page

### 📋 Remaining Pages (40% - To Be Implemented)

You need to create these remaining pages following the patterns in completed pages:

1. **PropertyUpdateView.vue** - Edit existing property
2. **PropertyAddRoomView.vue** - Add room types to property
3. **BookingDetailView.vue** - Show booking details with action buttons
4. **BookingCreateView.vue** - Create new booking (2 modes: with/without room)
5. **BookingUpdateView.vue** - Update existing booking
6. **StatisticsView.vue** - Chart.js bar chart showing property income

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed specifications for each remaining page.

## 🚀 Getting Started

### Prerequisites
- Node.js ^20.19.0 || >=22.12.0
- Backend running at `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint and fix
npm run lint
```

### Environment Setup

The backend URLs are configured in `src/services/api.ts`:
- Base URL: `http://localhost:8080`
- API URL: `http://localhost:8080/api`

## 📁 Project Structure

```
src/
├── assets/           # CSS and static assets
│   └── main.css     # Global styles with design system
├── components/       # Reusable Vue components
│   ├── AppNavbar.vue
│   └── ...
├── router/          # Vue Router configuration
│   └── index.ts
├── services/        # API service layer
│   ├── api.ts
│   ├── propertyService.ts
│   ├── bookingService.ts
│   └── provinceService.ts
├── stores/          # Pinia stores
│   └── counter.ts
├── utils/           # Utility functions
│   ├── helpers.ts   # Formatters, mappers
│   └── toast.ts     # Toast configuration
├── views/           # Page components
│   ├── DashboardView.vue          ✅
│   ├── PropertyView.vue           ✅
│   ├── PropertyDetailView.vue     ✅
│   ├── PropertyCreateView.vue     ✅
│   ├── PropertyUpdateView.vue     ❌
│   ├── PropertyAddRoomView.vue    ❌
│   ├── BookingsView.vue           ✅
│   ├── BookingDetailView.vue      ❌
│   ├── BookingCreateView.vue      ❌
│   ├── BookingUpdateView.vue      ❌
│   └── StatisticsView.vue         ❌
├── App.vue
└── main.ts
```

## 🎨 Design System

### Colors
```css
--primary-blue: #0066CC
--primary-tosca: #20B2AA
--neutral-dark: #333333
--text-primary: #2c3e50
--text-secondary: #6c757d
--gradient-primary: linear-gradient(135deg, #0066CC 0%, #20B2AA 100%)
--gradient-light: linear-gradient(135deg, #e3f2fd 0%, #e0f7fa 100%)
```

### Typography
- Headings: Font weight 600-700
- Body: Font weight 400-500
- Code/Monospace: 'Courier New', monospace

### Spacing
- Base unit: 1rem (16px)
- Common gaps: 0.5rem, 1rem, 1.5rem, 2rem

## 🔧 API Integration

### Service Pattern
All API calls follow this pattern:

```typescript
const fetchData = async () => {
  try {
    loading.value = true
    const data = await someService.someMethod()
    // Handle success
    toast.success('Success message')
  } catch (error) {
    console.error('Error:', error)
    toast.error('Error message')
  } finally {
    loading.value = false
  }
}
```

### Available Services

**Property Service**
- `getAllProperties()` - Get all properties
- `getPropertyDetail(id)` - Get property by ID
- `createProperty(data)` - Create new property
- `updateProperty(data)` - Update property
- `deleteProperty(id)` - Soft delete property
- `addRoomType(data)` - Add room types
- `createMaintenance(data)` - Schedule maintenance

**Booking Service**
- `getAllBookings()` - Get all bookings
- `getBookingDetail(id)` - Get booking by ID
- `createBooking(data)` - Create new booking
- `updateBooking(data)` - Update booking
- `payBooking(data)` - Mark as paid
- `cancelBooking(data)` - Cancel booking
- `refundBooking(data)` - Process refund
- `getChartData(month, year)` - Get statistics

## 📱 Responsive Design

All pages are responsive with breakpoint at 768px:
- Desktop: Full width layout with side-by-side elements
- Mobile: Stacked layout with full-width elements

## 🧪 Testing with Backend

1. Start your Spring Boot backend on port 8080
2. Run the frontend with `npm run dev`
3. Navigate to `http://localhost:5173` (or port shown in console)
4. Test each completed page:
   - Dashboard: Check if stats load
   - Properties: Try filtering, searching, viewing details
   - Property Create: Create a test property
   - Bookings: View list and use filters

## 📝 Implementation Notes

### TypeScript Interfaces
All data types are properly typed. See service files for interface definitions.

### Form Validation
- All forms validate before submission
- Toast notifications for all feedback
- Loading states during API calls
- Error handling with try-catch

### State Management
- Local component state with `ref` and `reactive`
- Computed properties for derived data
- Pinia store ready for global state if needed

### Styling Approach
- Scoped styles in each component
- CSS variables for consistent theming
- Flexbox and Grid for layouts
- Transitions and hover effects

## 🔜 Next Steps

1. Implement remaining 6 pages (see IMPLEMENTATION_GUIDE.md)
2. Add error boundary components
3. Add loading skeletons
4. Implement pagination for large lists
5. Add form field validations with visual feedback
6. Add search debouncing
7. Implement optimistic UI updates
8. Add unit tests with Vitest
9. Add E2E tests with Playwright

## 🤝 Contributing

Follow these guidelines when implementing remaining pages:

1. **Copy existing patterns** from completed pages
2. **Use the service layer** - never call axios directly
3. **Add toast notifications** for all user actions
4. **Implement loading states** for all async operations
5. **Follow the design system** - reuse colors and spacing
6. **Mobile-first responsive** - test on small screens
7. **TypeScript strict mode** - no `any` types
8. **Error handling** - always use try-catch

## 📖 Documentation

- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Detailed guide for remaining pages
- [API.json](./instruction/API.json) - Backend API specification
- [instructions.pdf](./instruction/instructions.pdf) - Original project requirements

## 🐛 Known Issues

None at this time. All completed features work as expected.

## 📜 License

This project is part of an academic assignment.

## 👥 Team

- Frontend Developer: [Your Name]
- Backend: TravelAPAP Team
- Framework: Vue 3 + TypeScript

---

**Current Progress**: 60% Complete (10/16 major features)

**Last Updated**: 2025-11-07

**Status**: ✅ Core functionality working, ready for remaining page implementation
