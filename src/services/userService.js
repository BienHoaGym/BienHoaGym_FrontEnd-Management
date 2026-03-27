import api from './api'

export const userService = {
  async getAll() {
    const r = await api.get('/Users')
    return r.data
  },

  async getById(id) {
    const r = await api.get(`/Users/${id}`)
    return r.data
  },

  async create(dto) {
    const r = await api.post('/Users', dto)
    return r.data
  },

  async update(id, dto) {
    const r = await api.put(`/Users/${id}`, dto)
    return r.data
  },

  async setUserRoles(userId, roles) {
    const r = await api.post(`/Users/${userId}/roles`, roles)
    return r.data
  }
}
