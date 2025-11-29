# TravelAPAP Frontend Implementation Guide

## ✅ Completed Components

### 1. Foundation & Configuration
- ✅ API services (`src/services/api.ts`, `propertyService.ts`, `bookingService.ts`, `provinceService.ts`)
- ✅ Utility functions (`src/utils/helpers.ts`, `toast.ts`)
- ✅ Toast notifications setup
- ✅ Router configuration with all routes

### 2. Completed Pages
- ✅ **Dashboard** (`src/views/DashboardView.vue`) - Landing page with backend integration
- ✅ **Property List** (`src/views/PropertyView.vue`) - All properties with filters
- ✅ **Property Detail** (`src/views/PropertyDetailView.vue`) - Complete with room filtering, maintenance, delete

## 🔨 Pages to Implement

### Property Pages

#### 1. PropertyCreateView.vue
**Route**: `/property/create`
**Key Features**:
- Form with all property fields
- Province dropdown (use `provinceService`)
- Dynamic room type forms (can add/remove)
- Each room type has dynamic room forms
- Room type options based on property type (use `roomTypeOptions` from helpers)
- Validation: no empty fields, no duplicate property-roomtype-floor combination
- ID Generation as per spec

**Service Call**: `propertyService.createProperty(data)`

#### 2. PropertyUpdateView.vue
**Route**: `/property/update/:id`
**Key Features**:
- Pre-filled form with existing property data
- Can only update: propertyName, address, description, roomType details (capacity, price, description, facility)
- Cannot change: property type, province, owner info
- Validation: no empty fields

**Service Calls**:
- GET: `propertyService.getUpdatePropertyForm(id)`
- PUT: `propertyService.updateProperty(data)`

#### 3. PropertyAddRoomView.vue
**Route**: `/property/updateroom/:id`
**Key Features**:
- Add new room types to existing property
- Dynamic forms (same as create)
- Check for duplicate property-roomtype-floor
- Only works if property activeStatus = 1

**Service Calls**:
- GET: `propertyService.getAddRoomTypeForm(id)`
- POST: `propertyService.addRoomType(data)`

### Booking Pages

#### 4. BookingsView.vue
**Route**: `/bookings`
**Key Features**:
- Table showing all bookings
- Columns: Booking ID, Property Name, Room Name, Check-in, Check-out, Total Price, Status
- Filters: status dropdown, search (property name/room name)
- Status badges with colors
- On load: automatic status update (status 1/3 → 4 if check-in date passed, status 0 → 2)
- Link to detail page

**Service Call**: `bookingService.getAllBookings()`

**Status Update Logic** (do this on page load):
```typescript
const updateBookingStatuses = () => {
  const today = new Date()
  bookings.value.forEach(booking => {
    const checkinDate = new Date(booking.checkinDate)
    if (checkinDate <= today) {
      if (booking.status === 1) {
        // Status 1 becomes status 4 (Done)
      }
      if (booking.status === 3) {
        // Status 3: refund taken at check-in, becomes 4, income reduced by refund
      }
      if (booking.status === 0) {
        // Status 0: becomes cancelled (2), income reduced by amount paid
      }
    }
  })
}
```

#### 5. BookingDetailView.vue
**Route**: `/bookings/:id`
**Key Features**:
- Display all booking details
- Show status badge
- Buttons based on status:
  - Status 0: Pay (if extraPay = 0), Update, Cancel, Back
  - Status 0 (with extraPay): Pay, Cancel, Back
  - Status 1: Update, Cancel, Back
  - Status 2: Back only
  - Status 3: Refund, Cancel, Back
  - Status 4: Back only
- All action buttons open confirmation modals

**Service Calls**:
- GET: `bookingService.getBookingDetail(id)`
- Status changes: `payBooking`, `cancelBooking`, `refundBooking`

#### 6. BookingCreateView.vue
**Routes**: `/bookings/create` OR `/bookings/create/:roomId`
**Key Features**:
- Two modes: with room (from property detail) or without (select property/room)
- If with roomId: prefill room data, get check-in/check-out from query params
- If without: show dropdowns (property → room type → room), all cascading
- Date validation: check-out > check-in, minimum 1 day, check-in >= today
- No overlap with maintenance or other bookings
- Capacity validation
- Breakfast adds 50000/day to total
- Calculate totalDays and totalPrice
- Create with status = 0

**Service Calls**:
- GET: `bookingService.getCreateBookingForm(roomId?)`
- POST: `bookingService.createBooking(data)`

