import axios from 'axios'

// Use environment variable with fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const apiClientApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add response interceptor for better error logging
const errorInterceptor = (error: any) => {
  if (error.response) {
    // Server responded with error status
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      url: error.config?.url,
      method: error.config?.method,
    })
  } else if (error.request) {
    // Request was made but no response received
    console.error('API No Response:', {
      url: error.config?.url,
      method: error.config?.method,
      message: `No response from server. Is the backend running on ${API_BASE_URL}?`,
    })
  } else {
    // Something else happened
    console.error('API Error:', error.message)
  }
  return Promise.reject(error)
}

apiClient.interceptors.response.use((response) => response, errorInterceptor)
apiClientApi.interceptors.response.use((response) => response, errorInterceptor)

export { apiClient, apiClientApi, API_BASE_URL }
