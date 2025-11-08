import { apiClient } from './api'

export interface Booking {
  bookingID: string
  checkinDate: string
  checkoutDate: string
  totalDays: number
  totalPrice: number
  status: number
  customerID: string
  customerName: string
  customerEmail: string
  customerPhone: string
  isBreakfast: boolean
  refund: number
  extraPay: number
  capacity: number
  createdDate: string
  updatedDate: string
  propertyName?: string
  roomName?: string
  propertyID?: string
  roomTypeID?: string
  roomID?: string
}

export interface CreateBookingData {
  roomID: string
  roomName: string
  checkinDate: string
  checkoutDate: string
  customerID: string
  customerName: string
  customerEmail: string
  customerPhone: string
  isBreakfast: boolean
  capacity: number
}

export interface UpdateBookingData {
  bookingID: string
  propertyID: string
  roomTypeID: string
  roomID: string
  checkinDate: string
  checkoutDate: string
  customerID: string
  customerName: string
  customerEmail: string
  customerPhone: string
  isBreakfast: boolean
  capacity: number
}

export interface BookingStatusData {
  bookingID: string
}

const bookingService = {
  // GET all bookings
  getAllBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get('/bookings')
    return response.data.data // Extract data from BaseResponse
  },

  // GET booking detail
  getBookingDetail: async (id: string): Promise<Booking> => {
    const response = await apiClient.get(`/bookings/${id}`)
    return response.data.data // Extract data from BaseResponse
  },

  // GET create booking form
  getCreateBookingForm: async (roomId?: string) => {
    const url = roomId ? `/bookings/create/${roomId}` : '/bookings/create'
    const response = await apiClient.get(url)
    return response.data.data // Extract data from BaseResponse
  },

  // POST create booking
  createBooking: async (data: CreateBookingData): Promise<Booking> => {
    const response = await apiClient.post('/bookings/create', data)
    return response.data.data // Extract data from BaseResponse
  },

  // GET update booking form
  getUpdateBookingForm: async (id: string) => {
    const response = await apiClient.get(`/bookings/update/${id}`)
    return response.data.data // Extract data from BaseResponse
  },

  // PUT update booking
  updateBooking: async (data: UpdateBookingData): Promise<Booking> => {
    const response = await apiClient.put('/bookings/update', data)
    return response.data.data // Extract data from BaseResponse
  },

  // POST pay booking
  payBooking: async (data: BookingStatusData): Promise<void> => {
    await apiClient.post('/bookings/status/pay', data)
    // No return value needed
  },

  // POST cancel booking
  cancelBooking: async (data: BookingStatusData): Promise<void> => {
    await apiClient.post('/bookings/status/cancel', data)
    // No return value needed
  },

  // POST refund booking
  refundBooking: async (data: BookingStatusData): Promise<void> => {
    await apiClient.post('/bookings/status/refund', data)
    // No return value needed
  },

  // GET chart data
  getChartData: async (month: number, year: number) => {
    const response = await apiClient.get(`/bookings/chart?month=${month}&year=${year}`)
    return response.data.data // Extract data from BaseResponse
  },
}

export default bookingService