**Booking ID Format**: `BOOK-{last7digitsOfRoomID}-{datetime}`
Example: `BOOK-004-101-2025-10-24-10:38:12`

#### 7. BookingUpdateView.vue
**Route**: `/bookings/update/:id`
**Key Features**:
- Pre-filled form
- Can change: property, roomType, room, dates, customer info, breakfast, capacity
- Same validations as create
- If new price > old price: set extraPay, status → 0
- If new price < old price: set refund, status → 3
- Only bookings with extraPay = 0 and refund = 0 can update

**Service Calls**:
- GET: `bookingService.getUpdateBookingForm(id)`
- PUT: `bookingService.updateBooking(data)`

### Statistics Page

#### 8. StatisticsView.vue
**Route**: `/statistics`
**Key Features**:
- Month and Year dropdowns
- Bar chart showing property income for the selected month
- Only count bookings with status = 4 (Done)
- Use Chart.js/vue-chartjs
- Sort properties by income (highest first)

**Service Call**: `bookingService.getChartData(month, year)`

**Chart.js Implementation**:
```vue
<script setup>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = ref({
  labels: [], // property names
  datasets: [{
    label: 'Pendapatan Properti',
    data: [], // income values
    backgroundColor: 'rgba(0, 102, 204, 0.8)'
  }]
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: true },
    title: { display: true, text: 'Statistik Pendapatan Properti' }
  }
}
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>
```

## 🎨 Styling Guidelines

All pages follow the existing design system:

### Colors (from `main.css`)
- Primary Blue: `var(--primary-blue)` - #0066CC
- Primary Tosca: `var(--primary-tosca)` - #20B2AA
- Gradients: `var(--gradient-primary)`, `var(--gradient-light)`
- Text: `var(--text-primary)`, `var(--text-secondary)`
- Neutral: `var(--neutral-dark)`

### Common Components to Reuse

#### Button Styles
```css
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}
```

#### Form Styles
```css
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}
```

#### Modal Styles
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
```

## 📋 Implementation Checklist

### For Each Page:
- [ ] Create Vue file in `src/views/`
- [ ] Import necessary services and utilities
- [ ] Add TypeScript interfaces for form data
- [ ] Implement reactive form state
- [ ] Add validation logic
- [ ] Implement API calls with try-catch
- [ ] Show toast notifications for success/error
- [ ] Add loading states
- [ ] Style following the design system
- [ ] Add responsive design (mobile breakpoint: 768px)
- [ ] Test with backend API

## 🔧 Common Patterns

### API Call Pattern
```typescript
const submitForm = async () => {
  try {
    loading.value = true
    await someService.someMethod(formData.value)
    toast.success('Operasi berhasil')
    router.push('/target-page')
  } catch (error) {
    console.error('Error:', error)
    toast.error('Gagal melakukan operasi')
  } finally {
    loading.value = false
  }
}
```

### Dynamic Form Array Pattern
```typescript
const roomTypes = ref([{
  name: '',
  facility: '',
  capacity: 0,
  price: 0,
  floor: 0,
  unitCount: 1,
  description: '',
  listRoom: []
}])

const addRoomType = () => {
  roomTypes.value.push({ /* empty form */ })
}

const removeRoomType = (index: number) => {
  roomTypes.value.splice(index, 1)
}
```

### Validation Pattern
```typescript
const validate = () => {
  if (!formData.value.field) {
    toast.warning('Field tidak boleh kosong')
    return false
  }
  if (someCondition) {
    toast.error('Error message')
    return false
  }
  return true
}

const submit = async () => {
  if (!validate()) return
  // proceed with submission
}
```

## 🚀 Next Steps

1. Start with simpler pages (BookingsView, StatisticsView)
2. Then tackle forms (PropertyCreate, BookingCreate)
3. Complete update pages (PropertyUpdate, BookingUpdate)
4. Add PropertyAddRoomView last
5. Test all flows thoroughly
6. Ensure all toast notifications work
7. Test responsive design

## 📞 Backend API Reference

Base URLs:
- `{{base}}`: `http://localhost:8080`
- `{{base_api}}`: `http://localhost:8080/api`

All endpoints are already configured in the service files. Refer to `API.json` for request/response formats.

## ✨ Tips

- Use `console.log` liberally during development
- Test API calls with Postman first
- Validate forms before submission
- Always show loading states
- Use toast for all user feedback
- Follow the existing code patterns in completed pages
- Reuse styles from `PropertyView.vue` and `PropertyDetailView.vue`
