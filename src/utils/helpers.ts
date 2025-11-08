// Property type mapping
export const propertyTypes = {
  1: 'Hotel',
  2: 'Villa',
  3: 'Apartemen',
}

// Property status mapping
export const propertyStatusMap = {
  0: 'Tidak Aktif',
  1: 'Aktif',
}

// Booking status mapping
export const bookingStatusMap = {
  0: 'Menunggu Pembayaran',
  1: 'Pembayaran Dikonfirmasi',
  2: 'Dibatalkan',
  3: 'Permintaan Refund',
  4: 'Selesai',
}

// Room availability mapping
export const roomAvailabilityMap = {
  0: 'Tidak Tersedia',
  1: 'Tersedia',
}

// Room type options by property type
export const roomTypeOptions = {
  1: ['Single Room', 'Double Room', 'Deluxe Room', 'Superior Room', 'Suite', 'Family Room'],
  2: ['Luxury', 'Beachfront', 'Mountside', 'Eco-friendly', 'Romantic'],
  3: ['Studio', '1BR', '2BR', '3BR', 'Penthouse'],
}

// Format currency (IDR)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format date
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format date time
export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format date for input
export function formatDateForInput(date: string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format datetime for input
export function formatDateTimeForInput(date: string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Get property type name
export function getPropertyTypeName(type: number): string {
  return propertyTypes[type as keyof typeof propertyTypes] || 'Unknown'
}

// Get property status name
export function getPropertyStatusName(status: number): string {
  return propertyStatusMap[status as keyof typeof propertyStatusMap] || 'Unknown'
}

// Get booking status name
export function getBookingStatusName(status: number): string {
  return bookingStatusMap[status as keyof typeof bookingStatusMap] || 'Unknown'
}

// Get room availability name
export function getRoomAvailabilityName(status: number): string {
  return roomAvailabilityMap[status as keyof typeof roomAvailabilityMap] || 'Unknown'
}

// Calculate total days between two dates
export function calculateTotalDays(checkinDate: string, checkoutDate: string): number {
  const checkin = new Date(checkinDate)
  const checkout = new Date(checkoutDate)
  const diffTime = Math.abs(checkout.getTime() - checkin.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}
