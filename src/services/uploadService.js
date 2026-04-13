import api from './api'

export const uploadService = {
  async uploadProfilePhoto(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const r = await api.post('/Uploads/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return r.data
  }
}
