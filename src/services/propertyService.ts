import { apiClient, apiClientApi } from './api'

export interface Property {
  propertyID: string
  propertyName: string
  type: number
  propertyType?: number // For add room type form endpoint
  address: string
  province: number
  description: string
  totalRoom: number
  activeStatus: number
  income: number
  ownerName: string
  ownerID: string
  createdDate: string
  updatedDate: string
  listRoomType?: RoomType[]
}

export interface RoomType {
  roomTypeID: string
  name: string
  price: number
  description: string
  capacity: number
  facility: string
  floor: number
  listRoom?: Room[]
  createdDate: string
  updatedDate: string
}

export interface Room {
  roomID: string
  name: string
  availabilityStatus: number
  activeRoom: number
  maintenanceStart?: string
  maintenanceEnd?: string
  createdDate: string
  updatedDate: string
}

export interface CreatePropertyData {
  propertyName: string
  type: number
  province: number
  address: string
  description: string
  ownerID: string
  ownerName: string
  listRoomType: CreateRoomTypeData[]
}

export interface CreateRoomTypeData {
  name: string
  description: string
  price: number
  capacity: number
  facility: string
  floor: number
  unitCount: number
  listRoom: CreateRoomData[]
}

export interface CreateRoomData {
  name: string
  availabilityStatus: number
}

export interface UpdatePropertyData {
  propertyID: string
  propertyName: string
  address: string
  description: string
  listRoomType: UpdateRoomTypeData[]
}

export interface UpdateRoomTypeData {
  roomTypeID: string
  name: string
  capacity: number
  price: number
  description: string
  facility: string
  floor: number
}

export interface AddRoomTypeData {
  propertyID: string
  listRoomType: CreateRoomTypeData[]
}

export interface MaintenanceData {
  roomID: string
  propertyID: string
  maintenanceStart: string
  maintenanceEnd: string
}

const propertyService = {
  // GET all properties
  getAllProperties: async (): Promise<Property[]> => {
    const response = await apiClientApi.get('/property')
    return response.data.data // Extract data from BaseResponse
  },

  // GET property detail
  getPropertyDetail: async (id: string): Promise<Property> => {
    const response = await apiClientApi.get(`/property/${id}`)
    return response.data.data // Extract data from BaseResponse
  },

  // GET create property form data
  getCreatePropertyForm: async () => {
    const response = await apiClientApi.get('/property/create')
    return response.data.data // Extract data from BaseResponse
  },

  // POST create property
  createProperty: async (data: CreatePropertyData): Promise<Property> => {
    const response = await apiClientApi.post('/property/create', data)
    return response.data.data // Extract data from BaseResponse
  },

  // GET update property form data
  getUpdatePropertyForm: async (id: string) => {
    const response = await apiClientApi.get(`/property/update/${id}`)
    return response.data.data // Extract data from BaseResponse
  },

  // PUT update property
  updateProperty: async (data: UpdatePropertyData): Promise<Property> => {
    const response = await apiClientApi.put('/property/update', data)
    return response.data.data // Extract data from BaseResponse
  },

  // DELETE property (soft delete)
  deleteProperty: async (id: string): Promise<void> => {
    await apiClientApi.delete(`/property/delete/${id}`)
    // No return value needed
  },

  // GET add room type form
  getAddRoomTypeForm: async (propertyId: string) => {
    const response = await apiClientApi.get(`/property/updateroom/${propertyId}`)
    return response.data.data // Extract data from BaseResponse
  },

  // POST add room type
  addRoomType: async (data: AddRoomTypeData): Promise<void> => {
    await apiClientApi.post('/property/updateroom', data)
    // No return value needed
  },

  // POST create maintenance
  createMaintenance: async (data: MaintenanceData): Promise<void> => {
    await apiClientApi.post('/property/maintenance/add', data)
    // No return value needed
  },
}

export default propertyService
