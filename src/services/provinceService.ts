import axios from 'axios'

export interface Province {
  kode: string
  nama: string
}

const provinceService = {
  getProvinces: async (): Promise<Province[]> => {
    try {
      const response = await axios.get('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      return response.data.map((province: { id: string; name: string }) => ({
        kode: province.id,
        nama: province.name,
      }))
    } catch (error) {
      console.error('Error fetching provinces:', error)
      return []
    }
  },
}

export default provinceService
