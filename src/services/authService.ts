/**
 * Authentication Service
 *
 * Provides API calls for authentication operations:
 * - login: Authenticate user with credentials
 * - register: Create new user account
 * - validate: Verify JWT token validity
 */

import axios from 'axios'
import AUTH_CONFIG from '@/config/auth'

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  username: string
  name: string
  password: string
  email: string
  gender: boolean // true = male, false = female
  role: string // e.g., 'CUSTOMER', 'ACCOMMODATION_OWNER'
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
  status: number
  message: string
  data: {
    token: string
    type: string
    userId: string
    username: string
    email: string
    role: string
    name: string
  }
}

/**
 * Login user with credentials
 *
 * @param credentials Username and password
 * @returns Promise<AuthResponse> with JWT token and user info
 * @throws Error if login fails
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      `${AUTH_CONFIG.apiUrl}/api/auth/login`,
      credentials
    )

    if (response.data.status === 200) {
      return response.data
    } else {
      throw new Error(response.data.message || 'Login failed')
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Login failed')
    }
    throw new Error('Network error. Please check your connection.')
  }
}

/**
 * Register new user account
 *
 * @param userData User registration data
 * @returns Promise<AuthResponse> with JWT token and user info
 * @throws Error if registration fails
 */
export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      `${AUTH_CONFIG.apiUrl}/api/auth/register`,
      userData
    )

    if (response.data.status === 200 || response.data.status === 201) {
      return response.data
    } else {
      throw new Error(response.data.message || 'Registration failed')
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Registration failed')
    }
    throw new Error('Network error. Please check your connection.')
  }
}

/**
 * Validate JWT token with backend
 *
 * @param token JWT token to validate
 * @returns Promise<AuthResponse> with user info if valid
 * @throws Error if token is invalid
 */
export async function validateToken(token: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      `${AUTH_CONFIG.apiUrl}/api/auth/validate`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response.data.status === 200) {
      return response.data
    } else {
      throw new Error('Token validation failed')
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('Token expired or invalid')
    }
    throw new Error('Token validation failed')
  }
}
